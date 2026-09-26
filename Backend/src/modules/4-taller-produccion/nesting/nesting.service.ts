import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AuditoriaService } from '../../5-auditoria/auditoria/auditoria.service';
import { CrearNestingDto } from './dto/crear-nesting.dto';
import { CrearNestingParteDto } from './dto/crear-nesting-parte.dto';
import { CrearArchivoTifDto } from './dto/crear-archivo-tif.dto';

@Injectable()
export class NestingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  // ==========================================================================
  // NESTING
  // ==========================================================================

  async crear(dto: CrearNestingDto, usuarioId?: string) {
    const creadorId = dto.creadoPorId || usuarioId;
    if (!creadorId) {
      throw new BadRequestException('El usuario creador es requerido.');
    }

    const tela = await this.prisma.valorAtributo.findUnique({
      where: { id: dto.telaId },
    });
    if (!tela) {
      throw new BadRequestException('La tela indicada no existe.');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: creadorId },
    });
    if (!usuario) {
      throw new BadRequestException('El usuario creador no existe.');
    }

    return this.prisma.nesting.create({
      data: {
        codigo: dto.codigo,
        telaId: dto.telaId,
        creadoPorId: creadorId,
      },
    });
  }

  async listar() {
    return this.prisma.nesting.findMany({
      orderBy: { fecha: 'desc' },
      include: {
        tela: { select: { id: true, etiqueta: true } },
        archivos: { select: { id: true, nombre: true } },
        _count: { select: { partes: true } },
      },
    });
  }

  async obtenerDetalle(id: string) {
    const nesting = await this.prisma.nesting.findUnique({
      where: { id },
      include: {
        tela: { select: { id: true, etiqueta: true } },
        partes: { orderBy: { numeroParte: 'asc' } },
        archivos: { orderBy: { ordenEnSerie: 'asc' } },
      },
    });
    if (!nesting) throw new NotFoundException('Nesting no encontrado.');
    return nesting;
  }

  // ==========================================================================
  // PARTES · R-K11, R-H04
  // ==========================================================================

  async agregarParte(
    nestingId: string,
    dto: CrearNestingParteDto,
    user?: { id?: string; rol?: any },
  ) {
    const nesting = await this.prisma.nesting.findUnique({
      where: { id: nestingId },
      select: { id: true, codigo: true },
    });
    if (!nesting) throw new NotFoundException('Nesting no encontrado.');

    const pedido = await this.prisma.pedido.findUnique({
      where: { id: dto.pedidoId },
      include: {
        bloques: true,
      },
    });
    if (!pedido) {
      throw new BadRequestException('El pedido indicado no existe.');
    }

    // Regla R-H04: Producción no puede iniciar sin Diseño y Lista cerrados
    const bloqueDiseno = pedido.bloques.find((b) => b.tipo === 'DISENO');
    const bloqueLista = pedido.bloques.find((b) => b.tipo === 'LISTA');

    const disenoCerrado = bloqueDiseno?.estado === 'CERRADO';
    const listaCerrada = bloqueLista?.estado === 'CERRADO';

    if (!disenoCerrado || !listaCerrada) {
      throw new BadRequestException(
        'Producción no puede iniciar: el pedido debe tener los bloques de Diseño y Lista cerrados (R-H04).',
      );
    }

    const ultima = await this.prisma.nestingParte.findFirst({
      where: { nestingId },
      orderBy: { numeroParte: 'desc' },
      select: { numeroParte: true },
    });
    const numeroParte = (ultima?.numeroParte ?? 0) + 1;

    // R-I01: la parte y su auditoría son atómicas. El registro se atribuye al
    // pedido de la parte porque RegistroCambio exige pedidoId (el nesting por
    // sí solo pertenece a varios pedidos, R-K11).
    return this.prisma.$transaction(async (tx) => {
      const parte = await tx.nestingParte.create({
        data: {
          nestingId,
          pedidoId: dto.pedidoId,
          numeroParte,
          anchoCm: dto.anchoCm,
          largoCm: dto.largoCm,
          esRib: dto.esRib ?? false,
        },
      });

      await this.auditoria.registrar(
        {
          pedidoId: dto.pedidoId,
          entidad: 'NestingParte',
          entidadId: parte.id,
          campo: 'creacion',
          valorNuevo: `${nesting.codigo} #${numeroParte} ${
            dto.esRib ? 'rib ' : ''
          }${dto.anchoCm}×${dto.largoCm}cm`,
          origen: 'USUARIO',
          autorUsuarioId: user?.id,
          autorRol: user?.rol,
        },
        tx,
      );

      return parte;
    });
  }

  // ==========================================================================
  // ARCHIVOS TIF · R-K13
  // ==========================================================================

  async agregarArchivo(nestingId: string, dto: CrearArchivoTifDto) {
    const nesting = await this.prisma.nesting.findUnique({
      where: { id: nestingId },
      select: { id: true },
    });
    if (!nesting) throw new NotFoundException('Nesting no encontrado.');

    // R-K13: Largo máximo de 5 metros por archivo TIF
    if (dto.largoM > 5.0) {
      throw new BadRequestException(
        'El largo máximo por archivo TIF es de 5 metros (R-K13).',
      );
    }

    // R-K13: ordenEnSerie no puede exceder totalSerie
    if (dto.ordenEnSerie > dto.totalSerie) {
      throw new BadRequestException(
        'El orden en serie no puede ser mayor que el total de la serie (R-K13).',
      );
    }

    return this.prisma.archivoTif.create({
      data: {
        nestingId,
        nombre: dto.nombre,
        largoM: dto.largoM,
        ordenEnSerie: dto.ordenEnSerie,
        totalSerie: dto.totalSerie,
        entregadoEn: dto.entregadoEn ? new Date(dto.entregadoEn) : null,
      },
    });
  }

  // ==========================================================================
  // CONSUMO DE TELA · R-K12, R-K14, R-K15
  // ==========================================================================

  async consumoPorPedido(pedidoId: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: { id: true, codigo: true },
    });
    if (!pedido) {
      throw new BadRequestException('El pedido indicado no existe.');
    }

    // R-K15 · El consumo es la suma de LAS PARTES del pedido, nunca el total
    // del nesting: un nesting puede mezclar varios pedidos en la misma tela.
    const partes = await this.prisma.nestingParte.findMany({
      where: { pedidoId },
      include: {
        nesting: {
          include: {
            tela: true,
          },
        },
      },
    });

    const telaCm = partes
      .filter((p) => !p.esRib)
      .reduce((suma, p) => suma + p.largoCm, 0);
    const ribCm = partes
      .filter((p) => p.esRib)
      .reduce((suma, p) => suma + p.largoCm, 0);

    const metrosTela = this.redondear(telaCm / 100);
    const metrosRib = this.redondear(ribCm / 100);
    const metrosLineales = this.redondear(metrosTela + metrosRib);

    // R-K12 · Ancho fijo 1.80 m, desperdicio lateral y porcentaje de aprovechamiento
    const anchoMaximoUsadoCm = partes.length
      ? Math.max(...partes.map((p) => p.anchoCm))
      : null;
    const desperdicioLateralCm =
      anchoMaximoUsadoCm !== null
        ? Math.max(0, 180 - anchoMaximoUsadoCm)
        : null;
    const porcentajeAprovechamientoAncho =
      anchoMaximoUsadoCm !== null
        ? this.redondear((anchoMaximoUsadoCm / 180) * 100)
        : null;

    // R-K15 · Desglose de consumo por tipo de tela (excluyendo rib)
    const desgloseMap = new Map<
      string,
      { telaId: string; telaNombre: string; metros: number }
    >();
    for (const p of partes) {
      if (p.esRib) continue;
      const telaId = p.nesting?.telaId ?? 'general';
      const telaNombre = p.nesting?.tela?.etiqueta ?? 'Sin especificar';
      const current = desgloseMap.get(telaId) ?? {
        telaId,
        telaNombre,
        metros: 0,
      };
      current.metros += p.largoCm / 100;
      desgloseMap.set(telaId, current);
    }
    const desglosePorTela = Array.from(desgloseMap.values()).map((d) => ({
      telaId: d.telaId,
      telaNombre: d.telaNombre,
      metrosLineales: this.redondear(d.metros),
    }));

    // R-K14 / R-K10 · Costo = metros lineales × tarifa vigente.
    // Tarifa vigente: vigenteDesde <= ahora AND (vigenteHasta IS NULL OR vigenteHasta >= ahora).
    const ahora = new Date();
    const tarifaImpresion = await this.prisma.tarifa.findFirst({
      where: {
        tipo: 'COSTO_INTERNO',
        activo: true,
        vigenteDesde: { lte: ahora },
        OR: [{ vigenteHasta: null }, { vigenteHasta: { gte: ahora } }],
        concepto: { contains: 'impresi', mode: 'insensitive' },
      },
      orderBy: { vigenteDesde: 'desc' },
      select: { valor: true },
    });

    const precioPorMetro =
      tarifaImpresion === null ? null : tarifaImpresion.valor.toNumber();

    return {
      pedidoId,
      pedidoCodigo: pedido.codigo,
      partes: partes.length,
      metrosTela,
      metrosRib,
      metrosLineales,
      anchoMaximoUsadoCm,
      desperdicioLateralCm,
      porcentajeAprovechamientoAncho,
      desglosePorTela,
      precioPorMetro,
      costoImpresion:
        precioPorMetro === null
          ? null
          : this.redondear(metrosLineales * precioPorMetro),
      nota:
        precioPorMetro === null
          ? 'Sin tarifa vigente de impresión (tipo COSTO_INTERNO). R-K10: el precio no se escribe a mano.'
          : undefined,
    };
  }

  private redondear(valor: number): number {
    return Number(valor.toFixed(2));
  }
}
