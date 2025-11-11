// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AudioModule } from './audio/audio.module';
import { FeedbackModule } from './feedback/feedback.module';
import { configValidationSchema } from './config/config.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      validationSchema: configValidationSchema,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }),

    // Static serving for uploads
    ServeStaticModule.forRoot({
      rootPath: process.env.UPLOADS_DIR || join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        maxAge: '7d',
        immutable: true,
        index: false,
      },
    }),

    AuthModule,
    UsersModule,
    SubscriptionsModule,
    AudioModule,
    FeedbackModule,
  ],
})
export class AppModule {}
