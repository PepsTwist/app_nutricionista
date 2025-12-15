// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita o CORS para permitir requisições do frontend
  app.enableCors();

  // Usa um ValidationPipe global para todas as rotas
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
