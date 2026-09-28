import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoDiseno, RolUsuario } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AuditoriaService } from '../../5-auditoria/auditoria/auditoria.service';
import { CrearDisenoDto } from './dto/crear-diseno.dto';
import { ActualizarArtefactosDto } from './dto/actualizar-artefactos.dto';
import { EstadoDisenoDto } from './dto/estado-diseno.dto';

const ESTADOS_EDITABLES = ['BORRADOR', 'PROPUESTO', 'RECHAZADO'];

@Injectable()
export class DisenoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

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

    const bloqueDiseno = await this.prisma.bloquePedido.findUnique({
      where: {
        pedidoId_tipo: {
          pedidoId: dto.pedidoId,
          tipo: 'DISENO',
        },
      },
    });
    if (bloqueDiseno?.estado === 'CERRADO') {
      throw new BadRequestException(
        'No se pueden crear nuevas versiones: el bloque de Diseño está cerrado (R-H12).',
      );
    }

    const version = await this.siguienteVersion(dto.pedidoId);

    return this.prisma.$transaction(async (tx) => {
      const diseno = await tx.diseno.create({
        data: {
          pedidoId: dto.pedidoId,
          version,
          archivoUrl: dto.archivoUrl,
          imagenUrl: dto.imagenUrl,
        },
      });

      await this.auditoria.registrar(
        {
          pedidoId: dto.pedidoId,
          entidad: 'Diseno',
          entidadId: diseno.id,
          campo: 'creacion',
          valorNuevo: String(version),
          origen: 'USUARIO',
        },
        tx,
      );

      return diseno;
    });
  }

  // ==========================================================================
  // ARTEFACTOS (archivo de sublimación e imagen de vista previa)
  // ==========================================================================

  async actualizarArtefactos(id: string, dto: ActualizarArtefactosDto) {
    const diseno = await this.obtenerExistente(id);

    const bloqueDiseno = await this.prisma.bloquePedido.findUnique({
      where: {
        pedidoId_tipo: {
          pedidoId: diseno.pedidoId,
          tipo: 'DISENO',
        },
      },
    });
    if (bloqueDiseno?.estado === 'CERRADO') {
      throw new BadRequestException(
        'No se pueden modificar artefactos: el bloque de Diseño está cerrado (R-H12).',
      );
    }

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
    const cambios: {
      campo: string;
      anterior?: string | null;
      nuevo?: string | null;
    }[] = [];

    if (dto.archivoUrl !== undefined) {
      data.archivoUrl = dto.archivoUrl;
      if (dto.archivoUrl !== diseno.archivoUrl) {
        cambios.push({
          campo: 'archivoUrl',
          anterior: diseno.archivoUrl,
          nuevo: dto.archivoUrl,
        });
      }
    }
    if (dto.imagenUrl !== undefined) {
      data.imagenUrl = dto.imagenUrl;
      if (dto.imagenUrl !== diseno.imagenUrl) {
        cambios.push({
          campo: 'imagenUrl',
          anterior: diseno.imagenUrl,
          nuevo: dto.imagenUrl,
        });
      }
    }

    // R-I01: la actualización y su auditoría son atómicas.
    await this.prisma.$transaction(async (tx) => {
      await tx.diseno.update({ where: { id }, data });

      for (const c of cambios) {
        await this.auditoria.registrar(
          {
            pedidoId: diseno.pedidoId,
            entidad: 'Diseno',
            entidadId: id,
            campo: c.campo,
            valorAnterior: c.anterior,
            valorNuevo: c.nuevo,
            origen: 'USUARIO',
          },
          tx,
        );
      }
    });

    return this.obtenerDetalle(id);
  }

  // ==========================================================================
  // TRANSICIONES DE ESTADO
  // ==========================================================================

  async proponer(id: string) {
    const diseno = await this.obtenerExistente(id);

    const bloqueDiseno = await this.prisma.bloquePedido.findUnique({
      where: {
        pedidoId_tipo: {
          pedidoId: diseno.pedidoId,
          tipo: 'DISENO',
        },
      },
    });
    if (bloqueDiseno?.estado === 'CERRADO') {
      throw new BadRequestException(
        'No se puede proponer: el bloque de Diseño está cerrado (R-H12).',
      );
    }

    if (diseno.estado !== 'BORRADOR') {
      throw new ConflictException(
        'Solo un diseño en BORRADOR puede proponerse para aprobación.',
      );
    }

    return this.editarConAuditoria(id, diseno, 'PROPUESTO', 'estado');
  }

  async aprobar(id: string, dto: EstadoDisenoDto) {
    const diseno = await this.obtenerExistente(id);

    const bloqueDiseno = await this.prisma.bloquePedido.findUnique({
      where: {
        pedidoId_tipo: {
          pedidoId: diseno.pedidoId,
          tipo: 'DISENO',
        },
      },
    });
    if (bloqueDiseno?.estado === 'CERRADO') {
      throw new BadRequestException(
        'No se puede aprobar: el bloque de Diseño ya está cerrado (R-H12).',
      );
    }

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

    // Regla R-H02: Verificar que todos los atributos obligatorios de todos los grupos tengan valor configurado
    const grupos = await this.prisma.grupo.findMany({
      where: { pedidoId: diseno.pedidoId },
      include: {
        configuracion: true,
      },
    });

    if (grupos.length === 0) {
      throw new BadRequestException(
        'No se puede aprobar el diseño: el pedido no tiene grupos configurados (R-H02).',
      );
    }

    const atributosObligatorios = await this.prisma.atributo.findMany({
      where: { activo: true, obligatorio: true },
    });

    for (const grupo of grupos) {
      for (const attr of atributosObligatorios) {
        const config = grupo.configuracion.find(
          (c) => c.atributoId === attr.id && !!c.valorAtributoId,
        );
        if (!config) {
          throw new BadRequestException(
            `No se puede aprobar el diseño: el grupo "${grupo.nombre}" no tiene configurado el atributo obligatorio "${attr.nombre}" (R-H02).`,
          );
        }
      }
    }

    const fechaAprobacion = new Date();

    return this.prisma.$transaction(async (tx) => {
      const disenoEditado = await tx.diseno.update({
        where: { id },
        data: {
          estado: 'APROBADO',
          aprobadoEn: fechaAprobacion,
          aprobadoPorId: dto.usuarioId,
        },
      });

      await this.auditoria.registrar(
        {
          pedidoId: diseno.pedidoId,
          entidad: 'Diseno',
          entidadId: id,
          campo: 'estado',
          valorAnterior: diseno.estado,
          valorNuevo: 'APROBADO',
          origen: 'USUARIO',
          autorRol: usuario.rol,
          autorUsuarioId: dto.usuarioId,
        },
        tx,
      );

      // Regla R-H01: Cerrar el bloque DISENO del pedido
      await tx.bloquePedido.upsert({
        where: {
          pedidoId_tipo: {
            pedidoId: diseno.pedidoId,
            tipo: 'DISENO',
          },
        },
        update: {
          estado: 'CERRADO',
          cerradoEn: fechaAprobacion,
          cerradoPorId: dto.usuarioId,
        },
        create: {
          pedidoId: diseno.pedidoId,
          tipo: 'DISENO',
          estado: 'CERRADO',
          cerradoEn: fechaAprobacion,
          cerradoPorId: dto.usuarioId,
        },
      });

      return disenoEditado;
    });
  }

  async rechazar(id: string, dto: EstadoDisenoDto) {
    const diseno = await this.obtenerExistente(id);

    const bloqueDiseno = await this.prisma.bloquePedido.findUnique({
      where: {
        pedidoId_tipo: {
          pedidoId: diseno.pedidoId,
          tipo: 'DISENO',
        },
      },
    });
    if (bloqueDiseno?.estado === 'CERRADO') {
      throw new BadRequestException(
        'No se puede rechazar: el bloque de Diseño está cerrado (R-H12).',
      );
    }

    if (diseno.estado !== 'PROPUESTO') {
      throw new ConflictException(
        'Solo un diseño en PROPUESTO puede rechazarse.',
      );
    }

    // R-I01: el estado y su auditoría son atómicos; el motivo se registra como
    // un campo aparte, no mezclado en el string del estado.
    await this.prisma.$transaction(async (tx) => {
      await tx.diseno.update({
        where: { id },
        data: { estado: 'RECHAZADO' },
      });

      await this.auditoria.registrar(
        {
          pedidoId: diseno.pedidoId,
          entidad: 'Diseno',
          entidadId: id,
          campo: 'estado',
          valorAnterior: diseno.estado,
          valorNuevo: 'RECHAZADO',
          origen: 'USUARIO',
        },
        tx,
      );

      if (dto.motivo) {
        await this.auditoria.registrar(
          {
            pedidoId: diseno.pedidoId,
            entidad: 'Diseno',
            entidadId: id,
            campo: 'motivoRechazo',
            valorNuevo: dto.motivo,
            origen: 'USUARIO',
          },
          tx,
        );
      }
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

  private async editarConAuditoria(
    id: string,
    diseno: { pedidoId: string; estado: string },
    nuevoEstado: EstadoDiseno,
    campo: string,
    dataAdicional: { aprobadoEn?: Date; aprobadoPorId?: string } = {},
    autor: { autorRol?: RolUsuario; autorUsuarioId?: string } = {},
  ) {
    return this.prisma.$transaction(async (tx) => {
      const actualizado = await tx.diseno.update({
        where: { id },
        data: { estado: nuevoEstado, ...dataAdicional },
      });

      await this.auditoria.registrar(
        {
          pedidoId: diseno.pedidoId,
          entidad: 'Diseno',
          entidadId: id,
          campo,
          valorAnterior: diseno.estado,
          valorNuevo: nuevoEstado,
          origen: 'USUARIO',
          autorRol: autor.autorRol,
          autorUsuarioId: autor.autorUsuarioId,
        },
        tx,
      );

      return actualizado;
    });
  }
}
