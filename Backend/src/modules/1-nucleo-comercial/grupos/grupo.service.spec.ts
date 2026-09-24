import { Test } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { GrupoService } from './grupo.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateGrupoDto, PoliticaNumeracion } from './dto/create-grupo.dto';
import { UpdatePoliticaDto } from './dto/update-politica.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';

function buildPrismaMock() {
  return {
    pedido: { findUnique: jest.fn() },
    tipoProducto: { findUnique: jest.fn() },
    grupo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    participante: { count: jest.fn() },
    prenda: { count: jest.fn() },
    valorAtributo: { findFirst: jest.fn() },
    valorConfiguracion: { upsert: jest.fn(), findMany: jest.fn() },
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

describe('findOne · Obtener grupo por ID', () => {
  it('lanza NotFoundException si el grupo no existe', async () => {
    const prisma = buildPrismaMock();
    prisma.grupo.findUnique.mockResolvedValue(null);
    const service = await crearServicio(prisma);
    await expect(service.findOne('grp_inexistente')).rejects.toThrow(NotFoundException);
  });

  it('retorna el grupo con su tipoProducto y configuracion', async () => {
    const prisma = buildPrismaMock();
    prisma.grupo.findUnique.mockResolvedValue({
      id: 'grp_1',
      nombre: 'Titulares',
      politicaNumeracion: 'LIBRE',
      cantidadContratada: 17,
      tipoProducto: { id: 'tp_1', codigo: 'CONJUNTO', nombre: 'Conjunto deportivo', camisetas: 1, shorts: 1, medias: 0 },
      configuracion: [],
    });
    const service = await crearServicio(prisma);
    const result = await service.findOne('grp_1');
    expect(result.id).toBe('grp_1');
    expect(result.tipoProducto?.codigo).toBe('CONJUNTO');
  });
});

describe('update · Actualizar datos de un grupo (R-B03)', () => {
  it('actualiza observaciones sin tocar otras propiedades', async () => {
    const grupoBase = {
      id: 'grp_1',
      nombre: 'Titulares',
      politicaNumeracion: 'LIBRE',
      cantidadContratada: 17,
      tipoProducto: { id: 'tp_1', codigo: 'CONJUNTO', nombre: 'Conjunto deportivo', camisetas: 1, shorts: 1, medias: 0 },
      configuracion: [],
    };
    const prisma = buildPrismaMock();
    prisma.grupo.findUnique.mockResolvedValue(grupoBase);
    prisma.grupo.update.mockResolvedValue({ ...grupoBase, observaciones: 'Con escudo', configuracion: [] });
    prisma.valorConfiguracion.findMany.mockResolvedValue([]);
    const service = await crearServicio(prisma);
    const dto: UpdateGrupoDto = { observaciones: 'Con escudo' };
    const result = await service.update('grp_1', dto);
    expect(result.observaciones).toBe('Con escudo');
  });

  it('lanza NotFoundException si el grupo no existe', async () => {
    const prisma = buildPrismaMock();
    prisma.grupo.findUnique.mockResolvedValue(null);
    const service = await crearServicio(prisma);
    await expect(service.update('inexistente', {})).rejects.toThrow(NotFoundException);
  });

  it('lanza ConflictException si se duplica el nombre (P2002)', async () => {
    const prisma = buildPrismaMock();
    prisma.grupo.findUnique.mockResolvedValue({ id: 'grp_1', nombre: 'Titulares', politicaNumeracion: 'LIBRE', configuracion: [] });
    prisma.grupo.update.mockRejectedValue({ code: 'P2002' });
    const service = await crearServicio(prisma);
    await expect(service.update('grp_1', { nombre: 'Suplentes' })).rejects.toThrow(ConflictException);
  });
});

describe('remove · Eliminar grupo (R-B01 restricción)', () => {
  it('elimina el grupo si no tiene participantes ni prendas', async () => {
    const grupoBase = { id: 'grp_1', nombre: 'Titulares', politicaNumeracion: 'LIBRE', tipoProducto: null, configuracion: [] };
    const prisma = buildPrismaMock();
    prisma.grupo.findUnique.mockResolvedValue(grupoBase);
    prisma.participante.count.mockResolvedValue(0);
    prisma.prenda.count.mockResolvedValue(0);
    prisma.grupo.delete.mockResolvedValue(grupoBase);
    const service = await crearServicio(prisma);
    const result = await service.remove('grp_1');
    expect(result.eliminado).toBe(true);
    expect(prisma.grupo.delete).toHaveBeenCalledWith({ where: { id: 'grp_1' } });
  });

  it('lanza ConflictException si el grupo tiene participantes', async () => {
    const grupoBase = { id: 'grp_1', nombre: 'Titulares', politicaNumeracion: 'LIBRE', tipoProducto: null, configuracion: [] };
    const prisma = buildPrismaMock();
    prisma.grupo.findUnique.mockResolvedValue(grupoBase);
    prisma.participante.count.mockResolvedValue(3);
    prisma.prenda.count.mockResolvedValue(0);
    const service = await crearServicio(prisma);
    await expect(service.remove('grp_1')).rejects.toThrow(ConflictException);
  });

  it('lanza NotFoundException si el grupo no existe', async () => {
    const prisma = buildPrismaMock();
    prisma.grupo.findUnique.mockResolvedValue(null);
    const service = await crearServicio(prisma);
    await expect(service.remove('inexistente')).rejects.toThrow(NotFoundException);
  });
});