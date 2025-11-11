// src/config/mail.config.ts
import { registerAs } from '@nestjs/config';
export default registerAs('mail', () => ({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT!),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER!,
  pass: process.env.SMTP_PASS!,
  appBaseUrl: process.env.APP_BASE_URL!, // e.g. https://your-frontend.example
}));
