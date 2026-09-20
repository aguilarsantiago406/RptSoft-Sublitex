import { Test } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ComercialService } from './comercial.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

function buildPrismaMock() {
  return {
    tarifa: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    datosEnvio: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    pedido: {
      findUnique: jest.fn(),
    },
  };
}

async function crearServicio(prisma: any): Promise<ComercialService> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      ComercialService,
      { provide: PrismaService, useValue: prisma },
    ],
  }).compile();
  return moduleRef.get(ComercialService);
}

const tarifaBase = {
  id: 'tar_1',
  tipo: 'PRODUCTO',
  concepto: 'Kit completo',
  valor: 150,
  vigenteDesde: new Date('2026-01-01T00:00:00Z'),
  vigenteHasta: null,
  activo: true,
  nota: null,
};

const dtoTarifa = {
  tipo: 'PRODUCTO' as any,
  concepto: 'Kit completo',
  valor: 150,
  vigenteDesde: '2026-01-01T00:00:00Z',
};

const envioBase = {
  id: 'env_1',
  pedidoId: 'ped_1',
  nombreCompleto: 'Juan Perez',
  dni: '12345678',
  celular: '+51999888777',
  ciudad: 'Lima',
  agencia: 'Olva Courier',
};

const dtoEnvio = {
  nombreCompleto: 'Juan Perez',
  dni: '12345678',
  celular: '+51999888777',
  ciudad: 'Lima',
  agencia: 'Olva Courier',
};

describe('R-K10 - createTarifa', () => {
  it('crea una tarifa correctamente', async () => {
    const prisma = buildPrismaMock();
    prisma.tarifa.findFirst.mockResolvedValue(null);
    prisma.tarifa.create.mockResolvedValue(tarifaBase);
    const service = await crearServicio(prisma);

    const result = await service.createTarifa(dtoTarifa);

    expect(result).toEqual(tarifaBase);
    expect(prisma.tarifa.create).toHaveBeenCalledTimes(1);
  });

  it('lanza ConflictException si ya existe tarifa con mismo tipo, concepto y fecha', async () => {
    const prisma = buildPrismaMock();
    prisma.tarifa.findFirst.mockResolvedValue(tarifaBase);
    const service = await crearServicio(prisma);

    await expect(service.createTarifa(dtoTarifa)).rejects.toThrow(ConflictException);
  });
});

describe('R-K10 - getTarifasVigentes', () => {
  it('filtra tarifas activas dentro del rango de fechas', async () => {
    const prisma = buildPrismaMock();
    prisma.tarifa.findMany.mockResolvedValue([tarifaBase]);
    const service = await crearServicio(prisma);

    const result = await service.getTarifasVigentes();

    const where = prisma.tarifa.findMany.mock.calls[0][0].where;
    expect(where.activo).toBe(true);
    expect(where.vigenteDesde).toBeDefined();
    expect(where.OR).toBeDefined();
    expect(result).toHaveLength(1);
  });

  it('aplica filtro de tipo cuando se indica', async () => {
    const prisma = buildPrismaMock();
    prisma.tarifa.findMany.mockResolvedValue([]);
    const service = await crearServicio(prisma);

    await service.getTarifasVigentes('PRODUCTO');

    const where = prisma.tarifa.findMany.mock.calls[0][0].where;
    expect(where.tipo).toBe('PRODUCTO');
  });
});

describe('R-K10 - findTarifaById', () => {
  it('lanza NotFoundException si la tarifa no existe', async () => {
    const prisma = buildPrismaMock();
    prisma.tarifa.findUnique.mockResolvedValue(null);
    const service = await crearServicio(prisma);

    await expect(service.findTarifaById('id-inexistente')).rejects.toThrow(NotFoundException);
  });
});

describe('R-K08 - createDatosEnvio', () => {
  it('crea datos de envio correctamente', async () => {
    const prisma = buildPrismaMock();
    prisma.datosEnvio.findUnique.mockResolvedValue(null);
    prisma.pedido.findUnique.mockResolvedValue({ id: 'ped_1' });
    prisma.datosEnvio.create.mockResolvedValue(envioBase);
    const service = await crearServicio(prisma);

    const result = await service.createDatosEnvio('ped_1', dtoEnvio);

    expect(result).toEqual(envioBase);
  });

  it('lanza ConflictException si el pedido ya tiene datos de envio', async () => {
    const prisma = buildPrismaMock();
    prisma.datosEnvio.findUnique.mockResolvedValue(envioBase);
    const service = await crearServicio(prisma);

    await expect(service.createDatosEnvio('ped_1', dtoEnvio)).rejects.toThrow(ConflictException);
  });

  it('lanza NotFoundException si el pedido no existe', async () => {
    const prisma = buildPrismaMock();
    prisma.datosEnvio.findUnique.mockResolvedValue(null);
    prisma.pedido.findUnique.mockResolvedValue(null);
    const service = await crearServicio(prisma);

    await expect(service.createDatosEnvio('ped-inexistente', dtoEnvio)).rejects.toThrow(NotFoundException);
  });
});

describe('R-K08 - findDatosEnvio', () => {
  it('lanza NotFoundException si el pedido no tiene datos de envio', async () => {
    const prisma = buildPrismaMock();
    prisma.datosEnvio.findUnique.mockResolvedValue(null);
    const service = await crearServicio(prisma);

    await expect(service.findDatosEnvio('ped-sin-envio')).rejects.toThrow(NotFoundException);
  });
});
