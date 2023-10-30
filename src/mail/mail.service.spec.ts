import { Test } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

const mockSendEmail = jest.fn();
const getMockMailerService = () => ({ sendMail: mockSendEmail });

const TEST_FRONT_URL = 'test-front-url';

describe('MailService', () => {
  let mailService: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailerService, useValue: getMockMailerService() },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'FRONT_URL') {
                return TEST_FRONT_URL;
              }

              return null;
            }),
          },
        },
      ],
    }).compile();
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(mailService).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should call send email', () => {
      const sendVerificationEmail = {
        email: 'email',
        code: 'code',
      };
      const testConfirmLink = `${TEST_FRONT_URL}/confirm?code=${sendVerificationEmail.code}`;

      mailService.sendVerificationEmail(
        sendVerificationEmail.email,
        sendVerificationEmail.code,
      );

      expect(mockSendEmail).toHaveBeenCalledTimes(1);
      expect(mockSendEmail).toHaveBeenCalledWith({
        to: sendVerificationEmail.email,
        from: 'noreplay@uber-clone.com',
        subject: 'Please verify your email <Uber Eats>',
        html: `
          Welcome!
          <br />
          Thanks for signing up with Uber Eats!
          <br />
          You must follow this link to confirm your account:
          <br />
          <a href="${testConfirmLink}" target="_blank">${testConfirmLink}</a>
        `,
      });
    });
  });
});
