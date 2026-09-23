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

  async crear(dto: CrearNestingDto) {
    const tela = await this.prisma.valorAtributo.findUnique({
      where: { id: dto.telaId },
    });
    if (!tela) {
      throw new BadRequestException('La tela indicada no existe.');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: dto.creadoPorId },
    });
    if (!usuario) {
      throw new BadRequestException('El usuario creador no existe.');
    }

    return this.prisma.nesting.create({
      data: {
        codigo: dto.codigo,
        telaId: dto.telaId,
        creadoPorId: dto.creadoPorId,
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
  // PARTES · R-K11
  // ==========================================================================

  async agregarParte(nestingId: string, dto: CrearNestingParteDto) {
    const nesting = await this.prisma.nesting.findUnique({
      where: { id: nestingId },
      select: { id: true, codigo: true },
    });
    if (!nesting) throw new NotFoundException('Nesting no encontrado.');

    const pedido = await this.prisma.pedido.findUnique({
      where: { id: dto.pedidoId },
      select: { id: true },
    });
    if (!pedido) {
      throw new BadRequestException('El pedido indicado no existe.');
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
  // CONSUMO DE TELA · R-K14, R-K15
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
      select: { anchoCm: true, largoCm: true, esRib: true },
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

    // R-K14 · Costo = metros lineales × tarifa vigente. R-K10: nunca se escribe
    // un precio a mano; si no hay tarifa vigente se devuelve null y no se cobra.
    const tarifaImpresion = await this.prisma.tarifa.findFirst({
      where: {
        tipo: 'COSTO_INTERNO',
        activo: true,
        vigenteHasta: null,
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
      anchoMaximoUsadoCm: partes.length
        ? Math.max(...partes.map((p) => p.anchoCm))
        : null,
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
