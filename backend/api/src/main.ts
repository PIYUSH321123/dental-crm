import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port', 4000);
  const apiPrefix = config.get<string>('app.apiPrefix', 'api/v1');
  const corsOrigins = config.get<string[]>('app.corsOrigins', ['http://localhost:3000']);

  app.setGlobalPrefix(apiPrefix);
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('DentFlow Dental CRM API')
    .setDescription(
      'Multi-tenant, multi-branch dental CRM backend (India) — Clinic C01-C17, Owner O01-O05, Patient P01-P13, Specialist S01, Lab L01, Super-Admin A01',
    )
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearer')
    .addApiKey({ type: 'apiKey', name: 'x-branch-id', in: 'header' }, 'branch-header')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port);
  logger.log(`DentFlow API running on http://localhost:${port}/${apiPrefix}`);
  logger.log(`Swagger UI available at http://localhost:${port}/api/docs`);
}

bootstrap();

