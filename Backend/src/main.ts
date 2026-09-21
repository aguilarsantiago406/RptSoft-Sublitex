import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaExceptionFilter } from './core/filters/prisma-exception.filter';
//holaaaaaaaaaaaaaaaaaa prueba mil
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new PrismaExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('SIPES API - Sublitex')
    .setDescription('Sistema de Gestion de Pedidos y Produccion Sublitex.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth / Usuarios', 'Autenticacion y gestion de usuarios (BK1)')
    .addTag('Clientes', 'Gestion de clientes (BK1)')
    .addTag('Pedidos', 'Gestion de pedidos, estados y colores (BK1)')
    .addTag('Grupos', 'Gestion de grupos y politicas de numeracion (BK1)')
    .addTag('Catalogos', 'Catalogos de tipos de producto, tallas, atributos y ubicaciones (BK1)')
    .addTag('Comercial / Tarifas y Envios', 'Tarifas y datos de envio (BK1)')
    .addTag('Participantes', 'Gestion de participantes y enlaces WhatsApp (BK2)')
    .addTag('Prendas', 'Gestion de prendas y calculo de produccion (BK2)')
    .addTag('Excepciones de Prenda', 'Deltas de configuracion sobre prendas (BK2)')
    .addTag('Personalizaciones', 'Estampados con ubicacion declarada (BK2)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log('Servidor SIPES: http://localhost:' + port);
  console.log('Swagger: http://localhost:' + port + '/api/docs');
}
bootstrap();
