import 'dotenv/config';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from './app.module';
import { auth } from './auth/auth';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use('/api/auth', toNodeHandler(auth));
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setGlobalPrefix('api/v1', { exclude: ['api/auth/{*path}'] });
  app.enableCors({
    origin: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173').split(','),
    credentials: true,
  });
  await app.listen(Number(process.env.PORT ?? 8000), process.env.HOST ?? '127.0.0.1');
}

bootstrap();
