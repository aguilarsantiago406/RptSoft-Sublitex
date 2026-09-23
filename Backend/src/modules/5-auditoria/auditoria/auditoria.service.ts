import { Injectable } from '@nestjs/common';
import { Prisma, RolUsuario } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ListarRegistrosCambioDto } from './dto/listar-registros-cambio.dto';

export interface RegistroCambioInput {
  pedidoId: string;
  entidad: string;
  entidadId: string;
  campo: string;
  valorAnterior?: string | null;
  valorNuevo?: string | null;
  origen: 'USUARIO' | 'PARTICIPANTE' | 'SISTEMA' | 'GHL';
  autorUsuarioId?: string;
  autorRol?: RolUsuario;
}

@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * R-I01 · Escribe un registro de cambio (append-only).
   * Se puede invocar dentro de una transacción existente pasando `tx`,
   * de modo que la auditoría quede atómica con el cambio que describe.
   */
  async registrar(
    data: RegistroCambioInput,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const db = tx ?? this.prisma;
    await db.registroCambio.create({
      data: {
        pedidoId: data.pedidoId,
        entidad: data.entidad,
        entidadId: data.entidadId,
        campo: data.campo,
        valorAnterior: data.valorAnterior ?? null,
        valorNuevo: data.valorNuevo ?? null,
        origen: data.origen,
        autorUsuarioId: data.autorUsuarioId ?? null,
        autorRol: data.autorRol ?? null,
      },
    });
  }

  /**
   * R-I02 · Solo lectura: no existen métodos de update ni delete.
   * Los permisos UPDATE/DELETE están revocados en constraints.sql.
   */
  async listar(query: ListarRegistrosCambioDto) {
    const where: Prisma.RegistroCambioWhereInput = {};

    if (query.pedidoId) where.pedidoId = query.pedidoId;
    if (query.entidad) where.entidad = query.entidad;
    if (query.entidadId) where.entidadId = query.entidadId;
    if (query.origen) where.origen = query.origen;

    return this.prisma.registroCambio.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
      take: query.limit ?? 100,
      include: {
        autorUsuario: {
          select: { id: true, nombre: true, email: true, rol: true },
        },
      },
    });
  }
}
