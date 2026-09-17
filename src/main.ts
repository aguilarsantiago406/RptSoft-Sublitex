import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));

  const config = new DocumentBuilder()
    .setTitle('SIPES API BK1 - Sublitex')
    .setDescription('Clientes, Pedidos, Colores, Grupos, Catalogos. Alineado al catálogo de reglas v0.2 + bloque K.')
    .setVersion('1.0.0')
    .addTag('Clientes').addTag('Pedidos').addTag('Grupos').addTag('Catalogos')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log('Servidor SIPES BK1: http://localhost:' + port);
  console.log('Swagger: http://localhost:' + port + '/api/docs');
}
bootstrap();
