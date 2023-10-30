import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async sendVerificationEmail(email: string, code: string) {
    const FRONT_URL = this.configService.get('FRONT_URL');
    const confirmLink = `${FRONT_URL}/confirm?code=${code}`;

    await this.mailerService.sendMail({
      to: email,
      from: 'noreplay@uber-clone.com',
      subject: 'Please verify your email <Uber Eats>',
      html: `
          Welcome!
          <br />
          Thanks for signing up with Uber Eats!
          <br />
          You must follow this link to confirm your account:
          <br />
          <a href="${confirmLink}" target="_blank">${confirmLink}</a>
        `,
    });
    return true;
  }
}
