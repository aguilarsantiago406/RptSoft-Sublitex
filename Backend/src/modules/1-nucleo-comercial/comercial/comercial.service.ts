import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { TipoTarifa } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PdfService } from '../../../core/pdf/pdf.service';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';
import { CreateDatosEnvioDto } from './dto/create-datos-envio.dto';
import { UpdateDatosEnvioDto } from './dto/update-datos-envio.dto';
import { EmitirConfirmacionDto } from './dto/emitir-confirmacion.dto';
import { CreatePagoDto } from './dto/create-pago.dto';

@Injectable()
export class ComercialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  async createTarifa(dto: CreateTarifaDto) {
    const vigenteDesde = new Date(dto.vigenteDesde);
    const vigenteHasta = dto.vigenteHasta ? new Date(dto.vigenteHasta) : null;

    if (vigenteHasta !== null && vigenteHasta <= vigenteDesde) {
      throw new BadRequestException('vigenteHasta debe ser posterior a vigenteDesde');
    }

    const existing = await this.prisma.tarifa.findFirst({
      where: {
        tipo: dto.tipo,
        concepto: dto.concepto,
        vigenteDesde,
      },
    });

    if (existing) {
      throw new ConflictException('Ya existe una tarifa con ese tipo, concepto y fecha de vigencia');
    }

    try {
      return await this.prisma.tarifa.create({
        data: {
          tipo: dto.tipo,
          concepto: dto.concepto,
          valor: dto.valor,
          vigenteDesde,
          vigenteHasta,
          nota: dto.nota,
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Ya existe una tarifa con ese tipo, concepto y fecha de vigencia');
      }
      throw error;
    }
  }

  async findAllTarifas(tipo?: string) {
    return this.prisma.tarifa.findMany({
      where: {
        ...(tipo ? { tipo: tipo as TipoTarifa } : {}),
      },
      orderBy: [{ tipo: 'asc' }, { concepto: 'asc' }, { vigenteDesde: 'desc' }],
    });
  }

  async findTarifaById(id: string) {
    const tarifa = await this.prisma.tarifa.findUnique({ where: { id } });
    if (!tarifa) {
      throw new NotFoundException('Tarifa no encontrada: ' + id);
    }
    return tarifa;
  }

  async updateTarifa(id: string, dto: UpdateTarifaDto) {
    await this.findTarifaById(id);

    const vigenteDesde = dto.vigenteDesde ? new Date(dto.vigenteDesde) : undefined;
    const vigenteHasta = dto.vigenteHasta ? new Date(dto.vigenteHasta) : undefined;

    if (vigenteDesde && vigenteHasta && vigenteHasta <= vigenteDesde) {
      throw new BadRequestException('vigenteHasta debe ser posterior a vigenteDesde');
    }

    return this.prisma.tarifa.update({
      where: { id },
      data: {
        ...(dto.tipo !== undefined ? { tipo: dto.tipo } : {}),
        ...(dto.concepto !== undefined ? { concepto: dto.concepto } : {}),
        ...(dto.valor !== undefined ? { valor: dto.valor } : {}),
        ...(vigenteDesde !== undefined ? { vigenteDesde } : {}),
        ...(vigenteHasta !== undefined ? { vigenteHasta } : {}),
        ...(dto.nota !== undefined ? { nota: dto.nota } : {}),
      },
    });
  }

  async removeTarifa(id: string) {
    await this.findTarifaById(id);
    return this.prisma.tarifa.delete({ where: { id } });
  }

  async getTarifasVigentes(tipo?: string) {
    const ahora = new Date();
    return this.prisma.tarifa.findMany({
      where: {
        activo: true,
        vigenteDesde: { lte: ahora },
        OR: [
          { vigenteHasta: null },
          { vigenteHasta: { gte: ahora } },
        ],
        ...(tipo ? { tipo: tipo as TipoTarifa } : {}),
      },
      orderBy: [{ tipo: 'asc' }, { concepto: 'asc' }],
    });
  }

  async createDatosEnvio(pedidoId: string, dto: CreateDatosEnvioDto) {
    const pedido = await this.prisma.pedido.findUnique({ where: { id: pedidoId } });
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado: ' + pedidoId);
    }

    const existing = await this.prisma.datosEnvio.findUnique({ where: { pedidoId } });
    if (existing) {
      throw new ConflictException('El pedido ya tiene datos de envio registrados');
    }

    return this.prisma.datosEnvio.create({
      data: { pedidoId, ...dto },
    });
  }

  async findDatosEnvio(pedidoId: string) {
    const datos = await this.prisma.datosEnvio.findUnique({ where: { pedidoId } });
    if (!datos) {
      throw new NotFoundException('Datos de envio no encontrados para el pedido: ' + pedidoId);
    }
    return datos;
  }

