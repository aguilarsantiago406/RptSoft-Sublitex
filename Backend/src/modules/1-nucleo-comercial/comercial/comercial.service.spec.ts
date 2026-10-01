import { Test } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ComercialService } from './comercial.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PdfService } from '../../../core/pdf/pdf.service';

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
    confirmacion: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    diseno: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    pago: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    usuario: {
      findFirst: jest.fn(),
    },
  };
}

function buildPdfMock() {
  return {
    generarConfirmacionPdf: jest.fn().mockResolvedValue('/storage/confirmaciones/PED-001-v1.pdf'),
  };
}

async function crearServicio(prisma: any, pdf?: any): Promise<ComercialService> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      ComercialService,
      { provide: PrismaService, useValue: prisma },
      { provide: PdfService, useValue: pdf ?? buildPdfMock() },
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
    prisma.pedido.findUnique.mockResolvedValue({ id: 'ped_1' });
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

describe('R-H05 / R-K06 / R-K07 - emitirConfirmacion', () => {
  it('emite confirmacion calculando totalSinIgv, adelanto 50% y saldo', async () => {
    const prisma = buildPrismaMock();
    prisma.pedido.findUnique.mockResolvedValue({
      id: 'ped_1',
      codigo: 'SUB-000001',
      creadoPorId: 'usr_creador',
      cliente: { nombre: 'Colegio San Agustin' },
      grupos: [
        {
          id: 'g_1',
          nombre: 'Grupo A',
          cantidadContratada: 10,
          tipoProducto: { id: 'tp_1', nombre: 'Conjunto' },
          prendas: [{ id: 'p_1' }, { id: 'p_2' }],
        },
      ],
    });
    prisma.tarifa.findFirst.mockResolvedValue({
      valor: 100,
    });
    prisma.confirmacion.findFirst.mockResolvedValue(null);
    prisma.confirmacion.create.mockImplementation(async ({ data }: any) => ({
      id: 'conf_1',
      ...data,
    }));

    const service = await crearServicio(prisma);
    const result = await service.emitirConfirmacion('ped_1', { adelantoRecibido: 100 });

    expect(result.version).toBe(1);
    expect(result.totalSinIgv).toBe(200);
    expect(result.adelantoSugerido).toBe(100);
    expect(result.adelantoRecibido).toBe(100);
    expect(result.saldo).toBe(100);
  });

  it('emite confirmacion sumando recargos de tallas, telas, cuellos y adicionales (R-H07 / R-H08)', async () => {
    const prisma = buildPrismaMock();
    prisma.pedido.findUnique.mockResolvedValue({
      id: 'ped_1',
      codigo: 'SUB-000001',
      creadoPorId: 'usr_creador',
      cliente: { nombre: 'Club Atletico' },
      grupos: [
        {
          id: 'g_1',
          nombre: 'Grupo B',
          cantidadContratada: 1,
          tipoProducto: { id: 'tp_1', nombre: 'Conjunto' },
          prendas: [{ id: 'p_1' }],
        },
      ],
    });
    prisma.tarifa.findFirst.mockResolvedValue({ valor: 100 });
    prisma.confirmacion.findFirst.mockResolvedValue({ version: 1 });
    prisma.confirmacion.create.mockImplementation(async ({ data }: any) => ({
      id: 'conf_2',
      ...data,
    }));

    const service = await crearServicio(prisma);
    const result = await service.emitirConfirmacion('ped_1', {
      recargoTallas: 20,
      recargoTelas: 15,
      recargoCuellos: 10,
      recargoAcabados: 5,
      adicionales: 50,
      adelantoRecibido: 100,
    });

    expect(result.version).toBe(2);
    expect(result.totalSinIgv).toBe(200);
    expect(result.recargoTallas).toBe(20);
    expect(result.recargoTelas).toBe(15);
    expect(result.recargoCuellos).toBe(10);
    expect(result.recargoAcabados).toBe(5);
    expect(result.adicionales).toBe(50);
    expect(result.adelantoSugerido).toBe(100);
    expect(result.saldo).toBe(100);
  });

  it('lanza NotFoundException al emitir confirmacion si el pedido no existe', async () => {
    const prisma = buildPrismaMock();
    prisma.pedido.findUnique.mockResolvedValue(null);
    const service = await crearServicio(prisma);

    await expect(
      service.emitirConfirmacion('ped_inexistente', {}),
    ).rejects.toThrow(NotFoundException);
  });

  it('genera el pdfUrl automaticamente sin recibirlo del cliente (R-K06)', async () => {
    const prisma = buildPrismaMock();
    prisma.pedido.findUnique.mockResolvedValue({
      id: 'ped_1',
      codigo: 'SUB-000099',
      creadoPorId: 'usr_creador',
      cliente: { nombre: 'Promo 2025' },
      grupos: [
        {
          id: 'g_1',
          nombre: 'Conjunto Azul',
          cantidadContratada: 5,
          tipoProducto: { id: 'tp_1', nombre: 'Kit' },
          prendas: [],
        },
      ],
    });
    prisma.tarifa.findFirst.mockResolvedValue({ valor: 80 });
    prisma.confirmacion.findFirst.mockResolvedValue(null);
    prisma.confirmacion.create.mockImplementation(async ({ data }: any) => ({ id: 'conf_pdf', ...data }));

    const pdfMock = buildPdfMock();
    const service = await crearServicio(prisma, pdfMock);
    const result = await service.emitirConfirmacion('ped_1', {});

    expect(pdfMock.generarConfirmacionPdf).toHaveBeenCalledTimes(1);
    expect(pdfMock.generarConfirmacionPdf).toHaveBeenCalledWith(
      expect.objectContaining({ codigo: 'SUB-000099', version: 1, clienteNombre: 'Promo 2025' }),
    );
    expect(result.pdfUrl).toBe('/storage/confirmaciones/PED-001-v1.pdf');
  });

  describe('Gestión de Pagos Parciales (PAGOS)', () => {
    it('registra un pago y calcula totalPagado y saldoPendiente dinámicamente', async () => {
      const prisma = buildPrismaMock();
      prisma.pedido.findUnique.mockResolvedValue({
        id: 'ped_1',
        grupos: [
          {
            id: 'g_1',
            cantidadContratada: 10,
            tipoProducto: { nombre: 'Kit' },
            prendas: [],
          },
        ],
      });
      prisma.tarifa.findFirst.mockResolvedValue({ valor: 100 });
      prisma.confirmacion.findFirst.mockResolvedValue({
        id: 'conf_1',
        totalSinIgv: 1000,
        adelantoRecibido: 0,
        saldo: 1000,
      });
      prisma.confirmacion.update = jest.fn().mockResolvedValue({});

      const pagoCreado = {
        id: 'pago_1',
        pedidoId: 'ped_1',
        monto: 400,
        medio: 'YAPE',
        numeroOperacion: 'OP-1234',
        comprobanteUrl: 'https://storage/voucher.png',
        fechaPago: new Date(),
      };
      prisma.pago.create.mockResolvedValue(pagoCreado);
      prisma.pago.findMany.mockResolvedValue([pagoCreado]);

      const service = await crearServicio(prisma);
      const res = await service.createPago(
        'ped_1',
        {
          monto: 400,
          medio: 'YAPE' as any,
          numeroOperacion: 'OP-1234',
          comprobanteUrl: 'https://storage/voucher.png',
        },
        'usr_vendedora',
      );

      expect(res.pago.id).toBe('pago_1');
      expect(res.totalPedido).toBe(1000);
      expect(res.totalPagado).toBe(400);
      expect(res.saldoPendiente).toBe(600);
      expect(prisma.confirmacion.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'conf_1' },
          data: { adelantoRecibido: 400, saldo: 600 },
        }),
      );
    });

    it('findPagos devuelve historial y saldo dinámico en tiempo real', async () => {
      const prisma = buildPrismaMock();
      prisma.pedido.findUnique.mockResolvedValue({
        id: 'ped_1',
        grupos: [],
      });
      prisma.confirmacion.findFirst.mockResolvedValue({
        id: 'conf_1',
        totalSinIgv: 800,
      });
      prisma.pago.findMany.mockResolvedValue([
        { id: 'p1', monto: 300, medio: 'TRANSFERENCIA', fechaPago: new Date() },
        { id: 'p2', monto: 200, medio: 'EFECTIVO', fechaPago: new Date() },
      ]);

      const service = await crearServicio(prisma);
      const res = await service.findPagos('ped_1');

      expect(res.pagos.length).toBe(2);
      expect(res.totalPedido).toBe(800);
      expect(res.totalPagado).toBe(500);
      expect(res.saldoPendiente).toBe(300);
    });

    it('removePago elimina el abono y recalcula el saldo restante', async () => {
      const prisma = buildPrismaMock();
      prisma.pago.findFirst.mockResolvedValue({
        id: 'p1',
        pedidoId: 'ped_1',
        monto: 200,
      });
      prisma.pago.delete.mockResolvedValue({ id: 'p1' });
      prisma.pago.findMany.mockResolvedValue([]);
      prisma.confirmacion.findFirst.mockResolvedValue({
        id: 'conf_1',
        totalSinIgv: 500,
      });
      prisma.confirmacion.update = jest.fn().mockResolvedValue({});

      const service = await crearServicio(prisma);
      const res = await service.removePago('ped_1', 'p1');

      expect(res.id).toBe('p1');
      expect(res.totalPagado).toBe(0);
      expect(res.saldoPendiente).toBe(500);
      expect(prisma.pago.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
    });
  });
});
