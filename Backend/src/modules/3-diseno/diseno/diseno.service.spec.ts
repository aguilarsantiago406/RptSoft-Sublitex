import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AuditoriaService } from '../../5-auditoria/auditoria/auditoria.service';
import { DisenoService } from './diseno.service';

describe('DisenoService', () => {
  let service: DisenoService;

  interface RegistroAuditoria {
    pedidoId: string;
    entidad: string;
    entidadId: string;
    campo: string;
    valorAnterior?: string | null;
    valorNuevo?: string | null;
    autorUsuarioId?: string;
    autorRol?: string;
  }
  interface UpdateArgs {
    where: { id: string };
    data: Record<string, unknown>;
  }

  const registrarMock = jest.fn<Promise<void>, [RegistroAuditoria, unknown?]>();
  const disenoFindUniqueMock = jest.fn<
    Promise<unknown>,
    [Record<string, unknown>?]
  >();
  const txCreateMock = jest.fn<
    Promise<unknown>,
    [{ data: Record<string, unknown> }]
  >();
  const txUpdateMock = jest.fn<
    Promise<{ id: string; estado?: string }>,
    [UpdateArgs]
  >();

  const txMock = {
    diseno: { create: txCreateMock, update: txUpdateMock },
  };

  const prismaMock: Record<string, unknown> = {
    pedido: { findUnique: jest.fn() },
    usuario: { findUnique: jest.fn() },
    diseno: {
      findUnique: disenoFindUniqueMock,
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(txMock)),
  };

  const auditoriaMock: Record<string, unknown> = { registrar: registrarMock };

  beforeEach(async () => {
    registrarMock.mockReset();
    disenoFindUniqueMock.mockReset();
    txCreateMock.mockReset();
    txUpdateMock.mockReset();
    (prismaMock.pedido.findUnique as jest.Mock)
      .mockReset()
      .mockResolvedValue({ id: 'p1' });
    (prismaMock.diseno.findFirst as jest.Mock)
      .mockReset()
      .mockResolvedValue(null);
    (prismaMock.usuario.findUnique as jest.Mock).mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisenoService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditoriaService, useValue: auditoriaMock },
      ],
    }).compile();

    service = module.get(DisenoService);
  });

  describe('proponer', () => {
    it('transiciona BORRADOR → PROPUESTO y audita dentro de la transacción', async () => {
      disenoFindUniqueMock.mockResolvedValue({
        id: 'd1',
        pedidoId: 'p1',
        estado: 'BORRADOR',
      });
      txUpdateMock.mockResolvedValue({ id: 'd1', estado: 'PROPUESTO' });

      await service.proponer('d1');

      expect(txUpdateMock).toHaveBeenCalledWith({
        where: { id: 'd1' },
        data: { estado: 'PROPUESTO' },
      });
      expect(registrarMock).toHaveBeenCalledWith(
        expect.objectContaining({
          pedidoId: 'p1',
          entidad: 'Diseno',
          campo: 'estado',
          valorAnterior: 'BORRADOR',
          valorNuevo: 'PROPUESTO',
        }),
        txMock,
      );
    });

    it('rechaza proponer un diseño que no está en BORRADOR', async () => {
      disenoFindUniqueMock.mockResolvedValue({
        id: 'd1',
        pedidoId: 'p1',
        estado: 'APROBADO',
      });
      await expect(service.proponer('d1')).rejects.toThrow(ConflictException);
    });

    it('lanza NotFound si el diseño no existe', async () => {
      disenoFindUniqueMock.mockResolvedValue(null);
      await expect(service.proponer('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('aprobar', () => {
    it('exige usuarioId (usuarioId obligatorio para la aprobación)', async () => {
      disenoFindUniqueMock.mockResolvedValue({
        id: 'd1',
        pedidoId: 'p1',
        estado: 'PROPUESTO',
      });
      await expect(service.aprobar('d1', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rechaza aprobar un diseño que no está en PROPUESTO', async () => {
      disenoFindUniqueMock.mockResolvedValue({
        id: 'd1',
        pedidoId: 'p1',
        estado: 'RECHAZADO',
      });
      await expect(service.aprobar('d1', { usuarioId: 'u1' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('aprueba, congela aprobadoEn/aprobadoPorId y atribuye el rol al registro', async () => {
      disenoFindUniqueMock.mockResolvedValue({
        id: 'd1',
        pedidoId: 'p1',
        estado: 'PROPUESTO',
      });
      (prismaMock.usuario.findUnique as jest.Mock).mockResolvedValue({
        id: 'u1',
        rol: 'DISENO',
      });
      txUpdateMock.mockResolvedValue({ id: 'd1', estado: 'APROBADO' });

      await service.aprobar('d1', { usuarioId: 'u1' });

      const call = txUpdateMock.mock.calls[0][0];
      expect(call.data).toEqual(
        expect.objectContaining({
          estado: 'APROBADO',
          aprobadoPorId: 'u1',
          aprobadoEn: expect.any(Date) as Date,
        }),
      );
      expect(registrarMock).toHaveBeenCalledWith(
        expect.objectContaining({
          campo: 'estado',
          valorNuevo: 'APROBADO',
          autorUsuarioId: 'u1',
          autorRol: 'DISENO',
        }),
        txMock,
      );
    });
  });

  describe('rechazar', () => {
    it('audita estado limpio y motivo como campo separado (no en el string)', async () => {
      disenoFindUniqueMock.mockResolvedValue({
        id: 'd1',
        pedidoId: 'p1',
        estado: 'PROPUESTO',
      });
      txUpdateMock.mockResolvedValue({ id: 'd1', estado: 'RECHAZADO' });

      await service.rechazar('d1', { motivo: 'colores incompletos' });

      expect(txUpdateMock).toHaveBeenCalledWith({
        where: { id: 'd1' },
        data: { estado: 'RECHAZADO' },
      });
      expect(registrarMock).toHaveBeenCalledTimes(2);
      const primera = registrarMock.mock.calls[0][0];
      const motivo = registrarMock.mock.calls[1][0];
      expect(primera).toEqual(
        expect.objectContaining({
          campo: 'estado',
          valorAnterior: 'PROPUESTO',
          valorNuevo: 'RECHAZADO',
        }),
      );
      expect(motivo).toEqual(
        expect.objectContaining({
          campo: 'motivoRechazo',
          valorNuevo: 'colores incompletos',
        }),
      );
      expect(motivo.valorNuevo).not.toContain('RECHAZADO');
    });
  });

  describe('actualizarArtefactos', () => {
    it('rechaza reemplazar artefactos de un diseño APROBADO', async () => {
      disenoFindUniqueMock.mockResolvedValue({
        id: 'd1',
        pedidoId: 'p1',
        estado: 'APROBADO',
      });
      await expect(
        service.actualizarArtefactos('d1', { archivoUrl: 'nuevo.svg' }),
      ).rejects.toThrow(ConflictException);
    });

    it('reemplaza artefactos y audita el diff en la misma transacción', async () => {
      disenoFindUniqueMock.mockResolvedValue({
        id: 'd1',
        pedidoId: 'p1',
        estado: 'BORRADOR',
        archivoUrl: 'viejo.svg',
        imagenUrl: null,
      });
      txUpdateMock.mockResolvedValue({ id: 'd1' });

      await service.actualizarArtefactos('d1', {
        archivoUrl: 'nuevo.svg',
        imagenUrl: 'vista.png',
      });

      expect(txUpdateMock).toHaveBeenCalledWith({
        where: { id: 'd1' },
        data: { archivoUrl: 'nuevo.svg', imagenUrl: 'vista.png' },
      });
      expect(registrarMock).toHaveBeenCalledTimes(2);
      expect(registrarMock.mock.calls.map((c) => c[0])).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            campo: 'archivoUrl',
            valorAnterior: 'viejo.svg',
            valorNuevo: 'nuevo.svg',
          }),
          expect.objectContaining({
            campo: 'imagenUrl',
            valorAnterior: null,
            valorNuevo: 'vista.png',
          }),
        ]),
      );
    });

    it('no audita campos que no cambiaron', async () => {
      disenoFindUniqueMock.mockResolvedValue({
        id: 'd1',
        pedidoId: 'p1',
        estado: 'BORRADOR',
        archivoUrl: 'igual.svg',
        imagenUrl: null,
      });
      txUpdateMock.mockResolvedValue({ id: 'd1' });

      await service.actualizarArtefactos('d1', { archivoUrl: 'igual.svg' });

      expect(registrarMock).not.toHaveBeenCalled();
      expect(txUpdateMock).toHaveBeenCalledTimes(1);
    });
  });
});
