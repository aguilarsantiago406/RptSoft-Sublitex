import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class CatalogoService {
  constructor(private readonly prisma: PrismaService) {}

  listTiposProducto() {
    return this.prisma.tipoProducto.findMany({
      where: { activo: true },
      orderBy: [{ orden: 'asc' }, { codigo: 'asc' }],
      select: {
        id: true,
        codigo: true,
        nombre: true,
        camisetas: true,
        shorts: true,
        medias: true,
      },
    }).then((productos) =>
      productos.map(({ camisetas, shorts, medias, ...producto }) => ({
        ...producto,
        componentes: { camisetas, shorts, medias },
      })),
    );
  }

  listTallas(tipoProductoId?: string) {
    return this.prisma.tallaCatalogo.findMany({
      where: { activo: true, ...(tipoProductoId ? { tipoProductoId } : {}) },
      include: { tipoProducto: true },
      orderBy: [{ tipoProductoId: 'asc' }, { orden: 'asc' }],
    });
  }

  listAtributos() {
    return this.prisma.atributo.findMany({
      where: { activo: true },
      include: { valores: { where: { activo: true }, orderBy: { orden: 'asc' } } },
      orderBy: { orden: 'asc' },
    });
  }

  listUbicaciones() {
    return this.prisma.ubicacionPersonalizacion.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
    });
  }
}