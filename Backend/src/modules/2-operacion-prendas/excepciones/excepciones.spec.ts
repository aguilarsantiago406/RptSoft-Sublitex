import { Test, TestingModule } from '@nestjs/testing';
import { ExcepcionesService } from './excepciones.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('🔴 TDD BK2: ExcepcionesService (Bloque C - Deltas)', () => {
  let service: ExcepcionesService;
  let prisma: PrismaService;

  const mockPrisma = {
    excepcionPrenda: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExcepcionesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ExcepcionesService>(ExcepcionesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // R-C01: EXCEPCIONES EN DELTA CON MOTIVO OBLIGATORIO (R-C04)
  // ---------------------------------------------------------------------------
  describe('R-C01: Registro de Delta', () => {
    it('debe registrar únicamente la terna delta (prendaId, atributoId, valorAtributoId) y motivo', async () => {
      const mockExc = {
        id: 'exc_3001',
        prendaId: 'pre_100',
        atributoId: 'attr_cuello',
        valorAtributoId: 'val_cuello_v',
        motivo: 'Alergia al roce del cuello redondo',
      };
      mockPrisma.excepcionPrenda.create.mockResolvedValue(mockExc);

      const res = await service.crear({
        prendaId: 'pre_100',
        atributoId: 'attr_cuello',
        valorAtributoId: 'val_cuello_v',
        motivo: 'Alergia al roce del cuello redondo',
      });

      expect(res.id).toBe('exc_3001');
      expect(res.atributoId).toBe('attr_cuello');
      expect(res.valorAtributoId).toBe('val_cuello_v');
      expect(res.motivo).toBe('Alergia al roce del cuello redondo');
      expect(mockPrisma.excepcionPrenda.create).toHaveBeenCalledWith({
        data: {
          prendaId: 'pre_100',
          atributoId: 'attr_cuello',
          valorAtributoId: 'val_cuello_v',
          motivo: 'Alergia al roce del cuello redondo',
        },
      });
    });
  });
});
