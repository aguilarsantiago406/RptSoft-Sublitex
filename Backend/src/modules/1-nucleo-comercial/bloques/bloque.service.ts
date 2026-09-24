import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { TipoBloque, EstadoBloque, PoliticaNumeracion } from '@prisma/client';
import { ReabrirBloqueDto } from './dto/reabrir-bloque.dto';

@Injectable()
export class BloqueService {
  constructor(private readonly prisma: PrismaService) {}

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
