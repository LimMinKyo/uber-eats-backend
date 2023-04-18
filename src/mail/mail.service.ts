import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from '@src/common/common.contants';
import got from 'got';
import { EmailVar, MailModuleOptions } from './mail.interfaces';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail({
      subject: 'Verify Your Email',
      template: 'verify-email',
      to: email,
      emailVars: [
        { key: 'username', value: email },
        { key: 'code', value: code },
      ],
    });
  }

  private async sendEmail({
    subject,
    template,
    to,
    emailVars,
  }: {
    subject: string;
    template: string;
    to: string;
    emailVars: EmailVar[];
  }) {
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('from', `Uber Eats <mailgun@${this.options.domain}>`);
    formData.append('to', to);
    formData.append('template', template);
    emailVars.forEach(({ key, value }) => formData.append(`v:${key}`, value));

    await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `api:${this.options.apiKey}`,
        ).toString('base64')}`,
      },
      body: formData,
    });
  }
}
