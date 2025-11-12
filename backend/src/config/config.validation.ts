// src/config/config.validation.ts
import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(8000),

  // Database (example)
  DATABASE_URL: Joi.string().uri().required(),

  // Auth
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),

  BCRYPT_SALT_ROUNDS: Joi.number().min(10).default(12),

  // Mail
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  SMTP_SECURE: Joi.boolean().default(true),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  APP_BASE_URL: Joi.string().uri().required(), 
});
