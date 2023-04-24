import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entitiy';
import { JwtService } from '@src/jwt/jwt.service';
import { MailService } from '@src/mail/mail.service';
import { Repository } from 'typeorm';

const getMockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let usersService: UsersService;
  let mailService: MailService;
  let jwtService: JwtService;
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: getMockRepository() },
        {
          provide: getRepositoryToken(Verification),
          useValue: getMockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();
    usersService = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
  });

  it('should be defined.', () => {
    expect(usersService).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'test@test.com',
      password: '12345',
      role: 0,
    };
    it('shoud be fail if user exits.', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
      });
      const result = await usersService.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with that email already',
      });
    });

    it('should create a new user.', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationsRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationsRepository.save.mockReturnValue({
        code: '123456',
      });

      const result = await usersService.createAccount(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );

      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception.', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());

      const result = await usersService.createAccount(createAccountArgs);

      expect(result).toEqual({ ok: false, error: "Couldn't create account" });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'test@test.com',
      password: '12345',
    };
    it('should fail if user does not exist.', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await usersService.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginArgs.email },
        select: ['password', 'id'],
      });

      expect(result).toEqual({
        ok: false,
        error: 'User not found.',
      });
    });

    it('should fail if password is wrong.', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);

      const result = await usersService.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockedUser.checkPassword).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        ok: false,
        error: 'Wrong password.',
      });
    });

    it('should return token if password correct.', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);

      const result = await usersService.login(loginArgs);

      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(mockedUser.id);

      expect(result).toEqual({ ok: true, token: 'signed-token' });
    });

    it('should fail on exception.', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());

      const result = await usersService.login(loginArgs);

      expect(result).toEqual({ ok: false, error: "Can't log user in." });
    });
  });

  describe('findById', () => {
    const user = { id: 1 };
    it('should find an existing user.', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(user);

      const result = await usersService.findById(1);

      expect(result).toEqual({ ok: true, user });
    });

    it('should fail if no user is found.', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());

      const result = await usersService.findById(1);

      expect(result).toEqual({
        ok: false,
        error: 'User Not Found.',
      });
    });
  });
  it.todo('editProfile');
  it.todo('verifyEmail');
});
