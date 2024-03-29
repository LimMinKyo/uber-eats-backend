import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import { User } from '@src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Verification } from '@src/users/entities/verification.entity';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';

const testUser = {
  email: 'test@test.com',
  password: '12345',
};

describe('UsersModule (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let verificationsRepository: Repository<Verification>;
  let jwtToken: string;

  const getBaseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const getPublicTest = (query: string) => getBaseTest().send({ query });
  const getPrivateTest = (query: string) =>
    getBaseTest().set('X-JWT', jwtToken).send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
    await app.init();
  });

  afterAll(async () => {
    const dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    const connection = await dataSource.initialize();
    await connection.dropDatabase();
    await connection.destroy();
    await app.close();
  });

  describe('createAccount', () => {
    it('should create account.', () => {
      return getPublicTest(`
          mutation {
            createAccount(input: {
              email: "${testUser.email}",
              password: "${testUser.password}",
              role: Owner
            }) {
              ok,
              error
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { createAccount },
            },
          } = res;
          expect(createAccount.ok).toBe(true);
          expect(createAccount.error).toBe(null);
        });
    });

    it('should fail if account already exists.', () => {
      return getPublicTest(`
          mutation {
            createAccount(input: {
              email: "${testUser.email}",
              password: "${testUser.password}",
              role: Owner
            }) {
              ok,
              error
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { createAccount },
            },
          } = res;
          expect(createAccount.ok).toBe(false);
          expect(createAccount.error).toEqual(
            'There is a user with that email already',
          );
        });
    });
  });

  describe('login', () => {
    it('should login with correct credentials.', () => {
      return getPublicTest(`
          mutation {
            login(input: {
              email: "${testUser.email}",
              password: "${testUser.password}"
            }) {
              ok,
              error,
              token
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(true);
          expect(login.error).toEqual(null);
          expect(login.token).toEqual(expect.any(String));
          jwtToken = login.token;
        });
    });
    it('should not be able to login with wrong credentials.', () => {
      return getPublicTest(`
          mutation {
            login(input: {
              email: "${testUser.email}",
              password: "xxx"
            }) {
              ok,
              error,
              token
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(false);
          expect(login.error).toEqual('Wrong password.');
          expect(login.token).toEqual(null);
        });
    });
  });

  describe('userProfile', () => {
    let userId: number;
    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });

    it(`should find a user's profile`, () => {
      return getPrivateTest(`
          {
            userProfile(userId: ${userId}) {
              ok,
              error,
              user {
                id
              }
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(user.id).toBe(userId);
        });
    });
    it(`should not find a user's profile`, () => {
      return getPrivateTest(`
          {
            userProfile(userId: 666) {
              ok,
              error,
              user {
                id
              }
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('User Not Found.');
          expect(user).toBe(null);
        });
    });
  });

  describe('me', () => {
    it('should find my profile.', () => {
      return getPrivateTest(`
          {
            me {
              email
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(testUser.email);
        });
    });

    it('should not allow logged out user.', () => {
      return getPublicTest(`
          {
            me {
              email
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              errors: [error],
            },
          } = res;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });

  describe('updateProfile', () => {
    const NEW_EMAIL = 'test@new.com';
    const NEW_PASSWORD = 'new123';

    it('should change email.', () => {
      return getPrivateTest(`
          mutation {
            updateProfile(input: {
              email: "${NEW_EMAIL}"
            }) {
              ok,
              error
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                updateProfile: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });

    it('should have new email.', () => {
      return getPrivateTest(`
          {
            me {
              email
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(NEW_EMAIL);
        });
    });

    it('should not change email if email is already exists.', () => {
      return getPrivateTest(`
          mutation {
            updateProfile(input: {
              email: "${NEW_EMAIL}"
            }) {
              ok,
              error
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                updateProfile: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('email is already exists.');
        });
    });

    it('should change password.', () => {
      return getPrivateTest(`
          mutation {
            updateProfile(input: {
              password: "${NEW_PASSWORD}"
            }) {
              ok,
              error
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                updateProfile: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
  });

  describe('verifyEmail', () => {
    let verificationCode: string;

    beforeAll(async () => {
      const [verification] = await verificationsRepository.find();
      verificationCode = verification.code;
    });

    it('should verify email.', () => {
      return getPublicTest(`
          mutation {
            verifyEmail(input:{
              code: "${verificationCode}"
            }) {
              ok,
              error
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should fail on verification code not found.', () => {
      return getPublicTest(`
          mutation {
            verifyEmail(input:{
              code: "xxx"
            }) {
              ok,
              error
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('Verification not found.');
        });
    });
  });
});
