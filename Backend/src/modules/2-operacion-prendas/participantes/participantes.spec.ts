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
    grupo: {
      findUnique: jest.fn(),
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

  // ---------------------------------------------------------------------------
  // R-D05 / R-D06 / R-I04: COMPILADOR Y EXPORTADOR DE ENLACES PARA WHATSAPP
  // ---------------------------------------------------------------------------
  describe('R-D05 / R-D06: Compilador de Enlaces para WhatsApp Grupal', () => {
    it('debe lanzar NotFoundException si el grupo no existe', async () => {
      mockPrisma.grupo.findUnique.mockResolvedValue(null);

      await expect(service.obtenerEnlacesWhatsApp('grp_inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe compilar enlaces y generar el mensaje formateado para WhatsApp grupal', async () => {
      mockPrisma.grupo.findUnique.mockResolvedValue({
        id: 'grp_promo',
        nombre: 'Polos Alumnos',
        pedidoId: 'ped_842',
        pedido: {
          id: 'ped_842',
          codigo: 'SUB-000842',
        },
      });

      mockPrisma.participante.findMany.mockResolvedValue([
        {
          id: 'part_1',
          nombrePersona: 'Ana Li',
          estado: 'PENDIENTE',
          enlaceToken: 'tok_anali123',
          enlaceExpiraEn: new Date(Date.now() + 5 * 86400000),
          enlaceRevocado: false,
        },
        {
          id: 'part_2',
          nombrePersona: 'Carlos Chapoñán',
          estado: 'REGISTRADO',
          enlaceToken: 'tok_chapo456',
          enlaceExpiraEn: new Date(Date.now() + 5 * 86400000),
          enlaceRevocado: false,
        },
      ]);

      const res = await service.obtenerEnlacesWhatsApp('grp_promo');

      expect(res.pedidoCodigo).toBe('SUB-000842');
      expect(res.grupoNombre).toBe('Polos Alumnos');
      expect(res.total).toBe(2);
      expect(res.soloPendientes).toBe(false);
      expect(res.participantes).toHaveLength(2);
      expect(res.participantes[0].url).toContain('/ficha/tok_anali123');
      expect(res.participantes[0].valido).toBe(true);

      // Verificamos que el mensaje formateado para el coordinador contenga emojis y enlaces
      expect(res.mensajeGrupal).toContain('📢 *Registro de Tallas y Nombres — SUB-000842 (Polos Alumnos)*');
      expect(res.mensajeGrupal).toContain('👉 *Ana Li*:');
      expect(res.mensajeGrupal).toContain('👉 *Carlos Chapoñán*:');
      expect(res.mensajeGrupal).toContain('/ficha/tok_anali123');
    });

    it('debe filtrar solo participantes PENDIENTES si soloPendientes=true', async () => {
      mockPrisma.grupo.findUnique.mockResolvedValue({
        id: 'grp_promo',
        nombre: 'Polos Alumnos',
        pedidoId: 'ped_842',
        pedido: {
          id: 'ped_842',
          codigo: 'SUB-000842',
        },
      });

      mockPrisma.participante.findMany.mockResolvedValue([
        {
          id: 'part_1',
          nombrePersona: 'Ana Li',
          estado: 'PENDIENTE',
          enlaceToken: 'tok_anali123',
          enlaceExpiraEn: new Date(Date.now() + 5 * 86400000),
          enlaceRevocado: false,
        },
      ]);

      const res = await service.obtenerEnlacesWhatsApp('grp_promo', true);

      expect(mockPrisma.participante.findMany).toHaveBeenCalledWith({
        where: { grupoId: 'grp_promo', estado: 'PENDIENTE' },
        orderBy: { nombrePersona: 'asc' },
      });
      expect(res.total).toBe(1);
      expect(res.soloPendientes).toBe(true);
      expect(res.mensajeGrupal).toContain('📢 *Recordatorio: Registro de Tallas y Nombres');
    });

    it('debe marcar valido=false si el enlace fue revocado o ha expirado', async () => {
      mockPrisma.grupo.findUnique.mockResolvedValue({
        id: 'grp_promo',
        nombre: 'Polos Alumnos',
        pedidoId: 'ped_842',
        pedido: {
          id: 'ped_842',
          codigo: 'SUB-000842',
        },
      });

      mockPrisma.participante.findMany.mockResolvedValue([
        {
          id: 'part_exp',
          nombrePersona: 'Hada Expirada',
          estado: 'PENDIENTE',
          enlaceToken: 'tok_exp123',
          enlaceExpiraEn: new Date(Date.now() - 86400000), // Venció ayer
          enlaceRevocado: false,
        },
        {
          id: 'part_rev',
          nombrePersona: 'Pedro Revocado',
          estado: 'PENDIENTE',
          enlaceToken: 'tok_rev456',
          enlaceExpiraEn: new Date(Date.now() + 86400000),
          enlaceRevocado: true, // Revocado
        },
      ]);

      const res = await service.obtenerEnlacesWhatsApp('grp_promo');

      expect(res.participantes[0].expirado).toBe(true);
      expect(res.participantes[0].valido).toBe(false);
      expect(res.participantes[1].enlaceRevocado).toBe(true);
      expect(res.participantes[1].valido).toBe(false);
    });
  });
});

