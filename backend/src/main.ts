import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
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
  app.use(helmet({
    crossOriginResourcePolicy: false, // allow swagger assets
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false, // disable CSP in dev for Swagger
  }));

  // CORS configuration
  const raw = configService.get<string>('CORS_ORIGINS') ?? configService.get<string>('APP_BASE_URL');
  const origins = raw ? raw.split(',').map(s => s.trim()) : [];
  app.enableCors({
    origin: (origin, callback) => {
      // allow non-browser tools with no Origin header (curl/Postman)
      if (!origin) return callback(null, true);
      return callback(null, origins.includes(origin));
    },
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      validationError: { target: false, value: false }, // cleaner error payloads
      forbidUnknownValues: true, // guards against weird payloads
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
