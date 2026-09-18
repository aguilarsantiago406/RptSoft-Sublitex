import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { AddColorDto } from './dto/add-color.dto';
import { EstadoPedido } from './estado-pedido.enum';
import { transicionValida } from './estado-pedido.transitions';

@Injectable()
export class PedidoService {
  constructor(private readonly prisma: PrismaService) {}

  private async generarCodigo(): Promise<string> {
    const pedidos = await this.prisma.pedido.findMany({
      select: { codigo: true },
    });
    const maximo = pedidos.reduce((mayor, actual) => {
      const match = /^SUB-(\d{4,})$/.exec(actual.codigo);
      if (!match) return mayor;
      return Math.max(mayor, parseInt(match[1], 10));
    }, 0);
    return 'SUB-' + String(maximo + 1).padStart(4, '0');
  }

  private async getSystemUserId(): Promise<string> {
    let user = await this.prisma.usuario.findFirst({
      where: { email: 'sistema@sublitex.com' },
    });
    if (!user) {
      user = await this.prisma.usuario.create({
        data: {
          email: 'sistema@sublitex.com',
          nombre: 'Sistema',
          rol: 'ADMINISTRADOR' as any,
        },
      });
    }
    return user.id;
  }

  async create(dto: CreatePedidoDto) {
    const ahora = new Date();
    const fechaCompromiso = new Date(dto.fechaCompromiso);
    if (fechaCompromiso <= ahora) {
      throw new BadRequestException(
        'La fecha de compromiso debe ser posterior a la fecha del pedido (R-A09)',
      );
    }
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: dto.clienteId },
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado: ' + dto.clienteId);

    const systemId = await this.getSystemUserId();
    const codigo = await this.generarCodigo();

