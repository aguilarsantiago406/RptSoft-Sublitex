import { Test, TestingModule } from '@nestjs/testing';
import { PersonalizacionesService } from './personalizaciones.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('🔴 TDD BK2: PersonalizacionesService (Bloque F - Estampados)', () => {
  let service: PersonalizacionesService;
  let prisma: PrismaService;

  const mockPrisma = {
    personalizacion: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonalizacionesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PersonalizacionesService>(PersonalizacionesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // R-F01 / R-F03: ESTAMPADOS CON UBICACIÓN DECLARADA OBLIGATORIA
  // ---------------------------------------------------------------------------
  describe('R-F01 / R-F03: Ubicación Declarada', () => {
    it('debe registrar el estampado asociando prendaId, ubicacionId y contenido', async () => {
      const mockPers = {
        id: 'pers_4001',
        prendaId: 'pre_2001',
        ubicacionId: 'ubic_espalda_alta',
        contenido: 'MENDOZA',
      };
      mockPrisma.personalizacion.create.mockResolvedValue(mockPers);

      const res = await service.crear({
        prendaId: 'pre_2001',
        ubicacionId: 'ubic_espalda_alta',
        contenido: 'MENDOZA',
      });

      expect(res.id).toBe('pers_4001');
      expect(res.ubicacionId).toBe('ubic_espalda_alta');
      expect(res.contenido).toBe('MENDOZA');
      expect(mockPrisma.personalizacion.create).toHaveBeenCalledWith({
        data: {
          prendaId: 'pre_2001',
          ubicacionId: 'ubic_espalda_alta',
          contenido: 'MENDOZA',
        },
      });
    });
  });
});
