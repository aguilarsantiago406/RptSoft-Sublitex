import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PrendasService } from './prendas.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('🔴 TDD BK2: PrendasService (Bloque E y K)', () => {
  let service: PrendasService;
  let prisma: PrismaService;

  const mockPrisma = {
    prenda: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    grupo: {
      findUnique: jest.fn(),
    },
    bloquePedido: {
      findFirst: jest.fn(),
    },
    colorPedido: {
      findFirst: jest.fn(),
    },
    registroCambio: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrendasService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PrendasService>(PrendasService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // R-K04: EL NÚMERO ES TEXTO Y ADMITE "S/N"
  // ---------------------------------------------------------------------------
  describe('R-K04: Número de Prenda como String', () => {
    it('debe admitir explícitamente "S/N" sin número como un valor válido y no nulo', async () => {
      const mockPrenda = {
        id: 'pre_2001',
        numero: 'S/N',
        tipoPrenda: 'VENTA',
      };
      mockPrisma.prenda.create.mockResolvedValue(mockPrenda);

      const res = await service.crear({
        participanteId: 'part_1',
        grupoId: 'grp_1',
        tipoProductoId: 'prod_cam',
        numero: 'S/N',
      });

      expect(res.numero).toBe('S/N');
      expect(typeof res.numero).toBe('string');
    });

    it('debe admitir números de camiseta como string ("69")', async () => {
      const mockPrenda = {
        id: 'pre_2002',
        numero: '69',
        tipoPrenda: 'VENTA',
      };
      mockPrisma.prenda.create.mockResolvedValue(mockPrenda);

      const res = await service.crear({
        participanteId: 'part_1',
        grupoId: 'grp_1',
        tipoProductoId: 'prod_cam',
        numero: '69',
      });

      expect(res.numero).toBe('69');
    });
  });

  // ---------------------------------------------------------------------------
  // R-K02: PRENDAS DE OBSEQUIO O MUESTRA A PRECIO 0.00
  // ---------------------------------------------------------------------------
  describe('R-K02: Importe 0.00 en Obsequio y Muestra', () => {
    it('debe calcular precio 0.00 si el tipoPrenda es OBSEQUIO', async () => {
      mockPrisma.prenda.create.mockResolvedValue({
        id: 'pre_obsequio',
        tipoPrenda: 'OBSEQUIO',
      });

      const res = await service.crear({
        participanteId: 'part_profesor',
        grupoId: 'grp_1',
        tipoProductoId: 'prod_cam',
        tipoPrenda: 'OBSEQUIO' as any,
      });

      expect(res.tipoPrenda).toBe('OBSEQUIO');
      expect(res.precioCalculado).toBe(0.0);
    });

    it('debe calcular precio 0.00 si el tipoPrenda es MUESTRA', async () => {
      mockPrisma.prenda.create.mockResolvedValue({
        id: 'pre_muestra',
        tipoPrenda: 'MUESTRA',
      });

      const res = await service.crear({
        participanteId: 'part_muestra',
        grupoId: 'grp_1',
        tipoProductoId: 'prod_cam',
        tipoPrenda: 'MUESTRA' as any,
      });

      expect(res.tipoPrenda).toBe('MUESTRA');
      expect(res.precioCalculado).toBe(0.0);
    });

    it('debe calcular precio positivo si el tipoPrenda es VENTA', async () => {
      mockPrisma.prenda.create.mockResolvedValue({
        id: 'pre_venta',
        tipoPrenda: 'VENTA',
      });

      const res = await service.crear({
        participanteId: 'part_alumno',
        grupoId: 'grp_1',
        tipoProductoId: 'prod_cam',
        tipoPrenda: 'VENTA' as any,
      });

      expect(res.tipoPrenda).toBe('VENTA');
      expect(res.precioCalculado).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // R-K03: MULTIPLICACIÓN POR PIEZAS FÍSICAS REALES
  // ---------------------------------------------------------------------------
  describe('R-K03: Resumen de Producción por Componentes Físicos', () => {
    it('debe multiplicar piezas físicas (camisetas, shorts, medias) y no contar sólo prendas', async () => {
      // Simulando caso real:
      // - 2 Conjuntos completos (1 camiseta + 1 short + 1 par de medias cada uno)
      // - 1 Camiseta suelta (1 camiseta + 0 shorts + 0 medias)
      const mockPrendasConComponentes = [
        {
          id: 'pre_1',
          tipoPrenda: 'VENTA',
          tipoProducto: { camisetas: 1, shorts: 1, medias: 1 },
        },
        {
          id: 'pre_2',
          tipoPrenda: 'VENTA',
          tipoProducto: { camisetas: 1, shorts: 1, medias: 1 },
        },
        {
          id: 'pre_3',
          tipoPrenda: 'OBSEQUIO',
          tipoProducto: { camisetas: 1, shorts: 0, medias: 0 },
        },
      ];
      mockPrisma.prenda.findMany.mockResolvedValue(mockPrendasConComponentes);

      const resumen = await service.obtenerResumenProduccion('ped_promo_2002');

      expect(resumen.totalPrendas).toBe(3);
      expect(resumen.piezasFisicas.totalCamisetas).toBe(3); // 1 + 1 + 1
      expect(resumen.piezasFisicas.totalShorts).toBe(2);    // 1 + 1 + 0
      expect(resumen.piezasFisicas.totalMedias).toBe(2);    // 1 + 1 + 0
      expect(resumen.desgloseTiposPrenda.venta).toBe(2);
      expect(resumen.desgloseTiposPrenda.obsequio).toBe(1);
    });
  });

  // ---------------------------------------------------------------------------
  // R-H03: CANDADO DE LISTA CERRADA
  // ---------------------------------------------------------------------------
  describe('R-H03: Bloqueo de Modificación si Lista está Cerrada', () => {
    it('debe rechazar actualizar prenda si el bloque LISTA está CERRADO', async () => {
      mockPrisma.prenda.findUnique.mockResolvedValue({
        id: 'pre_1',
        grupo: { pedidoId: 'ped_1' },
      });
      mockPrisma.bloquePedido.findFirst.mockResolvedValue({
        id: 'blk_1',
        tipo: 'LISTA',
        estado: 'CERRADO',
      });

      await expect(
        service.actualizarFichaMinima('pre_1', { numero: '10' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ---------------------------------------------------------------------------
  // R-K05: COLOR VÁLIDO DENTRO DE LA PALETA DEL PEDIDO
  // ---------------------------------------------------------------------------
  describe('R-K05: Validación de ColorPedido', () => {
    it('debe rechazar colorId si no pertenece a la paleta del pedido al actualizar', async () => {
      mockPrisma.prenda.findUnique.mockResolvedValue({
        id: 'pre_1',
        grupo: { pedidoId: 'ped_1' },
      });
      mockPrisma.bloquePedido.findFirst.mockResolvedValue(null);
      mockPrisma.colorPedido.findFirst.mockResolvedValue(null); // color inexistente

      await expect(
        service.actualizarFichaMinima('pre_1', { colorId: 'col_falso' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar crear prenda si colorId no pertenece a la paleta del pedido', async () => {
      mockPrisma.grupo.findUnique.mockResolvedValue({
        id: 'grp_1',
        pedidoId: 'ped_1',
      });
      mockPrisma.bloquePedido.findFirst.mockResolvedValue(null);
      mockPrisma.colorPedido.findFirst.mockResolvedValue(null); // color inexistente

      await expect(
        service.crear({
          participanteId: 'part_1',
          grupoId: 'grp_1',
          tipoProductoId: 'prod_1',
          colorId: 'col_invalido',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ---------------------------------------------------------------------------
  // R-I01 / R-I04: AUDITORÍA EN REGISTROCAMBIO TRAS CONFIRMACIÓN
  // ---------------------------------------------------------------------------
  describe('R-I01 / R-I04: Trazabilidad en RegistroCambio', () => {
    it('debe registrar en RegistroCambio cuando se altera una prenda de un participante CONFIRMADO', async () => {
      mockPrisma.prenda.findUnique.mockResolvedValue({
        id: 'pre_1',
        numero: '7',
        tallaId: 'talla_M',
        grupo: { pedidoId: 'ped_1' },
        participante: { estado: 'CONFIRMADO' },
      });
      mockPrisma.bloquePedido.findFirst.mockResolvedValue(null);
      mockPrisma.prenda.update.mockResolvedValue({ id: 'pre_1', tipoPrenda: 'VENTA', numero: '10' });

      await service.actualizarFichaMinima(
        'pre_1',
        { numero: '10' },
        { id: 'usr_coord_1', rol: 'COORDINADOR_OPERATIVO' },
      );

      expect(mockPrisma.registroCambio.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            pedidoId: 'ped_1',
            entidad: 'Prenda',
            entidadId: 'pre_1',
            campo: 'numero',
            valorAnterior: '7',
            valorNuevo: '10',
            origen: 'USUARIO',
            autorUsuarioId: 'usr_coord_1',
          }),
        }),
      );
    });
  });
});
