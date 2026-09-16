import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const cookieSecure = configService.getOrThrow<boolean>('auth.cookieSecure');

  app.use(helmet());
  app.use(cookieParser());
  // Short-lived session store for OAuth state + PKCE (passport-oauth2).
  app.use(
    session({
      name: 'juspeace_oauth',
      secret: configService.getOrThrow<string>('auth.jwtAccessSecret'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000,
      },
    }),
  );
  app.enableCors({
    origin: configService.get<string[]>('corsOrigins'),
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'X-Timezone'],
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Juspeace API')
    .setDescription('E-commerce API for the Juspeace shop')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('port', 7777);
  await app.listen(port);
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
