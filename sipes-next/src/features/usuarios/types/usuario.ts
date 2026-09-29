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

export interface RolConfig {
  rol: RolUsuario;
  label: string;
  descripcion: string;
  permisos: string[];
}

export const ROLES_CONFIG: Record<RolUsuario, RolConfig> = {
  ADMINISTRADOR: {
    rol: "ADMINISTRADOR",
    label: "Administración General",
    descripcion: "Control total de usuarios, catálogos, pedidos y auditoría del sistema.",
    permisos: ["Gestión de usuarios y accesos", "Edición de tarifas y catálogos", "Supervisión total de pedidos", "Exportación de auditoría"],
  },
  COORDINADOR_OPERATIVO: {
    rol: "COORDINADOR_OPERATIVO",
    label: "Coordinación Operativa",
    descripcion: "Gestión de pedidos, reaperturas de bloques y supervisión del flujo textil.",
    permisos: ["Cierre y reapertura de bloques", "Supervisión de pedidos", "Asignación de asesores", "Revisión pre-taller"],
  },
  VENDEDOR: {
    rol: "VENDEDOR",
    label: "Ventas y Comercial",
    descripcion: "Creación de pedidos, contacto con clientes y emisión de proformas.",
    permisos: ["Alta de nuevos pedidos", "Gestión de clientes y contactos", "Emisión de confirmaciones oficiales", "Cierre del bloque comercial"],
  },
  VENDEDORA: {
    rol: "VENDEDORA",
    label: "Ventas y Comercial",
    descripcion: "Creación de pedidos, contacto con clientes y emisión de proformas.",
    permisos: ["Alta de nuevos pedidos", "Gestión de clientes y contactos", "Emisión de confirmaciones oficiales", "Cierre del bloque comercial"],
  },
  COORDINADOR_CLIENTE: {
    rol: "COORDINADOR_CLIENTE",
    label: "Enlace con Cliente",
    descripcion: "Acompañamiento a delegados y revisión de listas de participantes.",
    permisos: ["Verificación de dorsales y tallas", "Compartir enlaces de autoservicio", "Cierre de lista de jugadores"],
  },
  DISENO: {
    rol: "DISENO",
    label: "Diseño Gráfico",
    descripcion: "Subida de propuestas de arte, mockups y aprobación de vectores.",
    permisos: ["Carga de mockups e imágenes", "Propuesta formal de diseños", "Cierre del bloque de diseño", "Acuse de recibo técnico"],
  },
  PRODUCCION: {
    rol: "PRODUCCION",
    label: "Taller de Producción / Corte",
    descripcion: "Control de rollos de tela, asignación de partes y archivos TIF.",
    permisos: ["Sesiones de rollo de tela", "Cálculo de consumo y merma", "Subida de archivos TIF", "Acuse de recibo de taller"],
  },
};

export const ROLES_DISPONIBLES: Array<{ rol: RolUsuario; label: string }> = [
  { rol: "ADMINISTRADOR", label: "Administración General" },
  { rol: "COORDINADOR_OPERATIVO", label: "Coordinación Operativa" },
  { rol: "VENDEDOR", label: "Ventas y Comercial (Vendedor)" },
  { rol: "VENDEDORA", label: "Ventas y Comercial (Vendedora)" },
  { rol: "COORDINADOR_CLIENTE", label: "Enlace con Cliente" },
  { rol: "DISENO", label: "Diseño Gráfico" },
  { rol: "PRODUCCION", label: "Taller de Producción / Corte" },
];
