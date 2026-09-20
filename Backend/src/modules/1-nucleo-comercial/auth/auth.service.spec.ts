import { Test } from '@nestjs/testing';
import { UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    sign: jest.fn().mockReturnValue('token-jwt-mock'),
  })),
}));

import { JwtService } from '@nestjs/jwt';

function buildPrismaMock() {
  return {
    usuario: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
}

async function crearServicio(prisma: any): Promise<AuthService> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      AuthService,
      { provide: PrismaService, useValue: prisma },
      { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('token-jwt-mock') } },
    ],
  }).compile();
  return moduleRef.get(AuthService);
}

const usuarioActivo: any = {
  id: 'usr_1',
  email: 'admin@sublitex.com',
  nombre: 'Admin',
  rol: 'ADMINISTRADOR',
  activo: true,
  password: '',
};

beforeAll(async () => {
  usuarioActivo.password = await bcrypt.hash('password123', 10);
});

describe('login', () => {
  it('devuelve accessToken y datos del usuario con credenciales correctas', async () => {
    const prisma = buildPrismaMock();
    prisma.usuario.findUnique.mockResolvedValue(usuarioActivo);
    const service = await crearServicio(prisma);

    const result = await service.login({ email: 'admin@sublitex.com', password: 'password123' });

    expect(result.accessToken).toBe('token-jwt-mock');
    expect(result.user.email).toBe('admin@sublitex.com');
    expect((result.user as any).password).toBeUndefined();
  });

  it('lanza UnauthorizedException con contrasena incorrecta', async () => {
    const prisma = buildPrismaMock();
    prisma.usuario.findUnique.mockResolvedValue(usuarioActivo);
    const service = await crearServicio(prisma);

    await expect(
      service.login({ email: 'admin@sublitex.com', password: 'incorrecta' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('lanza UnauthorizedException si el usuario no existe', async () => {
    const prisma = buildPrismaMock();
    prisma.usuario.findUnique.mockResolvedValue(null);
    const service = await crearServicio(prisma);

    await expect(
      service.login({ email: 'nadie@sublitex.com', password: 'abc' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('lanza UnauthorizedException si el usuario esta inactivo', async () => {
    const prisma = buildPrismaMock();
    prisma.usuario.findUnique.mockResolvedValue({ ...usuarioActivo, activo: false });
    const service = await crearServicio(prisma);

    await expect(
      service.login({ email: 'admin@sublitex.com', password: 'password123' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

describe('register', () => {
  it('crea usuario con password hasheada y no devuelve la password', async () => {
    const prisma = buildPrismaMock();
    prisma.usuario.findUnique.mockResolvedValue(null);
    prisma.usuario.create.mockImplementation(async ({ data }: any) => ({
      id: 'usr_nuevo',
      email: data.email,
      nombre: data.nombre,
      rol: data.rol,
      activo: data.activo,
      creadoEn: new Date(),
    }));
    const service = await crearServicio(prisma);

    const result = await service.register({
      email: 'nuevo@sublitex.com',
      password: 'abc123',
      nombre: 'Nuevo',
      rol: 'VENDEDORA' as any,
    });

    expect(result.email).toBe('nuevo@sublitex.com');
    expect((result as any).password).toBeUndefined();

    const dataPersistida = prisma.usuario.create.mock.calls[0][0].data;
    expect(dataPersistida.password).not.toBe('abc123');
    const esHash = await bcrypt.compare('abc123', dataPersistida.password);
    expect(esHash).toBe(true);
  });

  it('lanza ConflictException si el email ya existe', async () => {
    const prisma = buildPrismaMock();
    prisma.usuario.findUnique.mockResolvedValue(usuarioActivo);
    const service = await crearServicio(prisma);

    await expect(
      service.register({ email: 'admin@sublitex.com', password: 'x', nombre: 'X', rol: 'VENDEDORA' as any }),
    ).rejects.toThrow(ConflictException);
  });
});

describe('findAll', () => {
  it('devuelve todos los usuarios sin filtro', async () => {
    const prisma = buildPrismaMock();
    prisma.usuario.findMany.mockResolvedValue([usuarioActivo]);
    const service = await crearServicio(prisma);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
    expect(prisma.usuario.findMany.mock.calls[0][0].where).toBeUndefined();
  });

  it('filtra por rol cuando se indica', async () => {
    const prisma = buildPrismaMock();
    prisma.usuario.findMany.mockResolvedValue([usuarioActivo]);
    const service = await crearServicio(prisma);

    await service.findAll('ADMINISTRADOR');

    const where = prisma.usuario.findMany.mock.calls[0][0].where;
    expect(where).toEqual({ rol: 'ADMINISTRADOR' });
  });
});

describe('findOne', () => {
  it('lanza NotFoundException si el id no existe', async () => {
    const prisma = buildPrismaMock();
    prisma.usuario.findUnique.mockResolvedValue(null);
    const service = await crearServicio(prisma);

    await expect(service.findOne('id-inexistente')).rejects.toThrow(NotFoundException);
  });
});

describe('changePassword', () => {
  it('lanza NotFoundException si el usuario no existe', async () => {
    const prisma = buildPrismaMock();
    prisma.usuario.findUnique.mockResolvedValue(null);
    const service = await crearServicio(prisma);

    await expect(service.changePassword('id-x', 'actual', 'nueva')).rejects.toThrow(NotFoundException);
  });

  it('lanza UnauthorizedException si la contrasena actual es incorrecta', async () => {
    const prisma = buildPrismaMock();
    prisma.usuario.findUnique.mockResolvedValue(usuarioActivo);
    const service = await crearServicio(prisma);

    await expect(service.changePassword('usr_1', 'incorrecta', 'nueva123')).rejects.toThrow(UnauthorizedException);
  });

  it('actualiza la password hasheada cuando la actual es correcta', async () => {
    const prisma = buildPrismaMock();
    prisma.usuario.findUnique.mockResolvedValue(usuarioActivo);
    prisma.usuario.update.mockResolvedValue({});
    const service = await crearServicio(prisma);

    await service.changePassword('usr_1', 'password123', 'nueva456');

    const dataUpdate = prisma.usuario.update.mock.calls[0][0].data;
    const esHash = await bcrypt.compare('nueva456', dataUpdate.password);
    expect(esHash).toBe(true);
  });
});

describe('remove', () => {
  it('lanza NotFoundException si el id no existe', async () => {
    const prisma = buildPrismaMock();
    prisma.usuario.findUnique.mockResolvedValue(null);
    const service = await crearServicio(prisma);

    await expect(service.remove('id-inexistente')).rejects.toThrow(NotFoundException);
  });
});
