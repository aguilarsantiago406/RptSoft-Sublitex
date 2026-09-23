import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreatePersonalizacionDto } from './dto/create-personalizacion.dto';

@Injectable()
export class PersonalizacionesService {
  constructor(private readonly prisma: PrismaService) {}

  private async validarListaAbiertaPorPedidoId(pedidoId?: string) {
    if (!pedidoId) return;
    const bloqueLista = await this.prisma.bloquePedido?.findFirst?.({
      where: { pedidoId, tipo: 'LISTA', estado: 'CERRADO' },
    });
    if (bloqueLista) {
      throw new BadRequestException('El bloque LISTA de este pedido está CERRADO. No se pueden modificar las personalizaciones.');
    }
  }

  async crear(dto: CreatePersonalizacionDto) {
    if (this.prisma.prenda?.findUnique) {
      const prenda = await this.prisma.prenda.findUnique({
        where: { id: dto.prendaId },
        include: { grupo: true },
      });
      if (!prenda) throw new NotFoundException('Prenda no encontrada.');

      // R-H03: Candado de lista cerrada
      await this.validarListaAbiertaPorPedidoId(prenda.grupo?.pedidoId);
    }

    return this.prisma.personalizacion.create({
      data: {
        prendaId: dto.prendaId,
        ubicacionId: dto.ubicacionId,
        contenido: dto.contenido,
      },
    });
  }

  async eliminar(id: string) {
    const existe = await this.prisma.personalizacion.findUnique({
      where: { id },
      include: { prenda: { include: { grupo: true } } },
    });
    if (!existe) throw new NotFoundException('Personalización no encontrada.');

    // R-H03: Candado de lista cerrada
    await this.validarListaAbiertaPorPedidoId(existe.prenda?.grupo?.pedidoId);

    await this.prisma.personalizacion.delete({ where: { id } });
    return {};
  }
}
