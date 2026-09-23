import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, GoneException, BadRequestException } from '@nestjs/common';
import { ParticipantesService } from './participantes.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('🔴 TDD BK2: ParticipantesService (Bloque D)', () => {
  let service: ParticipantesService;
  let prisma: PrismaService;

  const mockPrisma = {
    participante: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    prenda: {
      update: jest.fn(),
    },
    personalizacion: {
      upsert: jest.fn(),
    },
    bloquePedido: {
      findFirst: jest.fn(),
    },
    colorPedido: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipantesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ParticipantesService>(ParticipantesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // R-D05: ENLACE PERSONAL SIN CONTRASEÑA
  // ---------------------------------------------------------------------------
  describe('R-D05: Creación con enlaceToken único', () => {
    it('debe generar un enlaceToken aleatorio y asignar estado PENDIENTE', async () => {
      const mockResult = {
        id: 'part_1001',
        grupoId: 'grp_promo',
        nombrePersona: 'Carlos Chapoñán',
        estado: 'PENDIENTE',
        enlaceToken: 'tok_random123',
        enlaceExpiraEn: new Date(Date.now() + 7 * 86400000),
        enlaceRevocado: false,
      };
      mockPrisma.participante.create.mockResolvedValue(mockResult);

      const res = await service.crearEnGrupo('grp_promo', {
        nombrePersona: 'Carlos Chapoñán',
      });

      expect(res.id).toBe('part_1001');
      expect(res.enlaceToken).toBeDefined();
      expect(res.estado).toBe('PENDIENTE');
      expect(res.enlaceRevocado).toBe(false);
      expect(mockPrisma.participante.create).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  // R-D05 / R-D06: ACCESO POR ENLACE TOKEN
  // ---------------------------------------------------------------------------
  describe('R-D05 / R-D06: Validación de Token y Expiración', () => {
    it('debe devolver la ficha si el enlaceToken es válido y vigente', async () => {
      const mockPart = {
        id: 'part_1002',
        enlaceToken: 'tok_valido',
        enlaceRevocado: false,
        enlaceExpiraEn: new Date(Date.now() + 86400000), // Mañana
        prendas: [],
      };
      mockPrisma.participante.findUnique.mockResolvedValue(mockPart);

      const res = await service.obtenerPorEnlaceToken('tok_valido');
      expect(res.id).toBe('part_1002');
    });

    it('R-D06: Debe lanzar GoneException si el enlace fue revocado', async () => {
      const mockPartRevocado = {
        id: 'part_1002',
        enlaceToken: 'tok_revocado',
        enlaceRevocado: true,
        enlaceExpiraEn: new Date(Date.now() + 86400000),
      };
      mockPrisma.participante.findUnique.mockResolvedValue(mockPartRevocado);

      await expect(service.obtenerPorEnlaceToken('tok_revocado')).rejects.toThrow(
        GoneException,
      );
    });

    it('R-D06: Debe lanzar GoneException si el enlace ya expiró', async () => {
      const mockPartExpirado = {
        id: 'part_1002',
        enlaceToken: 'tok_expirado',
        enlaceRevocado: false,
        enlaceExpiraEn: new Date(Date.now() - 86400000), // Ayer
      };
      mockPrisma.participante.findUnique.mockResolvedValue(mockPartExpirado);

      await expect(service.obtenerPorEnlaceToken('tok_expirado')).rejects.toThrow(
        GoneException,
      );
    });
  });

  // ---------------------------------------------------------------------------
  // R-D03: CICLO DE VIDA (PENDIENTE -> REGISTRADO -> CONFIRMADO)
  // ---------------------------------------------------------------------------
  describe('R-D03: Transición de Estados del Participante', () => {
    it('debe pasar a estado REGISTRADO y sellar registradoEn al guardar la ficha', async () => {
      const mockPart = {
        id: 'part_1002',
        enlaceToken: 'tok_valido',
        enlaceRevocado: false,
        enlaceExpiraEn: new Date(Date.now() + 86400000),
        prendas: [{ id: 'pre_1' }],
      };
      mockPrisma.participante.findUnique.mockResolvedValue(mockPart);
      mockPrisma.prenda.update.mockResolvedValue({});
      mockPrisma.participante.update.mockResolvedValue({
        id: 'part_1002',
        estado: 'REGISTRADO',
        registradoEn: new Date(),
      });

      const res = await service.guardarFichaEnlace('tok_valido', {
        prendas: [
          {
            prendaId: 'pre_1',
            tallaId: 'talla_M',
            numero: '10',
            nombreEnPrenda: 'MENDOZA',
          },
        ],
      });

      expect(res.estado).toBe('REGISTRADO');
      expect(res.registradoEn).toBeDefined();
    });

    it('debe pasar a estado CONFIRMADO y sellar confirmadoEn', async () => {
      const mockPart = {
        id: 'part_1002',
        enlaceToken: 'tok_valido',
        enlaceRevocado: false,
      };
      mockPrisma.participante.findUnique.mockResolvedValue(mockPart);
      mockPrisma.participante.update.mockResolvedValue({
        id: 'part_1002',
        estado: 'CONFIRMADO',
        confirmadoEn: new Date(),
      });

      const res = await service.confirmarPorEnlace('tok_valido');
      expect(res.estado).toBe('CONFIRMADO');
      expect(res.confirmadoEn).toBeDefined();
    });

    it('Seguridad BOLA: debe rechazar guardar la ficha si la prenda no pertenece al participante', async () => {
      const mockPart = {
        id: 'part_1002',
        enlaceToken: 'tok_valido',
        enlaceRevocado: false,
        enlaceExpiraEn: new Date(Date.now() + 86400000),
        prendas: [{ id: 'pre_1' }], // Solo le pertenece pre_1
      };
      mockPrisma.participante.findUnique.mockResolvedValue(mockPart);

      await expect(
        service.guardarFichaEnlace('tok_valido', {
          prendas: [
            {
              prendaId: 'pre_ajena_999', // Prenda de otro participante
              tallaId: 'talla_L',
            },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ---------------------------------------------------------------------------
  // R-D07 / R-H03: ELIMINACIÓN DE PARTICIPANTE
  // ---------------------------------------------------------------------------
  describe('R-D07 / R-H03: Eliminación de Participante', () => {
    it('debe eliminar el participante si la lista está abierta', async () => {
      mockPrisma.participante.findUnique.mockResolvedValue({
        id: 'part_1',
        grupo: { pedidoId: 'ped_1' },
      });
      mockPrisma.bloquePedido.findFirst.mockResolvedValue(null);
      mockPrisma.participante.delete.mockResolvedValue({});

      const res = await service.eliminar('part_1');
      expect(res.mensaje).toBeDefined();
      expect(mockPrisma.participante.delete).toHaveBeenCalledWith({ where: { id: 'part_1' } });
    });

    it('R-H03: debe rechazar eliminar participante si la lista está CERRADA', async () => {
      mockPrisma.participante.findUnique.mockResolvedValue({
        id: 'part_1',
        grupo: { pedidoId: 'ped_1' },
      });
      mockPrisma.bloquePedido.findFirst.mockResolvedValue({
        id: 'bloq_1',
        tipo: 'LISTA',
        estado: 'CERRADO',
      });

      await expect(service.eliminar('part_1')).rejects.toThrow(BadRequestException);
    });
  });
});
