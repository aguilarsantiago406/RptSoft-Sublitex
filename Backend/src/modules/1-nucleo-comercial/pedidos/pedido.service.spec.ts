import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { EstadoPedido } from './estado-pedido.enum';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { AddColorDto } from './dto/add-color.dto';

const pedidoBORRADOR = {
  id: 'ped_1',
  codigo: 'SUB-0001',
  estado: EstadoPedido.BORRADOR,
  fechaPedido: new Date('2026-09-01T10:00:00Z'),
  fechaCompromiso: new Date('2026-12-01T10:00:00Z'),
};

function buildPrismaMock() {
  return {
    pedido: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    usuario: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    cliente: {
      findUnique: jest.fn(),
    },
    colorPedido: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  };
}

async function crearServicio(prisma: any): Promise<PedidoService> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      PedidoService,
      { provide: PrismaService, useValue: prisma },
    ],
  }).compile();
  return moduleRef.get(PedidoService);
}

describe('R-A03 · Código legible y único generado por el sistema', () => {
  it('genera SUB-XXXX con el siguiente correlativo', async () => {
    const prisma = buildPrismaMock();
    prisma.pedido.findMany.mockResolvedValue([
      { codigo: 'SUB-0003' },
      { codigo: 'SUB-0001' },
    ]);
    prisma.usuario.findFirst.mockResolvedValue({ id: 'u1' });
    prisma.cliente.findUnique.mockResolvedValue({ id: 'c1' });
    prisma.pedido.create.mockImplementation(async ({ data }: any) => ({
      id: 'ped_nuevo',
      ...data,
    }));

    const service = await crearServicio(prisma);
    const dto: CreatePedidoDto = {
      clienteId: 'c1',
      fechaCompromiso: '2026-12-25T00:00:00Z',
    };
    const creado = await service.create(dto);

    expect(creado.codigo).toBe('SUB-0004');
    const llamado = prisma.pedido.create.mock.calls[0][0].data;
    expect(llamado.codigo).toBe('SUB-0004');
    expect(llamado.estado).toBe(EstadoPedido.BORRADOR);
  });
});

describe('R-A09 · La fecha de compromiso es obligatoria y posterior al pedido', () => {
  it('rechaza crear pedido con fecha de compromiso en el pasado', async () => {
    const prisma = buildPrismaMock();
    const service = await crearServicio(prisma);
    const dto: CreatePedidoDto = {
      clienteId: 'c1',
      fechaCompromiso: '2020-01-01T00:00:00Z',
    };
    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('rechaza salir de BORRADOR sin fecha de compromiso', async () => {
    const prisma = buildPrismaMock();
    prisma.pedido.findUnique.mockResolvedValue({
      ...pedidoBORRADOR,
      fechaCompromiso: null,
    });
    const service = await crearServicio(prisma);
    const dto: UpdateEstadoDto = { estado: EstadoPedido.EN_CONFIGURACION };
    await expect(service.updateEstado('ped_1', dto)).rejects.toThrow(BadRequestException);
  });

  it('rechaza salir de BORRADOR con fecha compromiso anterior a fechaPedido', async () => {
    const prisma = buildPrismaMock();
    prisma.pedido.findUnique.mockResolvedValue({
      ...pedidoBORRADOR,
      fechaCompromiso: new Date('2026-08-01T10:00:00Z'),
    });
    const service = await crearServicio(prisma);
    const dto: UpdateEstadoDto = { estado: EstadoPedido.EN_CONFIGURACION };
    await expect(service.updateEstado('ped_1', dto)).rejects.toThrow(BadRequestException);
  });
});

describe('R-A06 · Transiciones de estado aplicadas en el servicio', () => {
  it('acepta la transición BORRADOR → EN_CONFIGURACION', async () => {
    const prisma = buildPrismaMock();
    prisma.pedido.findUnique.mockResolvedValue(pedidoBORRADOR);
    prisma.pedido.update.mockImplementation(async ({ data }: any) => ({
      ...pedidoBORRADOR,
      ...data,
    }));
    const service = await crearServicio(prisma);
    const dto: UpdateEstadoDto = { estado: EstadoPedido.EN_CONFIGURACION };
    const resultado = await service.updateEstado('ped_1', dto);
    expect(resultado.estado).toBe(EstadoPedido.EN_CONFIGURACION);
  });

  it('rechaza saltar de BORRADOR a EN_RECOLECCION', async () => {
    const prisma = buildPrismaMock();
    prisma.pedido.findUnique.mockResolvedValue(pedidoBORRADOR);
    const service = await crearServicio(prisma);
    const dto: UpdateEstadoDto = { estado: EstadoPedido.EN_RECOLECCION };
    await expect(service.updateEstado('ped_1', dto)).rejects.toThrow(BadRequestException);
  });

  it('rechaza mover un pedido CANCELADO (terminal)', async () => {
    const prisma = buildPrismaMock();
    prisma.pedido.findUnique.mockResolvedValue({
      ...pedidoBORRADOR,
      estado: EstadoPedido.CANCELADO,
    });
    const service = await crearServicio(prisma);
    const dto: UpdateEstadoDto = { estado: EstadoPedido.BORRADOR };
    await expect(service.updateEstado('ped_1', dto)).rejects.toThrow(BadRequestException);
  });

  it('registra canceladoEn al cancelar', async () => {
    const prisma = buildPrismaMock();
    prisma.pedido.findUnique.mockResolvedValue(pedidoBORRADOR);
    prisma.pedido.update.mockImplementation(async ({ data }: any) => ({
      ...pedidoBORRADOR,
      ...data,
    }));
    const service = await crearServicio(prisma);
    const dto: UpdateEstadoDto = { estado: EstadoPedido.CANCELADO };
    await service.updateEstado('ped_1', dto);
    const llamado = prisma.pedido.update.mock.calls[0][0].data;
    expect(llamado.estado).toBe(EstadoPedido.CANCELADO);
    expect(llamado.canceladoEn).toBeInstanceOf(Date);
  });
});

describe('R-K05 · Colores con código HEX obligatorio', () => {
  it('rechaza duplicar el nombre de un color en el pedido', async () => {
    const prisma = buildPrismaMock();
    prisma.pedido.findUnique.mockResolvedValue(pedidoBORRADOR);
    prisma.colorPedido.create.mockRejectedValue({ code: 'P2002' });
    const service = await crearServicio(prisma);
    const dto: AddColorDto = { nombre: 'Blanco', codigoHex: '#F7F4F2' };
    await expect(service.addColor('ped_1', dto)).rejects.toThrow(BadRequestException);
  });

  it('responde 404 al eliminar un color inexistente', async () => {
    const prisma = buildPrismaMock();
    prisma.pedido.findUnique.mockResolvedValue(pedidoBORRADOR);
    prisma.colorPedido.delete.mockRejectedValue({ code: 'P2025' });
    const service = await crearServicio(prisma);
    await expect(service.deleteColor('ped_1', 'col_x')).rejects.toThrow(NotFoundException);
  });
});