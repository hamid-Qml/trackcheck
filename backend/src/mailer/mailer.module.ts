// src/mailer/mailer.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import mailConfig from 'src/config/mail.config';
import { MailerService } from './mailer.service';

@Module({
  imports: [ConfigModule.forFeature(mailConfig)],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
