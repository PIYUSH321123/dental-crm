import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Service liveness & readiness probe' })
  check() {
    return {
      status: 'ok',
      service: 'dentflow-api',
      mode: process.env.APP_MODE || 'api',
      timezone: process.env.TIMEZONE || 'Asia/Kolkata',
      timestamp: new Date().toISOString(),
    };
  }
}

