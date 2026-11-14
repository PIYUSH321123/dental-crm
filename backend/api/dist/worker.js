"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrapWorker() {
    const logger = new common_1.Logger('WorkerBootstrap');
    process.env.APP_MODE = 'worker';
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    app.enableShutdownHooks();
    logger.log('DentFlow BullMQ + Outbox Worker started');
}
bootstrapWorker();
//# sourceMappingURL=worker.js.map