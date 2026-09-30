import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClienteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClienteDto) {
    return this.prisma.cliente.create({
      data: {
        nombre: dto.nombre,
        tipo: dto.tipo,
        telefono: dto.telefono,
        ciudad: dto.ciudad,
      },
    });
  }

  async findAll(q?: string) {
    return this.prisma.cliente.findMany({
      where: q
        ? {
            OR: [
              { nombre: { contains: q, mode: 'insensitive' } },
              { ciudad: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        pedidos: {
          select: {
            id: true,
            codigo: true,
            estado: true,
            fechaPedido: true,
            fechaCompromiso: true,
          },
          orderBy: { fechaPedido: 'desc' },
        },
      },
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado: ' + id);
    return cliente;
  }

  async update(id: string, dto: UpdateClienteDto) {
    await this.findOne(id);
    return this.prisma.cliente.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        tipo: dto.tipo,
        telefono: dto.telefono,
        ciudad: dto.ciudad,
      },
    });
  }

  async remove(id: string) {
    const cliente = await this.findOne(id);
    if (cliente.pedidos && cliente.pedidos.length > 0) {
      throw new ConflictException(
        `No se puede eliminar el cliente porque tiene ${cliente.pedidos.length} pedido(s) asociado(s).`
      );
    }
    await this.prisma.cliente.delete({ where: { id } });
    return { ok: true, message: 'Cliente eliminado correctamente' };
  }
}
