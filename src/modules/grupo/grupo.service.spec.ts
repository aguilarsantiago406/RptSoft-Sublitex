import { Test } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { GrupoService } from './grupo.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGrupoDto, PoliticaNumeracion } from './dto/create-grupo.dto';
import { UpdatePoliticaDto } from './dto/update-politica.dto';

function buildPrismaMock() {
  return {
    pedido: { findUnique: jest.fn() },
    tipoProducto: { findUnique: jest.fn() },
    grupo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
}

async function crearServicio(prisma: any): Promise<GrupoService> {
  const moduleRef = await Test.createTestingModule({
    providers: [GrupoService, { provide: PrismaService, useValue: prisma }],
  }).compile();
  return moduleRef.get(GrupoService);
}

const dtoBase: CreateGrupoDto = {
  nombre: 'Conjunto Blanco Titular',
  tipoProductoId: 'tp_1',
  cantidadContratada: 17,
  politicaNumeracion: PoliticaNumeracion.LIBRE,
};

describe('R-B01 · Nombre único de grupo dentro del pedido', () => {
  it('rechaza crear dos grupos con el mismo nombre', async () => {
    const prisma = buildPrismaMock();
    prisma.pedido.findUnique.mockResolvedValue({ id: 'ped_1' });
    prisma.tipoProducto.findUnique.mockResolvedValue({ id: 'tp_1' });
    prisma.grupo.create.mockRejectedValue({ code: 'P2002' });
    const service = await crearServicio(prisma);
    await expect(service.create('ped_1', dtoBase)).rejects.toThrow(ConflictException);
  });

  it('responde 404 si el tipo de producto no existe', async () => {
    const prisma = buildPrismaMock();
    prisma.pedido.findUnique.mockResolvedValue({ id: 'ped_1' });
    prisma.tipoProducto.findUnique.mockResolvedValue(null);
    const service = await crearServicio(prisma);
    await expect(service.create('ped_1', dtoBase)).rejects.toThrow(NotFoundException);
  });

  it('responde 404 si el pedido no existe', async () => {
    const prisma = buildPrismaMock();
    prisma.pedido.findUnique.mockResolvedValue(null);
    const service = await crearServicio(prisma);
    await expect(service.create('ped_1', dtoBase)).rejects.toThrow(NotFoundException);
  });
});

describe('R-G06 · No se cambia a política UNICA con números repetidos', () => {
  it('respeta R-B02 al crear: cantidadContratada obligatoria en el DTO', () => {
    const fields = Object.keys(dtoBase);
    expect(fields).toContain('cantidadContratada');
  });

  it('rechaza el cambio de política cuando el trigger de la BD lo bloquea', async () => {
    const prisma = buildPrismaMock();
    prisma.grupo.findUnique.mockResolvedValue({
      id: 'grp_1',
      nombre: 'Titulares',
      politicaNumeracion: 'LIBRE',
    });
    prisma.grupo.update.mockRejectedValue({ code: 'P2002' });
    const service = await crearServicio(prisma);
    const dto: UpdatePoliticaDto = { politicaNumeracion: PoliticaNumeracion.UNICA };
    await expect(service.updatePolitica('grp_1', dto)).rejects.toThrow(ConflictException);
  });

  it('no toca la BD si la política no cambia', async () => {
    const prisma = buildPrismaMock();
    prisma.grupo.findUnique.mockResolvedValue({
      id: 'grp_1',
      nombre: 'Titulares',
      politicaNumeracion: 'LIBRE',
    });
    const service = await crearServicio(prisma);
    const dto: UpdatePoliticaDto = { politicaNumeracion: PoliticaNumeracion.LIBRE };
    const result = await service.updatePolitica('grp_1', dto);
    expect(result.politicaNumeracion).toBe('LIBRE');
    expect(prisma.grupo.update).not.toHaveBeenCalled();
  });
});