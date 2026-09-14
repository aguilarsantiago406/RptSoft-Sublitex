import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error en la base de datos';

    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        const target = exception.meta?.target || 'campo único';
        message = `Violación de restricción única en: ${target}.`;
        break;
      }
      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        message = 'El registro solicitado no fue encontrado.';
        break;
      }
      case 'P2003': {
        status = HttpStatus.BAD_REQUEST;
        message = 'Violación de llave foránea o relación inválida.';
        break;
      }
      default: {
        // Manejo de excepciones disparadas por Triggers SQL en 01_constraints.sql
        if (exception.message?.includes('R-C05')) {
          status = HttpStatus.UNPROCESSABLE_ENTITY;
          message = 'R-C05: La excepción coincide con la configuración general del grupo.';
        } else if (exception.message?.includes('R-H12')) {
          status = HttpStatus.CONFLICT;
          message = 'R-H12: El bloque Lista está cerrado. Requiere reapertura.';
        } else {
          message = exception.message;
        }
        break;
      }
    }

    response.status(status).json({
      statusCode: status,
      error: exception.code,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
