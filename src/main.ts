import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new PrismaExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('SIPES API — Sublitex')
    .setDescription('Sistema de Gestión de Pedidos y Producción Sublitex. Módulos Comerciales y de Operación de Prendas.')
    .setVersion('1.0.0')
    .addTag('Clientes', 'Gestión de clientes (BK1)')
    .addTag('Pedidos', 'Gestión de pedidos, estados y colores (BK1)')
    .addTag('Grupos', 'Gestión de grupos y políticas de numeración (BK1)')
    .addTag('Catalogos', 'Catálogos de tipos de producto, tallas, atributos y ubicaciones (BK1)')
    .addTag('Participantes', 'Gestión de participantes y enlaces WhatsApp (BK2)')
    .addTag('Participantes - Enlace Público', 'Acceso móvil público por token (BK2)')
    .addTag('Prendas', 'Gestión de prendas y cálculo de producción (BK2)')
    .addTag('Excepciones de Prenda', 'Deltas de configuración sobre prendas (BK2)')
    .addTag('Personalizaciones', 'Estampados con ubicación declarada (BK2)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log('?? Servidor SIPES unificado: http://localhost:' + port);
  console.log('?? Swagger disponible en: http://localhost:' + port + '/api/docs');
}
bootstrap();