import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Optional } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { TipoBloque, EstadoBloque, PoliticaNumeracion, RolUsuario } from '@prisma/client';
import { ReabrirBloqueDto } from './dto/reabrir-bloque.dto';
import { AcusarReciboDto, AreaAcuse } from './dto/acusar-recibo.dto';
import { AuditoriaService } from '../../5-auditoria/auditoria/auditoria.service';

@Injectable()
export class BloqueService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly auditoria?: AuditoriaService,
  ) {}

  async getBloques(pedidoId: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
    });
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado: ' + pedidoId);
    }

    const tipos = [TipoBloque.DISENO, TipoBloque.LISTA, TipoBloque.COMERCIAL];
    for (const tipo of tipos) {
      await this.prisma.bloquePedido.upsert({
        where: { pedidoId_tipo: { pedidoId, tipo } },
        update: {},
        create: {
          pedidoId,
          tipo,
          estado: EstadoBloque.ABIERTO,
        },
      });
    }

    return this.prisma.bloquePedido.findMany({
      where: { pedidoId },
      include: {
        cerradoPor: {
          select: { id: true, nombre: true, email: true, rol: true },
        },
        versiones: {
          orderBy: { numero: 'desc' },
          take: 5,
          include: {
            creadoPor: {
              select: { id: true, nombre: true, email: true },
            },
          },
        },
      },
      orderBy: { tipo: 'asc' },
    });
  }

  async cerrarBloque(pedidoId: string, tipo: TipoBloque, userId: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        grupos: {
          include: {
            prendas: {
              include: {
                talla: true,
                excepciones: {
                  include: { atributo: true, valor: true },
                },
                personalizaciones: {
                  include: { ubicacion: true },
                },
              },
            },
          },
        },
        disenos: true,
        confirmaciones: { orderBy: { version: 'desc' }, take: 1 },
      },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado: ' + pedidoId);
    }

    let bloque = await this.prisma.bloquePedido.findUnique({
      where: { pedidoId_tipo: { pedidoId, tipo } },
    });

    if (!bloque) {
      bloque = await this.prisma.bloquePedido.create({
        data: {
          pedidoId,
          tipo,
          estado: EstadoBloque.ABIERTO,
        },
      });
    }

    if (bloque.estado === EstadoBloque.CERRADO) {
      throw new BadRequestException(`El bloque ${tipo} ya se encuentra cerrado`);
    }

    if (tipo === TipoBloque.DISENO) {
      const tieneAprobado = pedido.disenos && pedido.disenos.some((d: any) => d.estado === 'APROBADO');
      if (!tieneAprobado) {
        throw new BadRequestException('No se puede cerrar el bloque Diseno sin un diseno aprobado (R-H02)');
      }
    }

    if (tipo === TipoBloque.LISTA) {
      if (pedido.grupos.length === 0) {
        throw new BadRequestException('No se puede cerrar el bloque Lista sin grupos en el pedido');
      }

      for (const grupo of pedido.grupos) {
        if (grupo.prendas.length !== grupo.cantidadContratada) {
          throw new BadRequestException(
            `El grupo ${grupo.nombre} tiene ${grupo.prendas.length} prendas registradas pero requiere ${grupo.cantidadContratada} contratadas (R-B02)`,
          );
        }

        for (const prenda of grupo.prendas) {
          if (!prenda.tallaId) {
            throw new BadRequestException(`La prenda ${prenda.id} no tiene talla asignada (R-E03)`);
          }
          if (!prenda.numero) {
            throw new BadRequestException(`La prenda ${prenda.id} no tiene numero asignado (R-E03)`);
          }
          if (!prenda.nombreEnPrenda) {
            throw new BadRequestException(`La prenda ${prenda.id} no tiene nombre en prenda asignado (R-E03)`);
          }
        }

        if (grupo.politicaNumeracion === PoliticaNumeracion.UNICA) {
          const numerosValidos = grupo.prendas
            .map((p) => p.numero)
            .filter((num): num is string => !!num && num !== 'S/N');
          const repetidos = numerosValidos.filter((n, i) => numerosValidos.indexOf(n) !== i);
          if (repetidos.length > 0) {
            throw new BadRequestException(
              `Politica UNICA violada en grupo ${grupo.nombre}: numeros repetidos [${[...new Set(repetidos)].join(', ')}] (R-G03)`,
            );
          }
        }
      }
    }

    const ultimaVersion = await this.prisma.versionBloque.findFirst({
      where: { bloqueId: bloque.id },
      orderBy: { numero: 'desc' },
    });
    const nuevoNumero = (ultimaVersion?.numero ?? 0) + 1;

    const snapshot = this.construirSnapshot(pedido, tipo);

    await this.prisma.versionBloque.create({
      data: {
        bloqueId: bloque.id,
        numero: nuevoNumero,
        contenido: snapshot,
        creadoPorId: userId,
      },
    });

    const bloqueCerrado = await this.prisma.bloquePedido.update({
      where: { id: bloque.id },
      data: {
        estado: EstadoBloque.CERRADO,
        cerradoEn: new Date(),
        cerradoPorId: userId,
      },
      include: {
        cerradoPor: {
          select: { id: true, nombre: true, email: true },
        },
      },
    });

    return {
      bloque: bloqueCerrado,
      version: nuevoNumero,
      mensaje: `Bloque ${tipo} cerrado exitosamente`,
    };
  }

  async reabrirBloque(pedidoId: string, tipo: TipoBloque, dto: ReabrirBloqueDto, userId: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        grupos: {
          include: {
            prendas: {
              include: {
                talla: true,
                excepciones: {
                  include: { atributo: true, valor: true },
                },
                personalizaciones: {
                  include: { ubicacion: true },
                },
              },
            },
          },
        },
        disenos: true,
        confirmaciones: { orderBy: { version: 'desc' }, take: 1 },
      },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado: ' + pedidoId);
    }

    const bloque = await this.prisma.bloquePedido.findUnique({
      where: { pedidoId_tipo: { pedidoId, tipo } },
    });

    if (!bloque || bloque.estado !== EstadoBloque.CERRADO) {
      throw new BadRequestException(`El bloque ${tipo} no se encuentra cerrado, no requiere reapertura`);
    }

    const ultimaVersion = await this.prisma.versionBloque.findFirst({
      where: { bloqueId: bloque.id },
      orderBy: { numero: 'desc' },
    });
    const siguienteNumero = (ultimaVersion?.numero ?? 0) + 1;

    const snapshot = this.construirSnapshot(pedido, tipo);
    const diff = {
      versionAnterior: ultimaVersion?.numero ?? 0,
      motivoReapertura: dto.motivoReapertura,
      fechaReapertura: new Date().toISOString(),
      reabiertoPorId: userId,
    };

    const partesEnTaller = await this.prisma.nestingParte.count({
      where: { pedidoId },
    });
    const alertaTaller = partesEnTaller > 0;

    const versionCreada = await this.prisma.versionBloque.create({
      data: {
        bloqueId: bloque.id,
        numero: siguienteNumero,
        contenido: snapshot,
        motivoReapertura: dto.motivoReapertura,
        diff,
        creadoPorId: userId,
      },
    });

    const bloqueActualizado = await this.prisma.bloquePedido.update({
      where: { id: bloque.id },
      data: {
        estado: EstadoBloque.ABIERTO,
        cerradoEn: null,
        cerradoPorId: null,
      },
    });

    return {
      bloque: bloqueActualizado,
      version: versionCreada,
      alertaTaller,
      mensaje: alertaTaller
        ? 'Bloque reabierto con alerta de produccion: el pedido ya tiene partes en taller (R-H14)'
        : 'Bloque reabierto exitosamente',
    };
  }

  /**
   * R-H14 · Acuse de recibo en taller y diseno tras reapertura.
   * Si el pedido ya esta en produccion, la reapertura genera una alerta
   * que debe ser acusada de recibo formalmente por diseno o produccion.
   */
  async acusarReciboVersion(
    pedidoId: string,
    versionId: string,
    user: { id: string; rol: RolUsuario },
    dto?: AcusarReciboDto,
  ) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
    });
    if (!pedido) {
      throw new NotFoundException(`Pedido no encontrado: ${pedidoId}`);
    }

    const version = await this.prisma.versionBloque.findUnique({
      where: { id: versionId },
      include: {
        bloque: true,
        creadoPor: { select: { id: true, nombre: true, email: true, rol: true } },
      },
    });

    if (!version) {
      throw new NotFoundException(`Versión de bloque no encontrada: ${versionId}`);
    }

    if (version.bloque.pedidoId !== pedidoId) {
      throw new BadRequestException(
        `La versión ${versionId} pertenece al pedido ${version.bloque.pedidoId}, no al pedido ${pedidoId}`,
      );
    }

    // Determinar area segun rol o DTO
    let area: AreaAcuse;
    if (user.rol === RolUsuario.DISENO) {
      area = AreaAcuse.DISENO;
    } else if (user.rol === RolUsuario.PRODUCCION) {
      area = AreaAcuse.PRODUCCION;
    } else if (
      user.rol === RolUsuario.ADMINISTRADOR ||
      user.rol === RolUsuario.COORDINADOR_OPERATIVO
    ) {
      area = dto?.area ?? AreaAcuse.PRODUCCION;
    } else {
      throw new ForbiddenException(
        'Solo usuarios con rol DISENO, PRODUCCION, ADMINISTRADOR o COORDINADOR_OPERATIVO pueden acusar recibo (R-H14)',
      );
    }

    // Verificar si ya fue acusada
    const yaAcusadoDiseno = !!version.acusadoDisenoEn;
    const yaAcusadoProduccion = !!version.acusadoProduccionEn;

    if (area === AreaAcuse.DISENO && yaAcusadoDiseno) {
      return {
        mensaje: 'La versión ya contaba con acuse de recibo de Diseño.',
        yaAcusado: true,
        area: AreaAcuse.DISENO,
        version,
      };
    }

    if (area === AreaAcuse.PRODUCCION && yaAcusadoProduccion) {
      return {
        mensaje: 'La versión ya contaba con acuse de recibo de Producción / Taller.',
        yaAcusado: true,
        area: AreaAcuse.PRODUCCION,
        version,
      };
    }

    const ahora = new Date();
    const dataUpdate: any = {};
    if (area === AreaAcuse.DISENO) {
      dataUpdate.acusadoDisenoEn = ahora;
    } else if (area === AreaAcuse.PRODUCCION) {
      dataUpdate.acusadoProduccionEn = ahora;
    } else if (area === AreaAcuse.AMBAS) {
      if (!yaAcusadoDiseno) dataUpdate.acusadoDisenoEn = ahora;
      if (!yaAcusadoProduccion) dataUpdate.acusadoProduccionEn = ahora;
    }

    let versionActualizada: any;
    try {
      versionActualizada = await this.prisma.versionBloque.update({
        where: { id: versionId },
        data: dataUpdate,
        include: {
          bloque: true,
          creadoPor: { select: { id: true, nombre: true, email: true, rol: true } },
        },
      });
    } catch {
      // Fallback a funcion security definer si los permisos de UPDATE estan revocados (01_constraints.sql)
      const areaParam = area === AreaAcuse.AMBAS ? 'PRODUCCION' : area;
      if (typeof (this.prisma as any).$executeRawUnsafe === 'function') {
        await (this.prisma as any).$executeRawUnsafe(
          `SELECT acusar_recibo_version($1, $2)`,
          versionId,
          areaParam,
        );
      }
      versionActualizada = await this.prisma.versionBloque.findUnique({
        where: { id: versionId },
        include: {
          bloque: true,
          creadoPor: { select: { id: true, nombre: true, email: true, rol: true } },
        },
      });
    }

    // Registrar en auditoria inmutable (R-I01)
    if (this.auditoria) {
      await this.auditoria.registrar({
        pedidoId,
        entidad: 'VersionBloque',
        entidadId: versionId,
        campo: area === AreaAcuse.DISENO ? 'acusadoDisenoEn' : 'acusadoProduccionEn',
        valorAnterior: null,
        valorNuevo: ahora.toISOString(),
        origen: 'USUARIO',
        autorUsuarioId: user.id,
        autorRol: user.rol,
      });
    }

    return {
      mensaje: `Acuse de recibo formal registrado exitosamente para ${area} (R-H14)`,
      yaAcusado: false,
      area,
      version: versionActualizada,
    };
  }

  /**
   * R-H14 · Consultar versiones de bloques que requieren acuse de recibo pendiente.
   */
  async listarVersionesPendientesAcuse(pedidoId: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
    });
    if (!pedido) {
      throw new NotFoundException(`Pedido no encontrado: ${pedidoId}`);
    }

    const versiones = await this.prisma.versionBloque.findMany({
      where: {
        bloque: { pedidoId },
        OR: [
          { acusadoDisenoEn: null },
          { acusadoProduccionEn: null },
        ],
      },
      include: {
        bloque: true,
        creadoPor: { select: { id: true, nombre: true, email: true, rol: true } },
      },
      orderBy: { creadoEn: 'desc' },
    });

    const partesEnTaller = await this.prisma.nestingParte.count({
      where: { pedidoId },
    });

    return {
      pedidoId,
      alertaTallerActiva: partesEnTaller > 0,
      totalPendientes: versiones.length,
      versiones: versiones.map((v) => ({
        id: v.id,
        bloqueId: v.bloqueId,
        tipoBloque: v.bloque.tipo,
        numero: v.numero,
        motivoReapertura: v.motivoReapertura,
        acusadoDisenoEn: v.acusadoDisenoEn,
        acusadoProduccionEn: v.acusadoProduccionEn,
        pendienteDiseno: !v.acusadoDisenoEn,
        pendienteProduccion: !v.acusadoProduccionEn,
        creadoEn: v.creadoEn,
        creadoPor: v.creadoPor,
      })),
    };
  }

  private construirSnapshot(pedido: any, tipo: TipoBloque) {
    if (tipo === TipoBloque.LISTA) {
      return {
        grupos: pedido.grupos.map((g: any) => ({
          id: g.id,
          nombre: g.nombre,
          politicaNumeracion: g.politicaNumeracion,
          cantidadContratada: g.cantidadContratada,
          prendas: g.prendas.map((p: any) => ({
            id: p.id,
            talla: p.talla?.codigo,
            numero: p.numero,
            genero: p.genero,
            tipoPrenda: p.tipoPrenda,
            nombreEnPrenda: p.nombreEnPrenda,
            esArquero: p.esArquero,
            excepciones: (p.excepciones || []).map((e: any) => ({
              atributo: e.atributo?.codigo,
              valor: e.valor?.codigo,
            })),
            personalizaciones: (p.personalizaciones || []).map((per: any) => ({
              ubicacion: per.ubicacion?.codigo,
              contenido: per.contenido,
            })),
          })),
        })),
      };
    }
    if (tipo === TipoBloque.DISENO) {
      return {
        disenos: (pedido.disenos || []).map((d: any) => ({
          id: d.id,
          estado: d.estado,
          archivoUrl: d.archivoUrl,
          imagenUrl: d.imagenUrl,
        })),
      };
    }
    return {
      codigo: pedido.codigo,
      estado: pedido.estado,
      fechaCompromiso: pedido.fechaCompromiso,
      ultimaConfirmacion: pedido.confirmaciones?.[0] ?? null,
    };
  }
}