    return this.prisma.pedido.create({
      data: {
        codigo,
        clienteId: dto.clienteId,
        fechaCompromiso,
        observaciones: dto.observaciones,
        estado: EstadoPedido.BORRADOR,
        creadoPorId: systemId,
        coordinadorId: systemId,
      },
      include: { cliente: true },
    });
  }

  async findAll(estado?: string, clienteId?: string) {
    const pedidos = await this.prisma.pedido.findMany({
      where: {
        ...(estado ? { estado: estado as EstadoPedido } : {}),
        ...(clienteId ? { clienteId } : {}),
      },
      include: {
        cliente: true,
      },
      orderBy: { fechaPedido: 'desc' },
    });
    if (pedidos.length === 0) return [];

    const prendasPorPedido = await this.prisma.prenda.groupBy({
      by: ['grupoId'],
      _count: { _all: true },
      where: { grupo: { pedidoId: { in: pedidos.map((pedido) => pedido.id) } } },
    });
    const grupos = await this.prisma.grupo.findMany({
      where: { pedidoId: { in: pedidos.map((pedido) => pedido.id) } },
      select: { id: true, pedidoId: true },
    });
    const pedidoPorGrupo = new Map(grupos.map((grupo) => [grupo.id, grupo.pedidoId]));
    const prendasPorPedidoId = new Map<string, number>();
    for (const grupo of prendasPorPedido) {
      const pedidoId = pedidoPorGrupo.get(grupo.grupoId);
      if (pedidoId) {
        prendasPorPedidoId.set(
          pedidoId,
          (prendasPorPedidoId.get(pedidoId) ?? 0) + grupo._count._all,
        );
      }
    }

    return pedidos.map((pedido) => ({
      ...pedido,
      totalPrendas: prendasPorPedidoId.get(pedido.id) ?? 0,
    }));
  }

  async findOne(id: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: {
        cliente: true,
        grupos: {
          include: {
            tipoProducto: true,
            configuracion: {
              include: { atributo: true, valor: true },
              orderBy: { atributo: { orden: 'asc' } },
            },
          },
        },
        colores: true,
      },
    });
    if (!pedido) throw new NotFoundException('Pedido no encontrado: ' + id);
    return {
      ...pedido,
      grupos: (pedido.grupos ?? []).map((grupo) => ({
        id: grupo.id,
        nombre: grupo.nombre,
        tipoProducto: grupo.tipoProducto ? {
          id: grupo.tipoProducto.id,
          codigo: grupo.tipoProducto.codigo,
          nombre: grupo.tipoProducto.nombre,
          componentes: {
            camisetas: grupo.tipoProducto.camisetas,
            shorts: grupo.tipoProducto.shorts,
            medias: grupo.tipoProducto.medias,
          },
        } : undefined,
        cantidadContratada: grupo.cantidadContratada,
        politicaNumeracion: grupo.politicaNumeracion,
        observaciones: grupo.observaciones,
        configuracion: (grupo.configuracion ?? []).map((configuracion) => ({
          atributo: configuracion.atributo.codigo,
          valor: configuracion.valor.codigo,
        })),
      })),
    };
  }

  async resumenProduccion(id: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      select: {
        id: true,
        codigo: true,
        grupos: {
          include: {
            tipoProducto: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
                camisetas: true,
                shorts: true,
                medias: true,
              },
            },
            prendas: {
              select: {
                id: true,
                tipoProducto: {
                  select: {
                    codigo: true,
                    camisetas: true,
                    shorts: true,
                    medias: true,
                  },
                },
              },
            },
          },
          orderBy: { nombre: 'asc' },
        },
      },
    });
    if (!pedido) throw new NotFoundException('Pedido no encontrado: ' + id);

    const grupos = pedido.grupos.map((grupo) => {
      const piezasContratadas = {
        camisetas: grupo.cantidadContratada * grupo.tipoProducto.camisetas,
        shorts: grupo.cantidadContratada * grupo.tipoProducto.shorts,
        medias: grupo.cantidadContratada * grupo.tipoProducto.medias,
      };
      const piezasRegistradas = grupo.prendas.reduce(
        (totales, prenda) => ({
          camisetas: totales.camisetas + prenda.tipoProducto.camisetas,
          shorts: totales.shorts + prenda.tipoProducto.shorts,
          medias: totales.medias + prenda.tipoProducto.medias,
        }),
        { camisetas: 0, shorts: 0, medias: 0 },
      );
      const diferencia = {
        camisetas: piezasRegistradas.camisetas - piezasContratadas.camisetas,
        shorts: piezasRegistradas.shorts - piezasContratadas.shorts,
        medias: piezasRegistradas.medias - piezasContratadas.medias,
      };

      return {
        grupoId: grupo.id,
        nombre: grupo.nombre,
        tipoProducto: {
          id: grupo.tipoProducto.id,
          codigo: grupo.tipoProducto.codigo,
          nombre: grupo.tipoProducto.nombre,
          componentes: {
            camisetas: grupo.tipoProducto.camisetas,
            shorts: grupo.tipoProducto.shorts,
            medias: grupo.tipoProducto.medias,
          },
        },
        cantidadContratada: grupo.cantidadContratada,
        prendasRegistradas: grupo.prendas.length,
        prendasFaltantes: Math.max(grupo.cantidadContratada - grupo.prendas.length, 0),
        prendasSobrantes: Math.max(grupo.prendas.length - grupo.cantidadContratada, 0),
        estado: grupo.prendas.length < grupo.cantidadContratada
          ? 'FALTANTES'
          : grupo.prendas.length > grupo.cantidadContratada
            ? 'EXCEDENTE'
            : 'COMPLETO',
        piezasContratadas,
        piezasRegistradas,
        diferencia,
      };
    });

    return {
      pedidoId: pedido.id,
      codigo: pedido.codigo,
      totalPrendas: grupos.reduce((total, grupo) => total + grupo.prendasRegistradas, 0),
      grupos,
      totales: grupos.reduce(
        (totales, grupo) => ({
          cantidadContratada: totales.cantidadContratada + grupo.cantidadContratada,
          prendasRegistradas: totales.prendasRegistradas + grupo.prendasRegistradas,
          prendasFaltantes: totales.prendasFaltantes + grupo.prendasFaltantes,
          prendasSobrantes: totales.prendasSobrantes + grupo.prendasSobrantes,
          piezasContratadas: {
            camisetas: totales.piezasContratadas.camisetas + grupo.piezasContratadas.camisetas,
            shorts: totales.piezasContratadas.shorts + grupo.piezasContratadas.shorts,
            medias: totales.piezasContratadas.medias + grupo.piezasContratadas.medias,
          },
          piezasRegistradas: {
            camisetas: totales.piezasRegistradas.camisetas + grupo.piezasRegistradas.camisetas,
            shorts: totales.piezasRegistradas.shorts + grupo.piezasRegistradas.shorts,
            medias: totales.piezasRegistradas.medias + grupo.piezasRegistradas.medias,
          },
        }),
        {
          cantidadContratada: 0,
          prendasRegistradas: 0,
          prendasFaltantes: 0,
          prendasSobrantes: 0,
          piezasContratadas: { camisetas: 0, shorts: 0, medias: 0 },
          piezasRegistradas: { camisetas: 0, shorts: 0, medias: 0 },
        },
      ),
    };
  }

  async updateEstado(id: string, dto: UpdateEstadoDto) {
    const pedido = await this.findOne(id);
    const actual = pedido.estado as EstadoPedido;
    const destino = dto.estado;

    if (!transicionValida(actual, destino)) {
      throw new BadRequestException(
        `Transición inválida de ${actual} a ${destino} (R-A06)`,
      );
    }
    if (actual === EstadoPedido.BORRADOR && destino !== EstadoPedido.CANCELADO) {
      if (!pedido.fechaCompromiso) {
        throw new BadRequestException(
          'La fecha de compromiso es obligatoria para salir de BORRADOR (R-A09)',
        );
      }
      if (new Date(pedido.fechaCompromiso) <= new Date(pedido.fechaPedido)) {
        throw new BadRequestException(
          'La fecha de compromiso debe ser posterior a la fecha del pedido (R-A09)',
        );
      }
    }

    return this.prisma.pedido.update({
      where: { id },
      data: {
        estado: destino,
        ...(destino === EstadoPedido.CANCELADO ? { canceladoEn: new Date() } : {}),
      },
    });
  }

  async addColor(pedidoId: string, dto: AddColorDto) {
    await this.findOne(pedidoId);
    try {
      return await this.prisma.colorPedido.create({
        data: {
          nombre: dto.nombre,
          codigoHex: dto.codigoHex,
          referenciaFisica: dto.referenciaFisica,
          pedido: { connect: { id: pedidoId } },
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new BadRequestException(
          'Ya existe un color con ese nombre en el pedido (R-K05)',
        );
      }
      throw error;
    }
  }

  async addColors(pedidoId: string, dtos: AddColorDto[]) {
    await this.findOne(pedidoId);
    try {
      return await this.prisma.$transaction(
        dtos.map((dto) =>
          this.prisma.colorPedido.create({
            data: {
              nombre: dto.nombre,
              codigoHex: dto.codigoHex,
              referenciaFisica: dto.referenciaFisica,
              pedido: { connect: { id: pedidoId } },
            },
          }),
        ),
      );
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new BadRequestException(
          'Ya existe un color con ese nombre en el pedido (R-K05)',
        );
      }
      throw error;
    }
  }

  async getColores(pedidoId: string) {
    await this.findOne(pedidoId);
    return this.prisma.colorPedido.findMany({ where: { pedidoId } });
  }

  async deleteColor(pedidoId: string, colorId: string) {
    await this.findOne(pedidoId);
    try {
      const color = await this.prisma.colorPedido.findFirst({
        where: { id: colorId, pedidoId },
        select: { id: true },
      });
      if (!color) {
        throw new NotFoundException('Color no encontrado: ' + colorId);
      }
      return await this.prisma.colorPedido.delete({
        where: { id: colorId },
      });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('Color no encontrado: ' + colorId);
      }
      throw error;
    }
  }
}