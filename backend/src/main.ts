import 'dotenv/config';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { allowedOrigins } from './auth/origins';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: allowedOrigins(),
    credentials: true,
  });

  // Vercel runs the app as a Function and forwards traffic to the injected
  // port, so the server has to accept connections on all interfaces there.
  const host = process.env.HOST ?? (process.env.VERCEL ? '0.0.0.0' : '127.0.0.1');
  await app.listen(Number(process.env.PORT ?? 8000), host);
}

bootstrap();
