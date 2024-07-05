import { Logger, ValidationPipe } from '@nestjs/common';
import { NestApplication, NestFactory } from '@nestjs/core';

import { Environment } from './shared/variables/environment';
import { ResponseInterceptor } from './shared/common/interceptors/response.interceptor';
import { RootModule } from './root.module';

(async () => {
  const app = await NestFactory.create(RootModule);

  app.enableShutdownHooks();
  app.setGlobalPrefix(Environment.API_PREFIX);
  app.enableCors({
    credentials: true,
    origin: Environment.ALLOWED_ORIGINS.split(';'),
  });
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  await app.listen(Environment.PORT, () => {
    Logger.log(`Api started on port ${Environment.PORT}`, NestApplication.name);
  });
})();
