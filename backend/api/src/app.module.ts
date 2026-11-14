import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfig,
  authConfig,
  integrationsConfig,
  rulesConfig,
  s3Config,
} from './config/env.config';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
      load: [appConfig, authConfig, s3Config, rulesConfig, integrationsConfig],
    }),
  ],
  controllers: [HealthController],
})
export class AppModule {}

