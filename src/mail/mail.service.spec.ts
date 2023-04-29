import { Test } from '@nestjs/testing';
import { MailService } from './mail.service';
import { CONFIG_OPTIONS } from '@src/common/common.contants';
import * as FormData from 'form-data';
import got from 'got';

const TEST_DOMAIN = 'test-domain';

jest.mock('got');
jest.mock('form-data');

describe('MailService', () => {
  let mailService: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'test-apiKey',
            domain: TEST_DOMAIN,
            fromEmail: 'test-fromEmail',
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
      jest.spyOn(mailService, 'sendEmail').mockImplementation(async () => true);
      mailService.sendVerificationEmail(
        sendVerificationEmail.email,
        sendVerificationEmail.code,
      );
      expect(mailService.sendEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendEmail).toHaveBeenCalledWith({
        subject: 'Verify Your Email',
        template: 'verify-email',
        to: sendVerificationEmail.email,
        emailVars: [
          { key: 'username', value: sendVerificationEmail.email },
          { key: 'code', value: sendVerificationEmail.code },
        ],
      });
    });
  });

  describe('sendEmail', () => {
    it('sends email', async () => {
      const spyFormDataAppend = jest.spyOn(FormData.prototype, 'append');

      const result = await mailService.sendEmail({
        subject: 'Verify Your Email',
        template: 'verify-email',
        to: 'email',
        emailVars: [
          { key: 'username', value: 'email' },
          { key: 'code', value: 'code' },
        ],
      });

      expect(spyFormDataAppend).toHaveBeenCalledTimes(6);
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
        expect.any(Object),
      );

      expect(result).toEqual(true);
    });

    it('fails on error', async () => {
      jest.spyOn(got, 'post').mockRejectedValue(new Error());

      const result = await mailService.sendEmail({
        subject: 'Verify Your Email',
        template: 'verify-email',
        to: 'email',
        emailVars: [
          { key: 'username', value: 'email' },
          { key: 'code', value: 'code' },
        ],
      });

      expect(result).toEqual(false);
    });
  });
});
