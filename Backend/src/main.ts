import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './core/filters/prisma-exception.filter';

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

  app.useGlobalFilters(new PrismaExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('SIPES API — Sublitex')
    .setDescription(
      'Contrato de API oficial para el Sistema de Gestión de Pedidos',
    )
    .setVersion('1.0')
    .addTag(
      'Participantes',
      'Gestión de participantes y enlaces WhatsApp (BK2)',
    )
    .addTag(
      'Participantes - Enlace Público (Sin JWT)',
      'Acceso móvil público por token (BK2)',
    )
    .addTag('Prendas', 'Gestión de prendas y cálculo de producción (BK2)')
    .addTag(
      'Excepciones de Prenda',
      'Deltas de configuración sobre prendas (BK2)',
    )
    .addTag('Personalizaciones', 'Estampados con ubicación declarada (BK2)')
    .addTag('Diseños', 'Versionado y aprobación gráfica (FRENTE DISEÑO)')
    .addTag(
      'Producción',
      'Nesting, corte, consumo de tela y archivos TIF (FRENTE PRODUCCIÓN)',
    )
    .addTag(
      'Auditoría',
      'Trazabilidad inmutable append-only (FRENTE AUDITORÍA)',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Servidor corriendo en: http://localhost:3000`);
  console.log(`📑 Swagger disponible en: http://localhost:3000/api/docs`);
}
bootstrap();
