import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { TipoBloque, EstadoBloque } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateGrupoDto, PoliticaNumeracion } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { UpdatePoliticaDto } from './dto/update-politica.dto';

@Injectable()
export class GrupoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(pedidoId: string, dto: CreateGrupoDto) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: { id: true },
    });
    if (!pedido) throw new NotFoundException('Pedido no encontrado: ' + pedidoId);

    const tipoProducto = await this.prisma.tipoProducto.findUnique({
      where: { id: dto.tipoProductoId },
      select: { id: true },
    });
    if (!tipoProducto) {
      throw new NotFoundException('Tipo de producto no encontrado: ' + dto.tipoProductoId);
    }

    try {
      return await this.prisma.grupo.create({
        data: {
          nombre: dto.nombre,
          politicaNumeracion: dto.politicaNumeracion,
          cantidadContratada: dto.cantidadContratada,
          observaciones: dto.observaciones,
          pedido: { connect: { id: pedidoId } },
          tipoProducto: { connect: { id: dto.tipoProductoId } },
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(
          'Ya existe un grupo con ese nombre en el pedido (R-B01): ' + dto.nombre,
        );
      }
      throw error;
    }
  }

  async findByPedido(pedidoId: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: { id: true },
    });
    if (!pedido) throw new NotFoundException('Pedido no encontrado: ' + pedidoId);
    const grupos = await this.prisma.grupo.findMany({
      where: { pedidoId },
      include: {
        tipoProducto: true,
        configuracion: {
          include: { atributo: true, valor: true },
          orderBy: { atributo: { orden: 'asc' } },
        },
      },
    });
    return grupos.map((grupo) => this.toResponse(grupo));
  }

  async findOne(id: string) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id },
      include: {
        tipoProducto: true,
        pedido: true,
        configuracion: {
          include: { atributo: true, valor: true },
          orderBy: { atributo: { orden: 'asc' } },
        },
      },
    });
    if (!grupo) throw new NotFoundException('Grupo no encontrado: ' + id);
    return this.toResponse(grupo);
  }

  private toResponse(grupo: any) {
    return {
      ...grupo,
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
      configuracion: grupo.configuracion?.map((configuracion: any) => ({
        atributo: configuracion.atributo.codigo,
        valor: configuracion.valor.codigo,
      })) ?? [],
    };
  }

  async remove(id: string) {
    const grupo = await this.findOne(id);
    if (this.prisma.bloquePedido) {
      const bloqueLista = await this.prisma.bloquePedido.findUnique({
        where: { pedidoId_tipo: { pedidoId: grupo.pedidoId, tipo: TipoBloque.LISTA } },
      });
      if (bloqueLista?.estado === EstadoBloque.CERRADO) {
        throw new BadRequestException('No se puede eliminar un grupo con el bloque Lista cerrado (R-H12)');
      }
    }
    const [participantes, prendas] = await Promise.all([
      this.prisma.participante.count({ where: { grupoId: id } }),
      this.prisma.prenda.count({ where: { grupoId: id } }),
    ]);

    if (participantes > 0 || prendas > 0) {
      throw new ConflictException(
        'No se puede eliminar un grupo con participantes o prendas registradas',
      );
    }

    await this.prisma.grupo.delete({ where: { id } });
    return { id: grupo.id, eliminado: true };
  }

  async update(id: string, dto: UpdateGrupoDto) {
    const grupoActual = await this.findOne(id);
    if (this.prisma.bloquePedido) {
      const bloqueLista = await this.prisma.bloquePedido.findUnique({
        where: { pedidoId_tipo: { pedidoId: grupoActual.pedidoId, tipo: TipoBloque.LISTA } },
      });
      if (bloqueLista?.estado === EstadoBloque.CERRADO) {
        throw new BadRequestException('No se puede modificar un grupo con el bloque Lista cerrado (R-H12)');
      }
    }

    try {
      const grupo = await this.prisma.grupo.update({
        where: { id },
        data: {
          ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
          ...(dto.politicaNumeracion !== undefined ? { politicaNumeracion: dto.politicaNumeracion } : {}),
          ...(dto.cantidadContratada !== undefined ? { cantidadContratada: dto.cantidadContratada } : {}),
          ...(dto.observaciones !== undefined ? { observaciones: dto.observaciones } : {}),
          ...(dto.tipoProductoId !== undefined
            ? { tipoProducto: { connect: { id: dto.tipoProductoId } } }
            : {}),
        },
        include: {
          tipoProducto: true,
          configuracion: {
            include: { atributo: true, valor: true },
            orderBy: { atributo: { orden: 'asc' } },
          },
        },
      });

      if (dto.configuracion?.length) {
        for (const item of dto.configuracion) {
          const valorAtributo = await this.prisma.valorAtributo.findFirst({
            where: { id: item.valorAtributoId, atributoId: item.atributoId },
          });
          if (!valorAtributo) {
            throw new NotFoundException(
              `El valor '${item.valorAtributoId}' no pertenece al atributo '${item.atributoId}'`,
            );
          }

          await this.prisma.valorConfiguracion.upsert({
            where: { grupoId_atributoId: { grupoId: id, atributoId: item.atributoId } },
            create: {
              grupoId: id,
              atributoId: item.atributoId,
              valorAtributoId: item.valorAtributoId,
            },
            update: {
              valorAtributoId: item.valorAtributoId,
            },
          });
        }
      }

      return this.toResponse({
        ...grupo,
        configuracion: await this.prisma.valorConfiguracion.findMany({
          where: { grupoId: id },
          include: { atributo: true, valor: true },
          orderBy: { atributo: { orden: 'asc' } },
        }),
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Ya existe un grupo con ese nombre en el pedido (R-B01)');
      }
      if (error?.code === 'P2025') {
        throw new NotFoundException('Tipo de producto no encontrado: ' + dto.tipoProductoId);
      }
      throw error;
    }
  }

  async updatePolitica(id: string, dto: UpdatePoliticaDto) {
    const grupo = await this.findOne(id);
    if (this.prisma.bloquePedido) {
      const bloqueLista = await this.prisma.bloquePedido.findUnique({
        where: { pedidoId_tipo: { pedidoId: grupo.pedidoId, tipo: TipoBloque.LISTA } },
      });
      if (bloqueLista?.estado === EstadoBloque.CERRADO) {
        throw new BadRequestException('No se puede modificar la politica con el bloque Lista cerrado (R-H12)');
      }
    }
    if (grupo.politicaNumeracion === dto.politicaNumeracion) {
      return { id: grupo.id, nombre: grupo.nombre, politicaNumeracion: dto.politicaNumeracion };
    }
    try {
      const actualizado = await this.prisma.grupo.update({
        where: { id },
        data: { politicaNumeracion: dto.politicaNumeracion },
      });
      return {
        id: actualizado.id,
        nombre: actualizado.nombre,
        politicaNumeracion: actualizado.politicaNumeracion,
      };
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(
          'No se puede cambiar la política: existen números repetidos en el grupo (R-G06)',
        );
      }
      throw error;
    }
  }
}