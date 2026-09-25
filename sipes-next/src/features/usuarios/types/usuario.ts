export type RolUsuario =
  | "ADMINISTRADOR"
  | "COORDINADOR_OPERATIVO"
  | "VENDEDOR"
  | "VENDEDORA"
  | "COORDINADOR_CLIENTE"
  | "DISENO"
  | "PRODUCCION";

export interface UsuarioItem {
  id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
  activo: boolean;
  creadoEn: string;
}

export interface CreateUsuarioInput {
  email: string;
  password: string;
  nombre: string;
  rol: RolUsuario;
  activo?: boolean;
}

export interface UpdateUsuarioInput {
  nombre?: string;
  rol?: RolUsuario;
  activo?: boolean;
}

export const ROLES_DISPONIBLES: Array<{ rol: RolUsuario; label: string }> = [
  { rol: "ADMINISTRADOR", label: "Administrador General" },
  { rol: "COORDINADOR_OPERATIVO", label: "Coordinador Operativo" },
  { rol: "VENDEDOR", label: "Vendedor Comercial" },
  { rol: "VENDEDORA", label: "Vendedora Comercial" },
  { rol: "COORDINADOR_CLIENTE", label: "Coordinador de Cliente" },
  { rol: "DISENO", label: "Área de Diseño y Trazado" },
  { rol: "PRODUCCION", label: "Taller de Producción / Corte" },
];
