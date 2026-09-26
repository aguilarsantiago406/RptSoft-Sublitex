import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AuditoriaService } from '../../5-auditoria/auditoria/auditoria.service';
import { NestingService } from './nesting.service';

describe('NestingService', () => {
  let service: NestingService;
  const registrarMock = jest.fn();
  const txCreateMock = jest.fn();
  const txMock = {
    nestingParte: { create: txCreateMock },
  };

  const prismaMock: any = {
    valorAtributo: { findUnique: jest.fn() },
    usuario: { findUnique: jest.fn() },
    nesting: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn() },
    nestingParte: { findFirst: jest.fn(), findMany: jest.fn() },
    archivoTif: { create: jest.fn() },
    pedido: { findUnique: jest.fn() },
    tarifa: { findFirst: jest.fn() },
    $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(txMock)),
  };

  const auditoriaMock: any = { registrar: registrarMock };

  beforeEach(async () => {
    registrarMock.mockReset();
    txCreateMock.mockReset();
    (prismaMock.valorAtributo.findUnique as jest.Mock).mockReset();
    (prismaMock.usuario.findUnique as jest.Mock).mockReset();
    (prismaMock.nesting.findUnique as jest.Mock).mockReset();
    (prismaMock.nesting.findMany as jest.Mock).mockReset();
    (prismaMock.nestingParte.findFirst as jest.Mock).mockReset();
    (prismaMock.nestingParte.findMany as jest.Mock).mockReset();
    (prismaMock.archivoTif.create as jest.Mock).mockReset();
    (prismaMock.pedido.findUnique as jest.Mock).mockReset();
    (prismaMock.tarifa.findFirst as jest.Mock).mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NestingService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditoriaService, useValue: auditoriaMock },
      ],
    }).compile();

    service = module.get(NestingService);
  });

  describe('crear', () => {
    it('crea un nesting validando tela y usuario', async () => {
      (prismaMock.valorAtributo.findUnique as jest.Mock).mockResolvedValue({
        id: 't1',
      });
      (prismaMock.usuario.findUnique as jest.Mock).mockResolvedValue({
        id: 'u1',
      });
      (prismaMock.nesting.create as jest.Mock).mockResolvedValue({ id: 'n1' });

      const result = await service.crear({
        codigo: 'NEST-1',
        telaId: 't1',
        creadoPorId: 'u1',
      });

      expect(result).toEqual({ id: 'n1' });
      expect(prismaMock.nesting.create).toHaveBeenCalledWith({
        data: { codigo: 'NEST-1', telaId: 't1', creadoPorId: 'u1' },
      });
    });

    it('rechaza si la tela no existe', async () => {
      (prismaMock.valorAtributo.findUnique as jest.Mock).mockResolvedValue(
        null,
      );
      await expect(
        service.crear({ codigo: 'NEST-1', telaId: 'x', creadoPorId: 'u1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('agregarParte', () => {
    it('asigna el número de parte siguiente y audita contra el pedido de la parte', async () => {
      (prismaMock.nesting.findUnique as jest.Mock).mockResolvedValue({
        id: 'n1',
        codigo: 'NEST-1',
      });
      (prismaMock.pedido.findUnique as jest.Mock).mockResolvedValue({
        id: 'p1',
        bloques: [
          { tipo: 'DISENO', estado: 'CERRADO' },
          { tipo: 'LISTA', estado: 'CERRADO' },
        ],
      });
      (prismaMock.nestingParte.findFirst as jest.Mock).mockResolvedValue({
        numeroParte: 2,
      });
      txCreateMock.mockResolvedValue({ id: 'parte1' });

      const result = await service.agregarParte('n1', {
        pedidoId: 'p1',
        anchoCm: 180,
        largoCm: 400,
        esRib: false,
      });

      expect(txCreateMock).toHaveBeenCalledWith({
        data: {
          nestingId: 'n1',
          pedidoId: 'p1',
          numeroParte: 3,
          anchoCm: 180,
          largoCm: 400,
          esRib: false,
        },
      });
      expect(registrarMock).toHaveBeenCalledWith(
        expect.objectContaining({
          pedidoId: 'p1',
          entidad: 'NestingParte',
          entidadId: 'parte1',
          campo: 'creacion',
          valorNuevo: 'NEST-1 #3 180×400cm',
        }),
        txMock,
      );
      expect(result).toEqual({ id: 'parte1' });
    });

    it('rechaza agregar parte si el pedido no tiene Diseño y Lista cerrados (R-H04)', async () => {
      (prismaMock.nesting.findUnique as jest.Mock).mockResolvedValue({
        id: 'n1',
        codigo: 'NEST-1',
      });
      (prismaMock.pedido.findUnique as jest.Mock).mockResolvedValue({
        id: 'p1',
        bloques: [
          { tipo: 'DISENO', estado: 'ABIERTO' },
          { tipo: 'LISTA', estado: 'CERRADO' },
        ],
      });

      await expect(
        service.agregarParte('n1', {
          pedidoId: 'p1',
          anchoCm: 100,
          largoCm: 100,
        }),
      ).rejects.toThrow(/Producción no puede iniciar/i);
    });

    it('lanza NotFound si el nesting no existe', async () => {
      (prismaMock.nesting.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        service.agregarParte('x', {
          pedidoId: 'p1',
          anchoCm: 100,
          largoCm: 100,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequest si el pedido no existe (R-K11 asigna la parte)', async () => {
      (prismaMock.nesting.findUnique as jest.Mock).mockResolvedValue({
        id: 'n1',
        codigo: 'NEST-1',
      });
      (prismaMock.pedido.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        service.agregarParte('n1', {
          pedidoId: 'x',
          anchoCm: 100,
          largoCm: 100,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('agregarArchivo (R-K13)', () => {
    it('crea archivo TIF con datos válidos', async () => {
      (prismaMock.nesting.findUnique as jest.Mock).mockResolvedValue({ id: 'n1' });
      (prismaMock.archivoTif.create as jest.Mock).mockResolvedValue({ id: 'a1' });

      const res = await service.agregarArchivo('n1', {
        nombre: 'SUBLITEX_PEDIDO_DRYFIT_180x400_1de2.tif',
        largoM: 4.0,
        ordenEnSerie: 1,
        totalSerie: 2,
      });

      expect(res).toEqual({ id: 'a1' });
    });

    it('rechaza archivo TIF con largo superior a 5 metros (R-K13)', async () => {
      (prismaMock.nesting.findUnique as jest.Mock).mockResolvedValue({ id: 'n1' });

      await expect(
        service.agregarArchivo('n1', {
          nombre: 'SUBLITEX_PEDIDO_DRYFIT_180x600_1de1.tif',
          largoM: 6.0,
          ordenEnSerie: 1,
          totalSerie: 1,
        }),
      ).rejects.toThrow(/El largo máximo por archivo TIF es de 5 metros/i);
    });

    it('rechaza si ordenEnSerie es mayor que totalSerie (R-K13)', async () => {
      (prismaMock.nesting.findUnique as jest.Mock).mockResolvedValue({ id: 'n1' });

      await expect(
        service.agregarArchivo('n1', {
          nombre: 'SUBLITEX_PEDIDO_DRYFIT_180x400_3de2.tif',
          largoM: 4.0,
          ordenEnSerie: 3,
          totalSerie: 2,
        }),
      ).rejects.toThrow(/El orden en serie no puede ser mayor/i);
    });
  });

  describe('consumoPorPedido (R-K15)', () => {
    it('suma SOLO las partes del pedido, separando tela y rib, y calcula costo R-K14', async () => {
      (prismaMock.pedido.findUnique as jest.Mock).mockResolvedValue({
        id: 'p1',
        codigo: 'SUB-1',
      });
      (prismaMock.nestingParte.findMany as jest.Mock).mockResolvedValue([
        {
          anchoCm: 180,
          largoCm: 1000,
          esRib: false,
          nesting: { telaId: 't1', tela: { etiqueta: 'DryFit' } },
        },
        {
          anchoCm: 160,
          largoCm: 200,
          esRib: true,
          nesting: { telaId: 't1', tela: { etiqueta: 'DryFit' } },
        },
      ]);
      (prismaMock.tarifa.findFirst as jest.Mock).mockResolvedValue({
        valor: { toNumber: () => 5.5 },
      });

      const result = await service.consumoPorPedido('p1');

      expect(result).toEqual(
        expect.objectContaining({
          partes: 2,
          metrosTela: 10,
          metrosRib: 2,
          metrosLineales: 12,
          anchoMaximoUsadoCm: 180,
          desperdicioLateralCm: 0,
          porcentajeAprovechamientoAncho: 100,
          precioPorMetro: 5.5,
          costoImpresion: 66,
        }),
      );
      expect(prismaMock.nestingParte.findMany).toHaveBeenCalledWith({
        where: { pedidoId: 'p1' },
        include: {
          nesting: {
            include: {
              tela: true,
            },
          },
        },
      });
    });

    it('devuelve costo null y nota si no hay tarifa vigente (R-K10, sin precios a mano)', async () => {
      (prismaMock.pedido.findUnique as jest.Mock).mockResolvedValue({
        id: 'p1',
        codigo: 'SUB-1',
      });
      (prismaMock.nestingParte.findMany as jest.Mock).mockResolvedValue([
        { anchoCm: 17, largoCm: 100, esRib: false },
      ]);
      (prismaMock.tarifa.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.consumoPorPedido('p1');

      expect(result.costoImpresion).toBeNull();
      expect(result.precioPorMetro).toBeNull();
      expect(result.nota).toContain('tarifa');
    });

    it('lanza BadRequest si el pedido no existe', async () => {
      (prismaMock.pedido.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.consumoPorPedido('x')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
