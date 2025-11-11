// src/mailer/mailer.service.ts
import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import mailConfig from 'src/config/mail.config';
import { type ConfigType } from '@nestjs/config';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor(
    @Inject(mailConfig.KEY) private cfg: ConfigType<typeof mailConfig>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.cfg.host,
      port: this.cfg.port,
      secure: this.cfg.secure,
      auth: { user: this.cfg.user, pass: this.cfg.pass },
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    const info = await this.transporter.sendMail({
      from: `"Support" <${this.cfg.user}>`,
      to,
      subject: 'Reset your password',
      text: `Click the link to reset your password: ${resetLink}`,
      html: `<p>Click the link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    });
    return info;
  }
}
