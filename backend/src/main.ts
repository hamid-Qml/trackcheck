import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.enableCors({
    origin: configService.get('FRONTEND_URL') || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  //  Global route prefix
  app.setGlobalPrefix('api');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('TrackCheck Backend API')
    .setDescription('NestJS backend for AI-driven music feedback and audio analysis')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'User authentication and signup')
    .addTag('users', 'User management and profiles')
    .addTag('subscriptions', 'Subscription tiers and access control')
    .addTag('uploads', 'Audio file uploads and management')
    .addTag('features', 'Audio feature extraction (via ML-end)')
    .addTag('feedback', 'AI-generated track feedback and scoring')
    .addTag('requests', 'Feedback request orchestration (main + reference track)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`🚀 Server running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
