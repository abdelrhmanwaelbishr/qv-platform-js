import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173').split(','),
    credentials: true,
  });
  await app.listen(Number(process.env.PORT ?? 8000), process.env.HOST ?? '127.0.0.1');
}

bootstrap();
