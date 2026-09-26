import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);

// Grupos canónicos de roles según reglas de negocio (R-J01, R-H, R-K)
export const ROLES_ADMIN = [RolUsuario.ADMINISTRADOR];

export const ROLES_COORDINACION = [
  RolUsuario.ADMINISTRADOR,
  RolUsuario.COORDINADOR_OPERATIVO,
];

export const ROLES_COMERCIAL = [
  RolUsuario.ADMINISTRADOR,
  RolUsuario.COORDINADOR_OPERATIVO,
  RolUsuario.VENDEDOR,
  RolUsuario.VENDEDORA,
];

export const ROLES_GESTION_LISTA = [
  RolUsuario.ADMINISTRADOR,
  RolUsuario.COORDINADOR_OPERATIVO,
  RolUsuario.COORDINADOR_CLIENTE,
  RolUsuario.VENDEDOR,
  RolUsuario.VENDEDORA,
];

export const ROLES_DISENO = [
  RolUsuario.ADMINISTRADOR,
  RolUsuario.COORDINADOR_OPERATIVO,
  RolUsuario.DISENO,
];

export const ROLES_DISENO_APROBACION = [
  RolUsuario.ADMINISTRADOR,
  RolUsuario.COORDINADOR_OPERATIVO,
  RolUsuario.COORDINADOR_CLIENTE,
  RolUsuario.DISENO,
];

export const ROLES_PRODUCCION = [
  RolUsuario.ADMINISTRADOR,
  RolUsuario.COORDINADOR_OPERATIVO,
  RolUsuario.PRODUCCION,
];

export const ROLES_ACUSE_TALLER = [
  RolUsuario.ADMINISTRADOR,
  RolUsuario.COORDINADOR_OPERATIVO,
  RolUsuario.DISENO,
  RolUsuario.PRODUCCION,
];

export const ROLES_TODOS = Object.values(RolUsuario) as RolUsuario[];
