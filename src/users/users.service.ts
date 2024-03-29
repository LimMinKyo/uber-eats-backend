import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from '@src/jwt/jwt.service';
import {
  UpdateProfileInput,
  UpdateProfileOutput,
} from './dtos/update-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { MailService } from '@src/mail/mail.service';

export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationsRepository: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount(
    createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    const { email } = createAccountInput;
    try {
      const exists = await this.usersRepository.findOne({ where: { email } });
      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      }
      const user = await this.usersRepository.save(
        this.usersRepository.create(createAccountInput),
      );
      const verification = await this.verificationsRepository.save(
        this.verificationsRepository.create({ user }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.usersRepository.findOne({
        where: { email },
        select: ['password', 'id'],
      });

      if (!user) {
        return {
          ok: false,
          error: 'User not found.',
        };
      }

      const passwordCorrect = await user.checkPassword(password);

      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password.',
        };
      }

      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error: "Can't log user in.",
      };
    }
  }

  async findById(userId: number): Promise<UserProfileOutput> {
    try {
      const user = await this.usersRepository.findOneOrFail({
        where: { id: userId },
      });
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'User Not Found.',
      };
    }
  }

  async updateProfile(
    userId: number,
    { email, password }: UpdateProfileInput,
  ): Promise<UpdateProfileOutput> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });
      if (email) {
        const countedUser = await this.usersRepository.count({
          where: { email },
        });
        if (countedUser !== 0) {
          return { ok: false, error: 'email is already exists.' };
        }
        user.email = email;
        user.verified = false;
        await this.verificationsRepository.delete({ user: { id: user.id } });
        const verification = await this.verificationsRepository.save(
          this.verificationsRepository.create({ user }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) {
        user.password = password;
      }
      await this.usersRepository.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not update profile.',
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verificationsRepository.findOne({
        where: { code },
        relations: ['user'],
      });
      if (verification) {
        verification.user.verified = true;
        await this.usersRepository.save(verification.user);
        await this.verificationsRepository.delete(verification.id);
        return {
          ok: true,
        };
      }
      return { ok: false, error: 'Verification not found.' };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not verify email.',
      };
    }
  }
}
