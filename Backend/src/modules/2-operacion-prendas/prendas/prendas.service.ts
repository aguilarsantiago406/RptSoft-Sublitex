import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreatePrendaDto } from './dto/create-prenda.dto';
import { UpdateFichaMinimaDto } from './dto/update-ficha-minima.dto';

@Injectable()
export class PrendasService {
  constructor(private readonly prisma: PrismaService) { }

  async crear(dto: CreatePrendaDto) {
    const prenda = await this.prisma.prenda.create({
      data: {
        participanteId: dto.participanteId,
        grupoId: dto.grupoId,
        tipoProductoId: dto.tipoProductoId,
        tallaId: dto.tallaId,
        numero: dto.numero,
        genero: (dto.genero as any) || 'SIN_ESPECIFICAR',
        tipoPrenda: (dto.tipoPrenda as any) || 'VENTA',
        colorId: dto.colorId,
        nombreEnPrenda: dto.nombreEnPrenda,
        esArquero: dto.esArquero ?? false,
      },
    });

    // En R-K02, las de OBSEQUIO o MUESTRA tienen precio 0.00
    const precioCalculado = prenda.tipoPrenda === 'VENTA' ? 55.0 : 0.0;
    return { ...prenda, precioCalculado };
  }

  async actualizarFichaMinima(id: string, dto: UpdateFichaMinimaDto) {
    const prendaExiste = await this.prisma.prenda.findUnique({ where: { id } });
    if (!prendaExiste) throw new NotFoundException('Prenda no encontrada.');

    const prenda = await this.prisma.prenda.update({
      where: { id },
      data: {
        tallaId: dto.tallaId,
        numero: dto.numero,
        genero: dto.genero as any,
        nombreEnPrenda: dto.nombreEnPrenda,
      },
    });

    const precioCalculado = prenda.tipoPrenda === 'VENTA' ? 55.0 : 0.0;
    return { ...prenda, precioCalculado };
  }

  async eliminar(id: string) {
    const prendaExiste = await this.prisma.prenda.findUnique({ where: { id } });
    if (!prendaExiste) throw new NotFoundException('Prenda no encontrada.');

    await this.prisma.prenda.delete({ where: { id } });
    return {};
  }

  /**
   * R-K03: Multiplicacion por piezas fisicas reales (camisetas, shorts, medias).
   * La prenda es la unidad contable que se multiplica por los componentes de TipoProducto.
   */
  async obtenerResumenProduccion(pedidoId: string) {
    const prendas = await this.prisma.prenda.findMany({
      where: {
        grupo: { pedidoId },
      },
      include: {
        tipoProducto: true,
      },
    });

    let totalCamisetas = 0;
    let totalShorts = 0;
    let totalMedias = 0;
    let venta = 0;
    let obsequio = 0;
    let muestra = 0;
    let importeTotalEstimado = 0;

    for (const p of prendas) {
      // R-K03: Multiplicar componentes
      totalCamisetas += p.tipoProducto?.camisetas ?? 0;
      totalShorts += p.tipoProducto?.shorts ?? 0;
      totalMedias += p.tipoProducto?.medias ?? 0;

      // R-K02: Importes segun tipo
      if (p.tipoPrenda === 'VENTA') {
        venta++;
        importeTotalEstimado += 55.0; // Precio base tarifado
      } else if (p.tipoPrenda === 'OBSEQUIO') {
        obsequio++;
      } else if (p.tipoPrenda === 'MUESTRA') {
        muestra++;
      }
    }

    return {
      pedidoId,
      totalPrendas: prendas.length,
      desgloseTiposPrenda: {
        venta,
        obsequio,
        muestra,
      },
      piezasFisicas: {
        totalCamisetas,
        totalShorts,
        totalMedias,
      },
      importeTotalEstimado,
    };
  }
}
