import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateExcepcionDto } from './dto/create-excepcion.dto';

@Injectable()
export class ExcepcionesService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CreateExcepcionDto) {
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
    const existe = await this.prisma.excepcionPrenda.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException('Excepción no encontrada.');

    await this.prisma.excepcionPrenda.delete({ where: { id } });
    return {};
  }
}
