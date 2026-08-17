import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import morgan from 'morgan';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Log de peticiones HTTP: "combined" en prod, "dev" (coloreado, conciso) en desarrollo
  const morganFormat =
    process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
  app.use(morgan(morganFormat));

  // Sirve archivos estáticos (public/index.html, css, js) igual que express.static
  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 App corriendo en http://localhost:${port}`);
}
void bootstrap();
