import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreatePrendaDto } from './dto/create-prenda.dto';
import { UpdateFichaMinimaDto } from './dto/update-ficha-minima.dto';

@Injectable()
export class PrendasService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================================================
  // R-K10 · CÁLCULO DE PRECIO
  // ==========================================================================

  /**
   * Calcula el precio de una prenda sumando:
   * - Precio base del producto (Tarifa tipo PRODUCTO)
   * - Recargo por talla
   * - Recargo por tela, cuello y acabado
   *
   * Si es OBSEQUIO o MUESTRA, el precio es 0 (R-K02).
   */
  async calcularPrecio(prendaId: string): Promise<number> {
    const prenda = await this.prisma.prenda.findUnique({
      where: { id: prendaId },
      include: {
        tipoProducto: true,
        talla: true,
        excepciones: {
          include: { atributo: true, valor: true },
        },
        grupo: {
          include: {
            configuracion: {
              include: { atributo: true, valor: true },
            },
          },
        },
      },
    });

    if (!prenda) throw new NotFoundException('Prenda no encontrada.');

    // R-K02 · Obsequio y muestra no se cobran
    if (prenda.tipoPrenda !== 'VENTA') return 0;

    let precioTotal = 0;
    const ahora = new Date();

    // Precio base del producto
    const tarifaProducto = await this.prisma.tarifa.findFirst({
      where: {
        tipo: 'PRODUCTO',
        concepto: prenda.tipoProducto.codigo,
        activo: true,
        vigenteDesde: { lte: ahora },
        OR: [{ vigenteHasta: null }, { vigenteHasta: { gte: ahora } }],
      },
      orderBy: { vigenteDesde: 'desc' },
    });
    precioTotal += Number(tarifaProducto?.valor ?? 0);

    // Recargo por talla
    if (prenda.talla) {
      const tarifaTalla = await this.prisma.tarifa.findFirst({
        where: {
          tipo: 'RECARGO_TALLA',
          concepto: prenda.talla.codigo,
          activo: true,
        },
        orderBy: { vigenteDesde: 'desc' },
      });
      precioTotal += Number(tarifaTalla?.valor ?? 0);
    }

    // Recargos por atributos (tela, cuello, acabado)
    const atributosConRecargo = ['TELA', 'CUELLO', 'ACABADO'];
    const tipoTarifaMap: Record<string, any> = {
      TELA: 'RECARGO_TELA',
      CUELLO: 'RECARGO_CUELLO',
      ACABADO: 'RECARGO_ACABADO',
    };

    for (const codigoAtributo of atributosConRecargo) {
      const excepcion = prenda.excepciones.find(
        (e) => e.atributo.codigo === codigoAtributo,
      );
      let valorAtributo = excepcion?.valor;

      if (!valorAtributo) {
        const config = prenda.grupo.configuracion.find(
          (c) => c.atributo.codigo === codigoAtributo,
        );
        valorAtributo = config?.valor;
      }

      if (valorAtributo) {
        const tarifa = await this.prisma.tarifa.findFirst({
          where: {
            tipo: tipoTarifaMap[codigoAtributo],
            concepto: valorAtributo.etiqueta,
            activo: true,
          },
          orderBy: { vigenteDesde: 'desc' },
        });
        precioTotal += Number(tarifa?.valor ?? 0);
      }
    }

    return Number(precioTotal.toFixed(2));
  }

  // ==========================================================================
  // CREAR PRENDA
  // ==========================================================================

  async crear(dto: CreatePrendaDto) {
    // 🔥 Validación: participante pertenece al grupo
    const participante = await this.prisma.participante.findFirst({
      where: {
        id: dto.participanteId,
        grupoId: dto.grupoId,
      },
    });
    if (!participante) {
      throw new BadRequestException(
        'El participante no pertenece al grupo indicado.',
      );
    }

    // 🔥 Validación: talla pertenece al tipo de producto
    if (dto.tallaId) {
      const talla = await this.prisma.tallaCatalogo.findFirst({
        where: {
          id: dto.tallaId,
          tipoProductoId: dto.tipoProductoId,
        },
      });
      if (!talla) {
        throw new BadRequestException(
          'La talla no pertenece al tipo de producto.',
        );
      }
    }

    // 🔥 R-G03: Validar política UNICA
    if (dto.numero) {
      const grupo = await this.prisma.grupo.findUnique({
        where: { id: dto.grupoId },
      });
      if (grupo?.politicaNumeracion === 'UNICA') {
        const duplicado = await this.prisma.prenda.findFirst({
          where: {
            grupoId: dto.grupoId,
            numero: dto.numero,
          },
        });
        if (duplicado) {
          throw new ConflictException(
            `El número "${dto.numero}" ya está asignado (política ÚNICA).`,
          );
        }
      }
    }

    // Crear prenda
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

    // 🔥 R-I01: Auditoría
    await this.registrarCambio({
      grupoId: dto.grupoId,
      entidad: 'Prenda',
      entidadId: prenda.id,
      campo: 'creacion',
      valorNuevo: prenda.id,
      origen: 'USUARIO',
    });

    const precioCalculado = await this.calcularPrecio(prenda.id);
    return { ...prenda, precioCalculado };
  }

  // ==========================================================================
  // ACTUALIZAR FICHA MÍNIMA
  // ==========================================================================

  async actualizarFichaMinima(id: string, dto: UpdateFichaMinimaDto) {
    const prendaExiste = await this.prisma.prenda.findUnique({
      where: { id },
      include: {
        grupo: true,
        participante: true,
      },
    });
    if (!prendaExiste) throw new NotFoundException('Prenda no encontrada.');

    // 🔥 R-D03: No permitir editar si el participante está CONFIRMADO
    if (prendaExiste.participante.estado === 'CONFIRMADO') {
      throw new ConflictException(
        'No se puede modificar una prenda cuyo participante ya confirmó.',
      );
    }

    // 🔥 R-G03: Validar política UNICA si cambia el número
    if (dto.numero && dto.numero !== prendaExiste.numero) {
      if (prendaExiste.grupo.politicaNumeracion === 'UNICA') {
        const duplicado = await this.prisma.prenda.findFirst({
          where: {
            grupoId: prendaExiste.grupoId,
            numero: dto.numero,
            id: { not: id },
          },
        });
        if (duplicado) {
          throw new ConflictException(
            `El número "${dto.numero}" ya está asignado (política ÚNICA).`,
          );
        }
      }
    }

    // 🔥 Validación: talla pertenece al tipo de producto
    if (dto.tallaId && dto.tallaId !== prendaExiste.tallaId) {
      const talla = await this.prisma.tallaCatalogo.findFirst({
        where: {
          id: dto.tallaId,
          tipoProductoId: prendaExiste.tipoProductoId,
        },
      });
      if (!talla) {
        throw new BadRequestException(
          'La talla no pertenece al tipo de producto.',
        );
      }
    }

    // Actualizar
    const prenda = await this.prisma.prenda.update({
      where: { id },
      data: {
        tallaId: dto.tallaId,
        numero: dto.numero,
        genero: dto.genero as any,
        nombreEnPrenda: dto.nombreEnPrenda,
      },
    });

    // 🔥 R-I01: Auditoría por cada campo cambiado
    const cambios = [
      { campo: 'tallaId', anterior: prendaExiste.tallaId, nuevo: dto.tallaId },
      { campo: 'numero', anterior: prendaExiste.numero, nuevo: dto.numero },
      { campo: 'genero', anterior: prendaExiste.genero, nuevo: dto.genero },
      {
        campo: 'nombreEnPrenda',
        anterior: prendaExiste.nombreEnPrenda,
        nuevo: dto.nombreEnPrenda,
      },
    ];

    for (const cambio of cambios) {
      if (cambio.nuevo && cambio.anterior !== cambio.nuevo) {
        await this.registrarCambio({
          grupoId: prendaExiste.grupoId,
          entidad: 'Prenda',
          entidadId: id,
          campo: cambio.campo,
          valorAnterior: cambio.anterior,
          valorNuevo: String(cambio.nuevo),
          origen: 'USUARIO',
        });
      }
    }

    const precioCalculado = await this.calcularPrecio(prenda.id);
    return { ...prenda, precioCalculado };
  }

  // ==========================================================================
  // ELIMINAR PRENDA
  // ==========================================================================

  async eliminar(id: string) {
    const prendaExiste = await this.prisma.prenda.findUnique({
      where: { id },
      include: { participante: true },
    });
    if (!prendaExiste) throw new NotFoundException('Prenda no encontrada.');

    // 🔥 R-D03: No permitir eliminar si está CONFIRMADO
    if (prendaExiste.participante.estado === 'CONFIRMADO') {
      throw new ConflictException(
        'No se puede eliminar una prenda cuyo participante ya confirmó.',
      );
    }

    // 🔥 R-I01: Auditoría antes de eliminar
    await this.registrarCambio({
      grupoId: prendaExiste.grupoId,
      entidad: 'Prenda',
      entidadId: id,
      campo: 'eliminacion',
      valorAnterior: id,
      origen: 'USUARIO',
    });

    await this.prisma.prenda.delete({ where: { id } });
    return {};
  }

  // ==========================================================================
  // R-K03 · RESUMEN DE PRODUCCIÓN
  // ==========================================================================

  /**
   * Multiplica cada prenda por los componentes de su tipo de producto.
   * La prenda es la unidad contable, no el participante (R-E07).
   */
  async obtenerResumenProduccion(pedidoId: string) {
    const prendas = await this.prisma.prenda.findMany({
      where: {
        grupo: { pedidoId },
      },
      include: {
        tipoProducto: true,
        talla: true,
        color: true,
      },
    });

    const resumen = {
      pedidoId,
      totalPrendas: prendas.length,
      piezasFisicas: {
        camisetas: 0,
        shorts: 0,
        medias: 0,
      },
      porTalla: {} as Record<string, number>,
      porProducto: {} as Record<string, number>,
      porTipo: { VENTA: 0, OBSEQUIO: 0, MUESTRA: 0 },
      porGenero: {} as Record<string, number>,
      porColor: {} as Record<string, number>,
      importeTotalEstimado: 0,
    };

    for (const p of prendas) {
      // R-K03 · Multiplicar piezas físicas
      resumen.piezasFisicas.camisetas += p.tipoProducto.camisetas;
      resumen.piezasFisicas.shorts += p.tipoProducto.shorts;
      resumen.piezasFisicas.medias += p.tipoProducto.medias;

      // Por talla
      const talla = p.talla?.codigo ?? 'SIN_TALLA';
      resumen.porTalla[talla] = (resumen.porTalla[talla] ?? 0) + 1;

      // Por producto
      const prod = p.tipoProducto.codigo;
      resumen.porProducto[prod] = (resumen.porProducto[prod] ?? 0) + 1;

      // Por tipo (R-K02)
      resumen.porTipo[p.tipoPrenda]++;

      // Por género (R-K01)
      resumen.porGenero[p.genero] = (resumen.porGenero[p.genero] ?? 0) + 1;

      // Por color (R-K05)
      const color = p.color?.nombre ?? 'SIN_COLOR';
      resumen.porColor[color] = (resumen.porColor[color] ?? 0) + 1;

      // Importe (R-K10)
      if (p.tipoPrenda === 'VENTA') {
        resumen.importeTotalEstimado += await this.calcularPrecio(p.id);
      }
    }

    // Redondear importe
    resumen.importeTotalEstimado = Number(
      resumen.importeTotalEstimado.toFixed(2),
    );

    return resumen;
  }

  // ==========================================================================
  // R-I01..R-I05 · AUDITORÍA
  // ==========================================================================

  private async registrarCambio(data: {
    grupoId: string;
    entidad: string;
    entidadId: string;
    campo: string;
    valorAnterior?: string | null;
    valorNuevo?: string | null;
    origen: 'USUARIO' | 'PARTICIPANTE' | 'SISTEMA' | 'GHL';
  }) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id: data.grupoId },
      select: { pedidoId: true },
    });
    if (!grupo) return;

    await this.prisma.registroCambio.create({
      data: {
        pedidoId: grupo.pedidoId,
        entidad: data.entidad,
        entidadId: data.entidadId,
        campo: data.campo,
        valorAnterior: data.valorAnterior,
        valorNuevo: data.valorNuevo,
        origen: data.origen,
      },
    });
  }
}
