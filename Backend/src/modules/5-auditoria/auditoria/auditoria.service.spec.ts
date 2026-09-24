import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AuditoriaService } from './auditoria.service';

describe('AuditoriaService', () => {
  let service: AuditoriaService;
  const createMock = jest.fn();
  const findManyMock = jest.fn();
  const prismaMock: Record<string, unknown> = {
    registroCambio: { create: createMock, findMany: findManyMock },
  };

  beforeEach(async () => {
    createMock.mockReset();
    findManyMock.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriaService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(AuditoriaService);
  });

  it('registra un cambio con origen y autor nulos por defecto', async () => {
    await service.registrar({
      pedidoId: 'p1',
      entidad: 'Diseno',
      entidadId: 'd1',
      campo: 'creacion',
      valorNuevo: '1',
      origen: 'USUARIO',
    });

    expect(createMock).toHaveBeenCalledWith({
      data: {
        pedidoId: 'p1',
        entidad: 'Diseno',
        entidadId: 'd1',
        campo: 'creacion',
        valorAnterior: null,
        valorNuevo: '1',
        origen: 'USUARIO',
        autorUsuarioId: null,
        autorRol: null,
        autorParticipanteId: null,
        prendasAfectadas: null,
      },
    });
  });

  it('audita dentro de una transacción cuando se pasa tx (R-I01 atómico)', async () => {
    const txCreate = jest.fn<Promise<unknown>, [unknown]>();
    const tx = { registroCambio: { create: txCreate } };
    await service.registrar(
      {
        pedidoId: 'p1',
        entidad: 'Prenda',
        entidadId: 'x',
        campo: 'creacion',
        origen: 'USUARIO',
      },
      tx as never,
    );

    const datosAuditados: unknown = txCreate.mock.calls[0][0];
    expect(datosAuditados).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({ pedidoId: 'p1' }) as unknown,
      }),
    );
    expect(createMock).not.toHaveBeenCalled();
  });

  it('lista filtrado por pedido y entidad con take por defecto', async () => {
    findManyMock.mockResolvedValue([]);
    await service.listar({ pedidoId: 'p1', entidad: 'Diseno' });

    const expectedWhere = { pedidoId: 'p1', entidad: 'Diseno' };
    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expectedWhere,
        take: 100,
        orderBy: { creadoEn: 'desc' },
      }),
    );
  });

  it('respeta el límite enviado y el filtro de origen', async () => {
    findManyMock.mockResolvedValue([]);
    await service.listar({ pedidoId: 'p1', origen: 'PARTICIPANTE', limit: 5 });

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { pedidoId: 'p1', origen: 'PARTICIPANTE' },
        take: 5,
      }),
    );
  });

  it('permite filtrar por autorUsuarioId y por campo modificado (R-I03)', async () => {
    findManyMock.mockResolvedValue([]);
    await service.listar({ pedidoId: 'p1', autorUsuarioId: 'u1', campo: 'tallaId' });

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { pedidoId: 'p1', autorUsuarioId: 'u1', campo: 'tallaId' },
      }),
    );
  });

  it('es append-only: no expone update ni delete (R-I02)', () => {
    expect(
      (service as unknown as Record<string, unknown>).update,
    ).toBeUndefined();
    expect(
      (service as unknown as Record<string, unknown>).remove,
    ).toBeUndefined();
  });
});
