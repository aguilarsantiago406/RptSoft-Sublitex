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
  autorParticipanteId?: string;
  autorRol?: RolUsuario;
  prendasAfectadas?: number;
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
        autorParticipanteId: data.autorParticipanteId ?? null,
        autorRol: data.autorRol ?? null,
        prendasAfectadas: data.prendasAfectadas ?? null,
      },
    });
  }

  /**
   * R-I02 · Solo lectura: no existen métodos de update ni delete.
   * Los permisos UPDATE/DELETE están revocados en constraints.sql.
   */
  async listar(query: ListarRegistrosCambioDto) {
    const where: Prisma.RegistroCambioWhereInput = {};

    if (query.pedidoId) {
      if (query.pedidoId.startsWith('SUB-')) {
        const ped = await this.prisma.pedido.findUnique({
          where: { codigo: query.pedidoId },
          select: { id: true },
        });
        where.pedidoId = ped ? ped.id : query.pedidoId;
      } else {
        where.pedidoId = query.pedidoId;
      }
    }
    if (query.entidad) where.entidad = query.entidad;
    if (query.entidadId) where.entidadId = query.entidadId;
    if (query.origen) where.origen = query.origen;
    if (query.autorUsuarioId) where.autorUsuarioId = query.autorUsuarioId;
    if (query.campo) where.campo = query.campo;

    const registros = await this.prisma.registroCambio.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
      take: query.limit ?? 100,
      include: {
        autorUsuario: {
          select: { id: true, nombre: true, email: true, rol: true },
        },
      },
    });

    const prendaIds = Array.from(
      new Set(
        registros
          .filter((r) => r.entidad === 'Prenda' && r.entidadId)
          .map((r) => r.entidadId),
      ),
    );

    const tallaIds = Array.from(
      new Set(
        registros
          .filter((r) => r.campo === 'tallaId')
          .flatMap((r) => [r.valorAnterior, r.valorNuevo])
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const colorIds = Array.from(
      new Set(
        registros
          .filter((r) => r.campo === 'colorId')
          .flatMap((r) => [r.valorAnterior, r.valorNuevo])
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const [prendas, tallas, colores] = await Promise.all([
      prendaIds.length > 0 && typeof this.prisma.prenda?.findMany === 'function'
        ? this.prisma.prenda.findMany({
            where: { id: { in: prendaIds } },
            select: {
              id: true,
              participante: {
                select: { id: true, nombrePersona: true },
              },
              grupo: {
                select: { id: true, nombre: true },
              },
            },
          })
        : Promise.resolve([]),
      tallaIds.length > 0 && typeof this.prisma.tallaCatalogo?.findMany === 'function'
        ? this.prisma.tallaCatalogo.findMany({
            where: { id: { in: tallaIds } },
            select: { id: true, codigo: true, etiqueta: true },
          })
        : Promise.resolve([]),
      colorIds.length > 0 && typeof this.prisma.colorPedido?.findMany === 'function'
        ? this.prisma.colorPedido.findMany({
            where: { id: { in: colorIds } },
            select: { id: true, nombre: true, codigoHex: true },
          })
        : Promise.resolve([]),
    ]);

    const mapaPrendas = new Map((prendas as any[]).map((p) => [p.id, p]));
    const mapaTallas = new Map((tallas as any[]).map((t) => [t.id, t.etiqueta || t.codigo]));
    const mapaColores = new Map((colores as any[]).map((c) => [c.id, c.nombre]));

    const formatoGenero: Record<string, string> = {
      HOMBRE: 'Hombre',
      MUJER: 'Mujer',
      NINO: 'Niño',
      NINA: 'Niña',
      SIN_ESPECIFICAR: 'Sin especificar',
    };

    return registros.map((r) => {
      let participanteNombre: string | null = null;
      let grupoNombre: string | null = null;
      if (r.entidad === 'Prenda') {
        const p = mapaPrendas.get(r.entidadId);
        if (p) {
          participanteNombre = p.participante?.nombrePersona ?? null;
          grupoNombre = p.grupo?.nombre ?? null;
        }
      }

      let valorAnteriorLegible = r.valorAnterior;
      let valorNuevoLegible = r.valorNuevo;

      if (r.campo === 'tallaId') {
        if (r.valorAnterior && mapaTallas.has(r.valorAnterior)) {
          valorAnteriorLegible = mapaTallas.get(r.valorAnterior)!;
        }
        if (r.valorNuevo && mapaTallas.has(r.valorNuevo)) {
          valorNuevoLegible = mapaTallas.get(r.valorNuevo)!;
        }
      } else if (r.campo === 'colorId') {
        if (r.valorAnterior && mapaColores.has(r.valorAnterior)) {
          valorAnteriorLegible = mapaColores.get(r.valorAnterior)!;
        }
        if (r.valorNuevo && mapaColores.has(r.valorNuevo)) {
          valorNuevoLegible = mapaColores.get(r.valorNuevo)!;
        }
      } else if (r.campo === 'genero') {
        if (r.valorAnterior && formatoGenero[r.valorAnterior]) {
          valorAnteriorLegible = formatoGenero[r.valorAnterior];
        }
        if (r.valorNuevo && formatoGenero[r.valorNuevo]) {
          valorNuevoLegible = formatoGenero[r.valorNuevo];
        }
      }

      return {
        ...r,
        participanteNombre,
        grupoNombre,
        valorAnteriorLegible,
        valorNuevoLegible,
      };
    });
  }
}
