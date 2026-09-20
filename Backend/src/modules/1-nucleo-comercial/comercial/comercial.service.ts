import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';
import { CreateDatosEnvioDto } from './dto/create-datos-envio.dto';
import { UpdateDatosEnvioDto } from './dto/update-datos-envio.dto';

@Injectable()
export class ComercialService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== TARIFAS ====================

  async createTarifa(dto: CreateTarifaDto) {
    const existing = await this.prisma.tarifa.findFirst({
      where: {
        tipo: dto.tipo,
        concepto: dto.concepto,
        vigenteDesde: new Date(dto.vigenteDesde),
      },
    });

    if (existing) {
      throw new ConflictException('Ya existe una tarifa con ese tipo, concepto y fecha de vigencia');
    }

    return this.prisma.tarifa.create({
      data: {
        ...dto,
        vigenteDesde: new Date(dto.vigenteDesde),
        vigenteHasta: dto.vigenteHasta ? new Date(dto.vigenteHasta) : null,
        valor: dto.valor,
      },
    });
  }

  async findAllTarifas(tipo?: string, activo?: boolean) {
    return this.prisma.tarifa.findMany({
      where: {
        ...(tipo ? { tipo: tipo as any } : {}),
        ...(activo !== undefined ? { activo } : {}),
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

    const data: any = { ...dto };
    if (dto.vigenteDesde) data.vigenteDesde = new Date(dto.vigenteDesde);
    if (dto.vigenteHasta) data.vigenteHasta = new Date(dto.vigenteHasta);

    return this.prisma.tarifa.update({
      where: { id },
      data,
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
        ...(tipo ? { tipo: tipo as any } : {}),
      },
      orderBy: [{ tipo: 'asc' }, { concepto: 'asc' }],
    });
  }

  // ==================== DATOS DE ENVÍO ====================

  async createDatosEnvio(pedidoId: string, dto: CreateDatosEnvioDto) {
    const existing = await this.prisma.datosEnvio.findUnique({ where: { pedidoId } });
    if (existing) {
      throw new ConflictException('El pedido ya tiene datos de envío registrados');
    }

    const pedido = await this.prisma.pedido.findUnique({ where: { id: pedidoId } });
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado: ' + pedidoId);
    }

    return this.prisma.datosEnvio.create({
      data: {
        pedidoId,
        ...dto,
      },
    });
  }

  async findDatosEnvio(pedidoId: string) {
    const datos = await this.prisma.datosEnvio.findUnique({ where: { pedidoId } });
    if (!datos) {
      throw new NotFoundException('Datos de envío no encontrados para el pedido: ' + pedidoId);
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
}