import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateExcepcionDto } from './dto/create-excepcion.dto';

@Injectable()
export class ExcepcionesService {
  constructor(private readonly prisma: PrismaService) {}

  private async validarListaAbiertaPorPedidoId(pedidoId?: string) {
    if (!pedidoId) return;
    const bloqueLista = await this.prisma.bloquePedido?.findFirst?.({
      where: { pedidoId, tipo: 'LISTA', estado: 'CERRADO' },
    });
    if (bloqueLista) {
      throw new BadRequestException('El bloque LISTA de este pedido está CERRADO. No se pueden modificar las excepciones.');
    }
  }

  async crear(dto: CreateExcepcionDto) {
    if (this.prisma.prenda?.findUnique) {
      const prenda = await this.prisma.prenda.findUnique({
        where: { id: dto.prendaId },
        include: { grupo: true },
      });
      if (!prenda) throw new NotFoundException('Prenda no encontrada.');

      // R-H03: Candado de lista cerrada
      await this.validarListaAbiertaPorPedidoId(prenda.grupo?.pedidoId);
    }

    return this.prisma.excepcionPrenda.create({
      data: {
        prendaId: dto.prendaId,
        atributoId: dto.atributoId,
        valorAtributoId: dto.valorAtributoId,
        motivo: dto.motivo,
      },
    });
  }

  async eliminar(id: string) {
    const existe = await this.prisma.excepcionPrenda.findUnique({
      where: { id },
      include: { prenda: { include: { grupo: true } } },
    });
    if (!existe) throw new NotFoundException('Excepción no encontrada.');

    // R-H03: Candado de lista cerrada
    await this.validarListaAbiertaPorPedidoId(existe.prenda?.grupo?.pedidoId);

    await this.prisma.excepcionPrenda.delete({ where: { id } });
    return {};
  }
}
