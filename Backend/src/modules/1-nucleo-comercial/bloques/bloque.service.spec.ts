import { Test, TestingModule } from '@nestjs/testing';
import { BloqueService } from './bloque.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { TipoBloque, EstadoBloque, PoliticaNumeracion, RolUsuario } from '@prisma/client';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { AuditoriaService } from '../../5-auditoria/auditoria/auditoria.service';
import { AreaAcuse } from './dto/acusar-recibo.dto';

describe('BloqueService - Gobernanza de Bloques (R-H01, R-H11, R-H12, R-H13, R-H14)', () => {
  let service: BloqueService;
  let prisma: any;
  let auditoria: any;

  beforeEach(async () => {
    auditoria = {
      registrar: jest.fn().mockResolvedValue(undefined),
    };

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
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      nestingParte: {
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloqueService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditoriaService, useValue: auditoria },
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

    it('rechaza cerrar Diseno si no tiene un diseno aprobado (R-H02)', async () => {
      prisma.pedido.findUnique.mockResolvedValue({
        id: 'ped_1',
        grupos: [],
        disenos: [{ id: 'd1', estado: 'BORRADOR' }],
      });
      prisma.bloquePedido.findUnique.mockResolvedValue({ id: 'b_diseno', estado: EstadoBloque.ABIERTO });

      await expect(service.cerrarBloque('ped_1', TipoBloque.DISENO, 'usr_1')).rejects.toThrow('R-H02');
    });

    it('cierra Diseno exitosamente si cuenta con diseno aprobado (R-H02)', async () => {
      prisma.pedido.findUnique.mockResolvedValue({
        id: 'ped_1',
        grupos: [],
        disenos: [{ id: 'd1', estado: 'APROBADO', archivoUrl: 'https://cdn/art.ai' }],
      });
      prisma.bloquePedido.findUnique.mockResolvedValue({ id: 'b_diseno', estado: EstadoBloque.ABIERTO });
      prisma.versionBloque.findFirst.mockResolvedValue(null);
      prisma.versionBloque.create.mockResolvedValue({ id: 'v1', numero: 1 });
      prisma.bloquePedido.update.mockResolvedValue({ id: 'b_diseno', estado: EstadoBloque.CERRADO });

      const res = await service.cerrarBloque('ped_1', TipoBloque.DISENO, 'usr_1');
      expect(res.version).toBe(1);
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

  describe('acusarReciboVersion (R-H14)', () => {
    it('lanza NotFoundException si el pedido no existe', async () => {
      prisma.pedido.findUnique.mockResolvedValue(null);
      await expect(
        service.acusarReciboVersion('ped_inexistente', 'v_1', { id: 'usr_taller', rol: RolUsuario.PRODUCCION }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza NotFoundException si la version no existe', async () => {
      prisma.pedido.findUnique.mockResolvedValue({ id: 'ped_1' });
      prisma.versionBloque.findUnique.mockResolvedValue(null);

      await expect(
        service.acusarReciboVersion('ped_1', 'v_inexistente', { id: 'usr_taller', rol: RolUsuario.PRODUCCION }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si la version pertenece a otro pedido', async () => {
      prisma.pedido.findUnique.mockResolvedValue({ id: 'ped_1' });
      prisma.versionBloque.findUnique.mockResolvedValue({
        id: 'v_1',
        bloque: { pedidoId: 'ped_OTRO' },
      });

      await expect(
        service.acusarReciboVersion('ped_1', 'v_1', { id: 'usr_taller', rol: RolUsuario.PRODUCCION }),
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza ForbiddenException si el usuario no tiene rol autorizado', async () => {
      prisma.pedido.findUnique.mockResolvedValue({ id: 'ped_1' });
      prisma.versionBloque.findUnique.mockResolvedValue({
        id: 'v_1',
        bloque: { pedidoId: 'ped_1' },
      });

      await expect(
        service.acusarReciboVersion('ped_1', 'v_1', { id: 'usr_vendedora', rol: RolUsuario.VENDEDORA }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('sella acusadoDisenoEn cuando el rol es DISENO y audita el cambio (R-I01)', async () => {
      prisma.pedido.findUnique.mockResolvedValue({ id: 'ped_1' });
      prisma.versionBloque.findUnique.mockResolvedValue({
        id: 'v_1',
        numero: 2,
        bloque: { pedidoId: 'ped_1' },
        acusadoDisenoEn: null,
        acusadoProduccionEn: null,
      });
      const fechaMock = new Date();
      prisma.versionBloque.update.mockResolvedValue({
        id: 'v_1',
        numero: 2,
        acusadoDisenoEn: fechaMock,
        acusadoProduccionEn: null,
      });

      const res = await service.acusarReciboVersion('ped_1', 'v_1', { id: 'usr_diseno', rol: RolUsuario.DISENO });

      expect(res.yaAcusado).toBe(false);
      expect(res.area).toBe(AreaAcuse.DISENO);
      expect(prisma.versionBloque.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'v_1' },
          data: expect.objectContaining({ acusadoDisenoEn: expect.any(Date) }),
        }),
      );
      expect(auditoria.registrar).toHaveBeenCalledWith(
        expect.objectContaining({
          pedidoId: 'ped_1',
          entidad: 'VersionBloque',
          entidadId: 'v_1',
          campo: 'acusadoDisenoEn',
          origen: 'USUARIO',
          autorUsuarioId: 'usr_diseno',
        }),
      );
    });

    it('sella acusadoProduccionEn cuando el rol es PRODUCCION', async () => {
      prisma.pedido.findUnique.mockResolvedValue({ id: 'ped_1' });
      prisma.versionBloque.findUnique.mockResolvedValue({
        id: 'v_2',
        numero: 2,
        bloque: { pedidoId: 'ped_1' },
        acusadoDisenoEn: null,
        acusadoProduccionEn: null,
      });
      prisma.versionBloque.update.mockResolvedValue({
        id: 'v_2',
        numero: 2,
        acusadoDisenoEn: null,
        acusadoProduccionEn: new Date(),
      });

      const res = await service.acusarReciboVersion('ped_1', 'v_2', { id: 'usr_taller', rol: RolUsuario.PRODUCCION });

      expect(res.yaAcusado).toBe(false);
      expect(res.area).toBe(AreaAcuse.PRODUCCION);
      expect(prisma.versionBloque.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'v_2' },
          data: expect.objectContaining({ acusadoProduccionEn: expect.any(Date) }),
        }),
      );
    });

    it('retorna yaAcusado = true si el area ya habia sido acusada previamente', async () => {
      const fechaPrevia = new Date('2026-09-20T10:00:00Z');
      prisma.pedido.findUnique.mockResolvedValue({ id: 'ped_1' });
      prisma.versionBloque.findUnique.mockResolvedValue({
        id: 'v_1',
        numero: 2,
        bloque: { pedidoId: 'ped_1' },
        acusadoDisenoEn: null,
        acusadoProduccionEn: fechaPrevia,
      });

      const res = await service.acusarReciboVersion('ped_1', 'v_1', { id: 'usr_taller', rol: RolUsuario.PRODUCCION });

      expect(res.yaAcusado).toBe(true);
      expect(res.mensaje).toContain('ya contaba con acuse');
      expect(prisma.versionBloque.update).not.toHaveBeenCalled();
    });

    it('permite a ADMINISTRADOR especificar el area mediante DTO', async () => {
      prisma.pedido.findUnique.mockResolvedValue({ id: 'ped_1' });
      prisma.versionBloque.findUnique.mockResolvedValue({
        id: 'v_1',
        numero: 2,
        bloque: { pedidoId: 'ped_1' },
        acusadoDisenoEn: null,
        acusadoProduccionEn: null,
      });
      prisma.versionBloque.update.mockResolvedValue({
        id: 'v_1',
        numero: 2,
        acusadoDisenoEn: new Date(),
        acusadoProduccionEn: new Date(),
      });

      const res = await service.acusarReciboVersion(
        'ped_1',
        'v_1',
        { id: 'usr_admin', rol: RolUsuario.ADMINISTRADOR },
        { area: AreaAcuse.AMBAS, nota: 'Validado por gerencia' },
      );

      expect(res.area).toBe(AreaAcuse.AMBAS);
      expect(prisma.versionBloque.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            acusadoDisenoEn: expect.any(Date),
            acusadoProduccionEn: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('listarVersionesPendientesAcuse (R-H14)', () => {
    it('lanza NotFoundException si el pedido no existe', async () => {
      prisma.pedido.findUnique.mockResolvedValue(null);
      await expect(service.listarVersionesPendientesAcuse('ped_99')).rejects.toThrow(NotFoundException);
    });

    it('devuelve versiones pendientes y alertaTallerActiva = true si hay partes asignadas', async () => {
      prisma.pedido.findUnique.mockResolvedValue({ id: 'ped_1' });
      prisma.versionBloque.findMany.mockResolvedValue([
        {
          id: 'v_2',
          bloqueId: 'b_lista',
          bloque: { tipo: TipoBloque.LISTA },
          numero: 2,
          motivoReapertura: 'Agregar arquero',
          acusadoDisenoEn: new Date(),
          acusadoProduccionEn: null,
          creadoEn: new Date(),
          creadoPor: { id: 'usr_1', nombre: 'Admin' },
        },
      ]);
      prisma.nestingParte.count.mockResolvedValue(3);

      const res = await service.listarVersionesPendientesAcuse('ped_1');

      expect(res.pedidoId).toBe('ped_1');
      expect(res.alertaTallerActiva).toBe(true);
      expect(res.totalPendientes).toBe(1);
      expect(res.versiones[0].pendienteProduccion).toBe(true);
      expect(res.versiones[0].pendienteDiseno).toBe(false);
    });
  });
});