  async updateDatosEnvio(pedidoId: string, dto: UpdateDatosEnvioDto) {
    await this.findDatosEnvio(pedidoId);
    return this.prisma.datosEnvio.update({
      where: { pedidoId },
      data: dto,
    });
  }

  async removeDatosEnvio(pedidoId: string) {
    await this.findDatosEnvio(pedidoId);
    return this.prisma.datosEnvio.delete({ where: { pedidoId } });
  }
  async getTarifaVigentePorConcepto(tipo: string, concepto: string): Promise<number> {
    const ahora = new Date();
    const tarifa = await this.prisma.tarifa.findFirst({
      where: {
        tipo: tipo as any,
        concepto,
        activo: true,
        vigenteDesde: { lte: ahora },
        OR: [{ vigenteHasta: null }, { vigenteHasta: { gte: ahora } }],
      },
      orderBy: { vigenteDesde: 'desc' },
    });
    return Number(tarifa?.valor ?? 0);
  }

  async emitirConfirmacion(pedidoId: string, dto: EmitirConfirmacionDto, emitidaPorId?: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        cliente: true,
        grupos: {
          include: {
            tipoProducto: true,
            prendas: {
              where: { tipoPrenda: 'VENTA' },
            },
          },
        },
      },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado: ' + pedidoId);
    }

    let autorId = emitidaPorId;
    if (!autorId) {
      const systemUser = await this.prisma.usuario.findFirst({
        where: { email: 'sistema@sublitex.com' },
      });
      autorId = systemUser?.id || pedido.creadoPorId;
    }

    const ultima = await this.prisma.confirmacion.findFirst({
      where: { pedidoId },
      orderBy: { version: 'desc' },
    });
    const siguienteVersion = (ultima?.version ?? 0) + 1;

    const recargoTallas = dto.recargoTallas ?? 0;
    const recargoTelas = dto.recargoTelas ?? 0;
    const recargoCuellos = dto.recargoCuellos ?? 0;
    const recargoAcabados = dto.recargoAcabados ?? 0;
    const adicionales = dto.adicionales ?? 0;

    let baseProductos = 0;
    const gruposDetalle: { nombre: string; tipoProducto: string; cantidadContratada: number; prendasVenta: number }[] = [];
    for (const grupo of pedido.grupos) {
      const tarifaProducto = await this.getTarifaVigentePorConcepto('PRODUCTO', grupo.tipoProducto.nombre);
      const prendasVenta = grupo.prendas.length > 0 ? grupo.prendas.length : grupo.cantidadContratada;
      baseProductos += prendasVenta * tarifaProducto;
      gruposDetalle.push({
        nombre: grupo.nombre,
        tipoProducto: grupo.tipoProducto.nombre,
        cantidadContratada: grupo.cantidadContratada,
        prendasVenta,
      });
    }

    const totalSinIgv = Math.round((baseProductos + recargoTallas + recargoTelas + recargoCuellos + recargoAcabados + adicionales) * 100) / 100;
    const adelantoSugerido = Math.round((totalSinIgv * 0.5) * 100) / 100;
    const adelantoRecibido = dto.adelantoRecibido ?? 0;
    const saldo = Math.max(0, Math.round((totalSinIgv - adelantoRecibido) * 100) / 100);
    const igvCalculado = (dto.comprobante === 'FACTURA' || (dto.comprobante as any) === 'FACTURA')
      ? Math.round(totalSinIgv * 0.18 * 100) / 100
      : null;

    const pdfUrl = await this.pdfService.generarConfirmacionPdf({
      codigo: pedido.codigo,
      version: siguienteVersion,
      clienteNombre: pedido.cliente.nombre,
      fechaEmision: new Date(),
      grupos: gruposDetalle,
      totalSinIgv,
      recargoTallas,
      recargoTelas,
      recargoCuellos,
      recargoAcabados,
      adicionales,
      adelantoSugerido,
      adelantoRecibido,
      saldo,
      igvCalculado,
      comprobante: dto.comprobante ?? 'NINGUNO',
    });

    return this.prisma.confirmacion.create({
      data: {
        pedidoId,
        version: siguienteVersion,
        totalSinIgv,
        recargoTallas,
        recargoTelas,
        recargoCuellos,
        recargoAcabados,
        adicionales,
        adelantoSugerido,
        adelantoRecibido,
        saldo,
        comprobante: dto.comprobante ?? 'NINGUNO',
        igvCalculado,
        pdfUrl,
        emitidaPorId: autorId,
      },
    });
  }

  async findConfirmaciones(pedidoId: string) {
    const pedido = await this.prisma.pedido.findUnique({ where: { id: pedidoId } });
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado: ' + pedidoId);
    }
    return this.prisma.confirmacion.findMany({
      where: { pedidoId },
      orderBy: { version: 'desc' },
      include: { emitidaPor: true },
    });
  }

  async createPago(pedidoId: string, dto: CreatePagoDto, registradoPorId?: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        grupos: {
          include: {
            tipoProducto: true,
            prendas: { where: { tipoPrenda: 'VENTA' } },
          },
        },
      },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado: ' + pedidoId);
    }

    const fechaPago = dto.fechaPago ? new Date(dto.fechaPago) : new Date();

    const pago = await this.prisma.pago.create({
      data: {
        pedidoId,
        monto: dto.monto,
        medio: dto.medio,
        numeroOperacion: dto.numeroOperacion,
        comprobanteUrl: dto.comprobanteUrl,
        fechaPago,
        notas: dto.notas,
        ...(registradoPorId ? { registradoPorId } : {}),
      },
      include: {
        registradoPor: {
          select: { id: true, nombre: true, email: true, rol: true },
        },
      },
    });

    const todosPagos = await this.prisma.pago.findMany({ where: { pedidoId } });
    const totalPagado = Math.round(todosPagos.reduce((acc, p) => acc + Number(p.monto), 0) * 100) / 100;

    const ultimaConfirmacion = await this.prisma.confirmacion.findFirst({
      where: { pedidoId },
      orderBy: { version: 'desc' },
    });

    let totalPedido = 0;
    if (ultimaConfirmacion) {
      totalPedido = Number(ultimaConfirmacion.totalSinIgv);
      const nuevoSaldo = Math.max(0, Math.round((totalPedido - totalPagado) * 100) / 100);
      await this.prisma.confirmacion.update({
        where: { id: ultimaConfirmacion.id },
        data: {
          adelantoRecibido: totalPagado,
          saldo: nuevoSaldo,
        },
      });
    }

    const saldoPendiente = Math.max(0, Math.round((totalPedido - totalPagado) * 100) / 100);

    return {
      pago,
      totalPedido,
      totalPagado,
      saldoPendiente,
    };
  }

  async findPagos(pedidoId: string) {
    const pedido = await this.prisma.pedido.findUnique({ where: { id: pedidoId } });
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado: ' + pedidoId);
    }

    const pagos = await this.prisma.pago.findMany({
      where: { pedidoId },
      orderBy: [{ fechaPago: 'desc' }, { creadoEn: 'desc' }],
      include: {
        registradoPor: {
          select: { id: true, nombre: true, email: true, rol: true },
        },
      },
    });

    const totalPagado = Math.round(pagos.reduce((acc, p) => acc + Number(p.monto), 0) * 100) / 100;

    const ultimaConfirmacion = await this.prisma.confirmacion.findFirst({
      where: { pedidoId },
      orderBy: { version: 'desc' },
    });

    const totalPedido = ultimaConfirmacion ? Number(ultimaConfirmacion.totalSinIgv) : 0;
    const saldoPendiente = Math.max(0, Math.round((totalPedido - totalPagado) * 100) / 100);

    return {
      pagos,
      totalPedido,
      totalPagado,
      saldoPendiente,
    };
  }

  async removePago(pedidoId: string, pagoId: string) {
    const pago = await this.prisma.pago.findFirst({
      where: { id: pagoId, pedidoId },
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado o no pertenece al pedido');
    }

    await this.prisma.pago.delete({ where: { id: pagoId } });

    const todosPagos = await this.prisma.pago.findMany({ where: { pedidoId } });
    const totalPagado = Math.round(todosPagos.reduce((acc, p) => acc + Number(p.monto), 0) * 100) / 100;

    const ultimaConfirmacion = await this.prisma.confirmacion.findFirst({
      where: { pedidoId },
      orderBy: { version: 'desc' },
    });

    let totalPedido = 0;
    if (ultimaConfirmacion) {
      totalPedido = Number(ultimaConfirmacion.totalSinIgv);
      const nuevoSaldo = Math.max(0, Math.round((totalPedido - totalPagado) * 100) / 100);
      await this.prisma.confirmacion.update({
        where: { id: ultimaConfirmacion.id },
        data: {
          adelantoRecibido: totalPagado,
          saldo: nuevoSaldo,
        },
      });
    }

    const saldoPendiente = Math.max(0, Math.round((totalPedido - totalPagado) * 100) / 100);

    return {
      id: pagoId,
      totalPedido,
      totalPagado,
      saldoPendiente,
    };
  }
}

