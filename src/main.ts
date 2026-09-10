import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: '*' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('SIPES API — Sublitex')
    .setDescription('Contrato de API oficial para el Sistema de Gestión de Pedidos')
    .setVersion('1.0')
    .addTag('Pedidos', 'Operaciones y consultas de pedidos')
    .addTag('Clientes', 'Gestión de clientes y contactos')
    .addTag('Grupos', 'Agrupaciones y políticas de numeración')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Servidor corriendo en: http://localhost:3000`);
  console.log(`📑 Swagger disponible en: http://localhost:3000/api/docs`);
}
bootstrap();
