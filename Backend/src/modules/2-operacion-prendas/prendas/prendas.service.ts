import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreatePrendaDto } from './dto/create-prenda.dto';
import { UpdateFichaMinimaDto } from './dto/update-ficha-minima.dto';

@Injectable()
export class PrendasService {
  constructor(private readonly prisma: PrismaService) { }

  private async validarListaAbiertaPorPedidoId(pedidoId?: string) {
    if (!pedidoId) return;
    const bloqueLista = await this.prisma.bloquePedido?.findFirst?.({
      where: { pedidoId, tipo: 'LISTA', estado: 'CERRADO' },
    });
    if (bloqueLista) {
      throw new BadRequestException('El bloque LISTA de este pedido está CERRADO. No se permiten modificaciones en las prendas.');
    }
  }

  private async obtenerPrecioBase(tipoPrenda: string): Promise<number> {
    if (tipoPrenda !== 'VENTA') return 0.0;
    try {
      const tarifa = await this.prisma.tarifa?.findFirst?.({
        where: { tipo: 'PRODUCTO', activo: true },
        orderBy: { vigenteDesde: 'desc' },
      });
      return tarifa ? Number(tarifa.valor) : 55.0;
    } catch {
      return 55.0;
    }
  }

  async crear(dto: CreatePrendaDto) {
    if (dto.grupoId) {
      const grupo = await this.prisma.grupo?.findUnique?.({ where: { id: dto.grupoId } });
      await this.validarListaAbiertaPorPedidoId(grupo?.pedidoId);

      // R-K05: Validación de color dentro de la paleta oficial en creación
      if (dto.colorId && grupo?.pedidoId) {
        const colorValido = await this.prisma.colorPedido?.findFirst?.({
          where: { id: dto.colorId, pedidoId: grupo.pedidoId },
        });
        if (!colorValido) {
          throw new BadRequestException('El color indicado no pertenece a la paleta autorizada de este pedido.');
        }
      }
    }

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
    const precioCalculado = await this.obtenerPrecioBase(prenda.tipoPrenda);
    return { ...prenda, precioCalculado };
  }

  async actualizarFichaMinima(id: string, dto: UpdateFichaMinimaDto, autor?: { id?: string; rol?: any }) {
    const prendaExiste = await this.prisma.prenda.findUnique({
      where: { id },
      include: { grupo: true, participante: true },
    });
    if (!prendaExiste) throw new NotFoundException('Prenda no encontrada.');

    // R-H03: Candado de lista cerrada
    await this.validarListaAbiertaPorPedidoId(prendaExiste.grupo?.pedidoId);

    // R-K05: Validación de color dentro de la paleta oficial
    if (dto.colorId && prendaExiste.grupo?.pedidoId) {
      const colorValido = await this.prisma.colorPedido?.findFirst?.({
        where: { id: dto.colorId, pedidoId: prendaExiste.grupo.pedidoId },
      });
      if (!colorValido) {
        throw new BadRequestException('El color indicado no pertenece a la paleta autorizada de este pedido.');
      }
    }

    // R-I01 / R-I04: Si el participante ya estaba CONFIRMADO, auditar los cambios en RegistroCambio
    if (prendaExiste.participante?.estado === 'CONFIRMADO' && prendaExiste.grupo?.pedidoId) {
      const camposAuditables: Array<keyof UpdateFichaMinimaDto> = ['tallaId', 'numero', 'genero', 'nombreEnPrenda', 'colorId'];
      for (const campo of camposAuditables) {
        const valorNuevo = dto[campo];
        const valorAnterior = (prendaExiste as any)[campo];
        if (valorNuevo !== undefined && valorNuevo !== valorAnterior) {
          await this.prisma.registroCambio?.create?.({
            data: {
              pedidoId: prendaExiste.grupo.pedidoId,
              entidad: 'Prenda',
              entidadId: prendaExiste.id,
              campo: String(campo),
              valorAnterior: valorAnterior !== null && valorAnterior !== undefined ? String(valorAnterior) : null,
              valorNuevo: String(valorNuevo),
              origen: 'USUARIO',
              autorUsuarioId: autor?.id ?? null,
              autorRol: autor?.rol ?? null,
            },
          });
        }
      }
    }

    const prenda = await this.prisma.prenda.update({
      where: { id },
      data: {
        tallaId: dto.tallaId,
        numero: dto.numero,
        genero: dto.genero as any,
        nombreEnPrenda: dto.nombreEnPrenda,
        colorId: dto.colorId,
      },
    });

    const precioCalculado = await this.obtenerPrecioBase(prenda.tipoPrenda);
    return { ...prenda, precioCalculado };
  }

  async eliminar(id: string) {
    const prendaExiste = await this.prisma.prenda.findUnique({
      where: { id },
      include: { grupo: true },
    });
    if (!prendaExiste) throw new NotFoundException('Prenda no encontrada.');

    // R-H03: Candado de lista cerrada
    await this.validarListaAbiertaPorPedidoId(prendaExiste.grupo?.pedidoId);

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

    const precioBaseVenta = await this.obtenerPrecioBase('VENTA');
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
        importeTotalEstimado += precioBaseVenta;
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
