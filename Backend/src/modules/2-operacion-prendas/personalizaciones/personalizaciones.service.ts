import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreatePersonalizacionDto } from './dto/create-personalizacion.dto';

@Injectable()
export class PersonalizacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CreatePersonalizacionDto) {
    return this.prisma.personalizacion.create({
      data: {
        prendaId: dto.prendaId,
        ubicacionId: dto.ubicacionId,
        contenido: dto.contenido,
      },
    });
  }

  async eliminar(id: string) {
    const existe = await this.prisma.personalizacion.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException('Personalización no encontrada.');

    await this.prisma.personalizacion.delete({ where: { id } });
    return {};
  }
}
