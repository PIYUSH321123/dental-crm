import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrapWorker() {
  const logger = new Logger('WorkerBootstrap');
  process.env.APP_MODE = 'worker';
  const app = await NestFactory.createApplicationContext(AppModule);
  app.enableShutdownHooks();
  logger.log('DentFlow BullMQ + Outbox Worker started');
}

bootstrapWorker();

