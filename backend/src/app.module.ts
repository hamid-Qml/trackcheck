import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AudioModule } from './audio/audio.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    // 🌍 Environment variables
    ConfigModule.forRoot({ isGlobal: true }),

    // 🗄️ Database connection (URL-based, migrations-first)
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false, // keep off — use migrations
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    }),

    // 📦 Feature modules
    AuthModule,
    UsersModule,
    SubscriptionsModule,
    AudioModule,
    FeedbackModule,
  ],
})
export class AppModule {}
