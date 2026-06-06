import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { localeMiddleware } from 'common/middleware/locale.middleware';
import { responseMiddleware } from 'common/middleware/response.middleware';
import { GlobalHttpExceptionFilter } from 'common/exceptions/http.exception';
import {
  corsOriginValidator,
  getAllowedOrigins,
} from 'common/config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  //size
  app.use(bodyParser.json({ limit: '500mb' }));
  app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

  const server = app.getHttpAdapter().getInstance();
  server.use(localeMiddleware);
  server.use(responseMiddleware);
  server.get('/', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.setGlobalPrefix('api');

  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  const allowedOrigins = getAllowedOrigins();

  app.enableCors({
    origin: corsOriginValidator(allowedOrigins),
    credentials: true,
  });

  await app.listen(3000);
}

void bootstrap();
