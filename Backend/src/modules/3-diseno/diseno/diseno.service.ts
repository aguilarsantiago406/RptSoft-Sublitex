import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoDiseno, Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CrearDisenoDto } from './dto/crear-diseno.dto';
import { ActualizarArtefactosDto } from './dto/actualizar-artefactos.dto';
import { EstadoDisenoDto } from './dto/estado-diseno.dto';

const ESTADOS_EDITABLES = ['BORRADOR', 'PROPUESTO', 'RECHAZADO'];

@Injectable()
export class DisenoService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================================================
  // CREAR VERSIÓN
  // ==========================================================================

  async crear(dto: CrearDisenoDto) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: dto.pedidoId },
    });
    if (!pedido) {
      throw new BadRequestException('El pedido indicado no existe.');
    }

    const version = await this.siguienteVersion(dto.pedidoId);
    const diseno = await this.crearConAuditoria({
      pedidoId: dto.pedidoId,
      version,
      data: {
        archivoUrl: dto.archivoUrl,
        imagenUrl: dto.imagenUrl,
      },
      campo: 'creacion',
      valorNuevo: String(version),
    });

    return diseno;
  }

  // ==========================================================================
  // ARTEFACTOS (archivo de sublimación e imagen de vista previa)
  // ==========================================================================

  async actualizarArtefactos(id: string, dto: ActualizarArtefactosDto) {
    const diseno = await this.obtenerExistente(id);

    if (!ESTADOS_EDITABLES.includes(diseno.estado)) {
      throw new ConflictException(
        'No se pueden reemplazar los artefactos de un diseño aprobado.',
      );
    }

    if (dto.archivoUrl === undefined && dto.imagenUrl === undefined) {
      throw new BadRequestException(
        'Debe enviar al menos archivoUrl o imagenUrl.',
      );
    }

    const data: { archivoUrl?: string; imagenUrl?: string } = {};
    if (dto.archivoUrl !== undefined) {
      data.archivoUrl = dto.archivoUrl;
    }
    if (dto.imagenUrl !== undefined) {
      data.imagenUrl = dto.imagenUrl;
    }

    await this.prisma.diseno.update({ where: { id }, data });

    const cambios: {
      campo: string;
      anterior?: string | null;
      nuevo?: string | null;
    }[] = [];
    if (dto.archivoUrl !== undefined && dto.archivoUrl !== diseno.archivoUrl) {
      cambios.push({
        campo: 'archivoUrl',
        anterior: diseno.archivoUrl,
        nuevo: dto.archivoUrl,
      });
    }
    if (dto.imagenUrl !== undefined && dto.imagenUrl !== diseno.imagenUrl) {
      cambios.push({
        campo: 'imagenUrl',
        anterior: diseno.imagenUrl,
        nuevo: dto.imagenUrl,
      });
    }

    for (const c of cambios) {
      await this.registrarCambio({
        pedidoId: diseno.pedidoId,
        entidadId: id,
        campo: c.campo,
        valorAnterior: c.anterior,
        valorNuevo: c.nuevo,
      });
    }

    return this.obtenerDetalle(id);
  }

  // ==========================================================================
  // TRANSICIONES DE ESTADO
  // ==========================================================================

  async proponer(id: string) {
    const diseno = await this.obtenerExistente(id);
    if (diseno.estado !== 'BORRADOR') {
      throw new ConflictException(
        'Solo un diseño en BORRADOR puede proponerse para aprobación.',
      );
    }

    return this.editarConAuditoria(id, diseno, 'PROPUESTO', 'estado');
  }

  async aprobar(id: string, dto: EstadoDisenoDto) {
    const diseno = await this.obtenerExistente(id);
    if (diseno.estado !== 'PROPUESTO') {
      throw new ConflictException(
        'Solo un diseño en PROPUESTO puede aprobarse.',
      );
    }
    if (!dto.usuarioId) {
      throw new BadRequestException(
        'usuarioId es obligatorio para registrar la aprobación.',
      );
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: dto.usuarioId },
    });
    if (!usuario) {
      throw new BadRequestException('El usuario aprobador no existe.');
    }

    const disenoEditado = await this.editarConAuditoria(
      id,
      diseno,
      'APROBADO',
      'estado',
      {
        aprobadoEn: new Date(),
        aprobadoPorId: dto.usuarioId,
      },
    );

    return disenoEditado;
  }

  async rechazar(id: string, dto: EstadoDisenoDto) {
    const diseno = await this.obtenerExistente(id);
    if (diseno.estado !== 'PROPUESTO') {
      throw new ConflictException(
        'Solo un diseño en PROPUESTO puede rechazarse.',
      );
    }

    await this.registrarCambio({
      pedidoId: diseno.pedidoId,
      entidadId: id,
      campo: 'estado',
      valorAnterior: diseno.estado,
      valorNuevo: `RECHAZADO${dto.motivo ? ` (${dto.motivo})` : ''}`,
    });

    await this.prisma.diseno.update({
      where: { id },
      data: { estado: 'RECHAZADO' },
    });

    return this.obtenerDetalle(id);
  }

  // ==========================================================================
  // CONSULTAS
  // ==========================================================================

  async listarPorPedido(pedidoId: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
    });
    if (!pedido) {
      throw new BadRequestException('El pedido indicado no existe.');
    }

    return this.prisma.diseno.findMany({
      where: { pedidoId },
      orderBy: { version: 'desc' },
      include: { aprobadoPor: true },
    });
  }

  async obtenerDetalle(id: string) {
    const diseno = await this.prisma.diseno.findUnique({
      where: { id },
      include: { aprobadoPor: true },
    });
    if (!diseno) throw new NotFoundException('Diseño no encontrado.');
    return diseno;
  }

  // ==========================================================================
  // AUXILIARES
  // ==========================================================================

  private async siguienteVersion(pedidoId: string): Promise<number> {
    const ultimo = await this.prisma.diseno.findFirst({
      where: { pedidoId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    return (ultimo?.version ?? 0) + 1;
  }

  private async obtenerExistente(id: string) {
    const diseno = await this.prisma.diseno.findUnique({ where: { id } });
    if (!diseno) throw new NotFoundException('Diseño no encontrado.');
    return diseno;
  }

  private async crearConAuditoria(data: {
    pedidoId: string;
    version: number;
    data: { archivoUrl?: string; imagenUrl?: string };
    campo: string;
    valorNuevo: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const diseno = await tx.diseno.create({
        data: {
          pedidoId: data.pedidoId,
          version: data.version,
          archivoUrl: data.data.archivoUrl,
          imagenUrl: data.data.imagenUrl,
        },
      });

      await this.crearRegistro(tx, {
        pedidoId: data.pedidoId,
        entidadId: diseno.id,
        campo: data.campo,
        valorNuevo: data.valorNuevo,
      });

      return diseno;
    });
  }

  private async editarConAuditoria(
    id: string,
    diseno: { pedidoId: string; estado: string },
    nuevoEstado: EstadoDiseno,
    campo: string,
    dataAdicional: { aprobadoEn?: Date; aprobadoPorId?: string } = {},
  ) {
    return this.prisma.$transaction(async (tx) => {
      const actualizado = await tx.diseno.update({
        where: { id },
        data: { estado: nuevoEstado, ...dataAdicional },
      });

      await this.crearRegistro(tx, {
        pedidoId: diseno.pedidoId,
        entidadId: id,
        campo,
        valorAnterior: diseno.estado,
        valorNuevo: nuevoEstado,
      });

      return actualizado;
    });
  }

  private async registrarCambio(data: {
    pedidoId: string;
    entidadId: string;
    campo: string;
    valorAnterior?: string | null;
    valorNuevo?: string | null;
  }) {
    await this.crearRegistro(this.prisma, data);
  }

  private async crearRegistro(
    tx: Prisma.TransactionClient | PrismaService,
    data: {
      pedidoId: string;
      entidadId: string;
      campo: string;
      valorAnterior?: string | null;
      valorNuevo?: string | null;
    },
  ) {
    await tx.registroCambio.create({
      data: {
        pedidoId: data.pedidoId,
        entidad: 'Diseno',
        entidadId: data.entidadId,
        campo: data.campo,
        valorAnterior: data.valorAnterior ?? null,
        valorNuevo: data.valorNuevo ?? null,
        origen: 'USUARIO',
      },
    });
  }
}
