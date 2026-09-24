import { Test, TestingModule } from '@nestjs/testing';
import { BloqueService } from './bloque.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { TipoBloque, EstadoBloque, PoliticaNumeracion } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('BloqueService - Gobernanza de Bloques (R-H01, R-H11, R-H12, R-H13, R-H14)', () => {
  let service: BloqueService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      pedido: {
        findUnique: jest.fn(),
      },
      bloquePedido: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      versionBloque: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      nestingParte: {
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloqueService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<BloqueService>(BloqueService);
  });

  describe('getBloques (BK1-01 / R-H01)', () => {
    it('lanza NotFoundException si el pedido no existe', async () => {
      prisma.pedido.findUnique.mockResolvedValue(null);
      await expect(service.getBloques('pedido_inexistente')).rejects.toThrow(NotFoundException);
    });

    it('inicializa y retorna los 3 bloques en estado ABIERTO', async () => {
      prisma.pedido.findUnique.mockResolvedValue({ id: 'ped_1' });
      prisma.bloquePedido.upsert.mockResolvedValue({});
      prisma.bloquePedido.findMany.mockResolvedValue([
        { id: 'b1', tipo: TipoBloque.DISENO, estado: EstadoBloque.ABIERTO },
        { id: 'b2', tipo: TipoBloque.LISTA, estado: EstadoBloque.ABIERTO },
        { id: 'b3', tipo: TipoBloque.COMERCIAL, estado: EstadoBloque.ABIERTO },
      ]);

      const bloques = await service.getBloques('ped_1');
      expect(bloques).toHaveLength(3);
      expect(prisma.bloquePedido.upsert).toHaveBeenCalledTimes(3);
    });
  });

  describe('cerrarBloque (BK2-01 / R-H01, R-H03, R-H11)', () => {
    it('lanza NotFoundException si el pedido no existe', async () => {
      prisma.pedido.findUnique.mockResolvedValue(null);
      await expect(service.cerrarBloque('ped_99', TipoBloque.LISTA, 'usr_1')).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si el bloque ya esta cerrado', async () => {
      prisma.pedido.findUnique.mockResolvedValue({ id: 'ped_1', grupos: [] });
      prisma.bloquePedido.findUnique.mockResolvedValue({ id: 'b_lista', estado: EstadoBloque.CERRADO });
      await expect(service.cerrarBloque('ped_1', TipoBloque.LISTA, 'usr_1')).rejects.toThrow(BadRequestException);
    });

    it('rechaza cerrar Lista si no hay grupos registrados', async () => {
      prisma.pedido.findUnique.mockResolvedValue({ id: 'ped_1', grupos: [] });
      prisma.bloquePedido.findUnique.mockResolvedValue({ id: 'b_lista', estado: EstadoBloque.ABIERTO });
      await expect(service.cerrarBloque('ped_1', TipoBloque.LISTA, 'usr_1')).rejects.toThrow('sin grupos');
    });

    it('rechaza cerrar Lista si la cantidad de prendas no coincide con la contratada (R-B02)', async () => {
      prisma.pedido.findUnique.mockResolvedValue({
        id: 'ped_1',
        grupos: [
          {
            nombre: 'Titulares',
            cantidadContratada: 10,
            prendas: [{ id: 'p1' }, { id: 'p2' }],
          },
        ],
      });
      prisma.bloquePedido.findUnique.mockResolvedValue({ id: 'b_lista', estado: EstadoBloque.ABIERTO });

      await expect(service.cerrarBloque('ped_1', TipoBloque.LISTA, 'usr_1')).rejects.toThrow('R-B02');
    });

    it('rechaza cerrar Lista si alguna prenda no tiene talla, numero o nombre (R-E03)', async () => {
      prisma.pedido.findUnique.mockResolvedValue({
        id: 'ped_1',
        grupos: [
          {
            nombre: 'Titulares',
            cantidadContratada: 1,
            prendas: [{ id: 'p1', tallaId: null, numero: '10', nombreEnPrenda: 'JUAN' }],
          },
        ],
      });
      prisma.bloquePedido.findUnique.mockResolvedValue({ id: 'b_lista', estado: EstadoBloque.ABIERTO });

      await expect(service.cerrarBloque('ped_1', TipoBloque.LISTA, 'usr_1')).rejects.toThrow('R-E03');
    });

    it('rechaza cerrar Lista si politica UNICA tiene numeros repetidos (R-G03)', async () => {
      prisma.pedido.findUnique.mockResolvedValue({
        id: 'ped_1',
        grupos: [
          {
            nombre: 'Titulares',
            politicaNumeracion: PoliticaNumeracion.UNICA,
            cantidadContratada: 2,
            prendas: [
              { id: 'p1', tallaId: 't_m', numero: '10', nombreEnPrenda: 'JUAN' },
              { id: 'p2', tallaId: 't_l', numero: '10', nombreEnPrenda: 'PEDRO' },
            ],
          },
        ],
      });
      prisma.bloquePedido.findUnique.mockResolvedValue({ id: 'b_lista', estado: EstadoBloque.ABIERTO });

      await expect(service.cerrarBloque('ped_1', TipoBloque.LISTA, 'usr_1')).rejects.toThrow('R-G03');
    });

    it('cierra el bloque y congela VersionBloque numero 1 al cumplir todo (R-H11)', async () => {
      prisma.pedido.findUnique.mockResolvedValue({
        id: 'ped_1',
        grupos: [
          {
            nombre: 'Titulares',
            politicaNumeracion: PoliticaNumeracion.LIBRE,
            cantidadContratada: 1,
            prendas: [
              { id: 'p1', tallaId: 't_m', numero: '10', nombreEnPrenda: 'JUAN' },
            ],
          },
        ],
      });
      prisma.bloquePedido.findUnique.mockResolvedValue({ id: 'b_lista', estado: EstadoBloque.ABIERTO });
      prisma.versionBloque.findFirst.mockResolvedValue(null);
      prisma.versionBloque.create.mockResolvedValue({ id: 'v1', numero: 1 });
      prisma.bloquePedido.update.mockResolvedValue({ id: 'b_lista', estado: EstadoBloque.CERRADO });

      const res = await service.cerrarBloque('ped_1', TipoBloque.LISTA, 'usr_1');
      expect(res.version).toBe(1);
      expect(prisma.versionBloque.create).toHaveBeenCalled();
      expect(prisma.bloquePedido.update).toHaveBeenCalled();
    });
  });

  describe('reabrirBloque (BK1-02 / R-H12, R-H13, R-H14)', () => {
    it('lanza NotFoundException si el pedido no existe', async () => {
      prisma.pedido.findUnique.mockResolvedValue(null);
      await expect(
        service.reabrirBloque('ped_99', TipoBloque.LISTA, { motivoReapertura: 'Cambio de numero' }, 'usr_1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si el bloque no esta cerrado', async () => {
      prisma.pedido.findUnique.mockResolvedValue({ id: 'ped_1', grupos: [] });
      prisma.bloquePedido.findUnique.mockResolvedValue({ id: 'b_lista', estado: EstadoBloque.ABIERTO });

      await expect(
        service.reabrirBloque('ped_1', TipoBloque.LISTA, { motivoReapertura: 'Cambio de numero' }, 'usr_1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('reabre el bloque, crea nueva version inmutable y activa alerta si hay partes en taller (R-H14)', async () => {
      prisma.pedido.findUnique.mockResolvedValue({
        id: 'ped_1',
        grupos: [],
        disenos: [],
      });
      prisma.bloquePedido.findUnique.mockResolvedValue({ id: 'b_lista', estado: EstadoBloque.CERRADO });
      prisma.versionBloque.findFirst.mockResolvedValue({ id: 'v1', numero: 1 });
      prisma.nestingParte.count.mockResolvedValue(2);
      prisma.versionBloque.create.mockResolvedValue({ id: 'v2', numero: 2 });
      prisma.bloquePedido.update.mockResolvedValue({ id: 'b_lista', estado: EstadoBloque.ABIERTO });

      const res = await service.reabrirBloque(
        'ped_1',
        TipoBloque.LISTA,
        { motivoReapertura: 'Agregar 2 prendas adicionales' },
        'usr_1',
      );

      expect(res.alertaTaller).toBe(true);
      expect(res.version.numero).toBe(2);
      expect(prisma.bloquePedido.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ estado: EstadoBloque.ABIERTO }),
        }),
      );
    });

    it('reabre el bloque sin alerta si no hay partes en taller', async () => {
      prisma.pedido.findUnique.mockResolvedValue({
        id: 'ped_1',
        grupos: [],
        disenos: [],
      });
      prisma.bloquePedido.findUnique.mockResolvedValue({ id: 'b_lista', estado: EstadoBloque.CERRADO });
      prisma.versionBloque.findFirst.mockResolvedValue({ id: 'v1', numero: 1 });
      prisma.nestingParte.count.mockResolvedValue(0);
      prisma.versionBloque.create.mockResolvedValue({ id: 'v2', numero: 2 });
      prisma.bloquePedido.update.mockResolvedValue({ id: 'b_lista', estado: EstadoBloque.ABIERTO });

      const res = await service.reabrirBloque(
        'ped_1',
        TipoBloque.LISTA,
        { motivoReapertura: 'Correccion de apodo' },
        'usr_1',
      );

      expect(res.alertaTaller).toBe(false);
    });
  });
});
