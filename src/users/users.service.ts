import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from '@src/jwt/jwt.service';
import { UpdateProfileInput } from './dtos/update-profile.dto';
import { Verification } from './entities/verification.entitiy';
import { VerifyEmailOutput } from './dtos/verify-email.dto';

export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationsRepository: Repository<Verification>,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount(createAccountInput: CreateAccountInput) {
    const { email } = createAccountInput;
    try {
      const exists = await this.usersRepository.findOne({ where: { email } });
      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      }
      const user = await this.usersRepository.save(
        this.usersRepository.create(createAccountInput),
      );
      await this.verificationsRepository.save(
        this.verificationsRepository.create({ user }),
      );
      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async login({ email, password }: LoginInput) {
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
        error,
      };
    }
  }

  findById(userId: number) {
    return this.usersRepository.findOne({ where: { id: userId } });
  }

  async updateProfile(
    userId: number,
    { email, password }: UpdateProfileInput,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (email) {
      user.email = email;
      user.verified = false;
      this.verificationsRepository.save(
        this.verificationsRepository.create({ user }),
      );
    }
    if (password) {
      user.password = password;
    }
    return this.usersRepository.save(user);
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verificationsRepository.findOne({
        where: { code },
        relations: ['user'],
      });
      if (verification) {
        verification.user.verified = true;
        this.usersRepository.save(verification.user);
        return {
          ok: true,
        };
      }
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
