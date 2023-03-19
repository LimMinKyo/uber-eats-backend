import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { User } from './entities/user.entity';

export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createAccount(createAccountInput: CreateAccountInput) {
    const { email } = createAccountInput;
    try {
      const exists = await this.usersRepository.findOne({ where: { email } });
      if (exists) {
        return 'There is a user with that email already';
      }
      const newUser = this.usersRepository.create(createAccountInput);
      this.usersRepository.save(newUser);
    } catch (error) {
      return "Couldn't create account";
    }
  }
}
