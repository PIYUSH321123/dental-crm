"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        rawBody: true,
    });
    const config = app.get(config_1.ConfigService);
    const port = config.get('app.port', 4000);
    const apiPrefix = config.get('app.apiPrefix', 'api/v1');
    const corsOrigins = config.get('app.corsOrigins', ['http://localhost:3000']);
    app.setGlobalPrefix(apiPrefix);
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('DentFlow Dental CRM API')
        .setDescription('Multi-tenant, multi-branch dental CRM backend (India) — Clinic C01-C17, Owner O01-O05, Patient P01-P13, Specialist S01, Lab L01, Super-Admin A01')
        .setVersion('1.0.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearer')
        .addApiKey({ type: 'apiKey', name: 'x-branch-id', in: 'header' }, 'branch-header')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    await app.listen(port);
    logger.log(`DentFlow API running on http://localhost:${port}/${apiPrefix}`);
    logger.log(`Swagger UI available at http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map