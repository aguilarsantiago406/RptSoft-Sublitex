import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { TipoTarifa } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';
import { CreateDatosEnvioDto } from './dto/create-datos-envio.dto';
import { UpdateDatosEnvioDto } from './dto/update-datos-envio.dto';

@Injectable()
export class ComercialService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.tarifa.create({
      data: {
        tipo: dto.tipo,
        concepto: dto.concepto,
        valor: dto.valor,
        vigenteDesde,
        vigenteHasta,
        nota: dto.nota,
      },
    });
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
}
