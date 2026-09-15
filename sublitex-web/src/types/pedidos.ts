import type { ColorPedido } from "./prendas";

export type EstadoPedido =
  | "BORRADOR"
  | "EN_CONFIGURACION"
  | "EN_RECOLECCION"
  | "EN_REVISION"
  | "CERRADO"
  | "EN_PRODUCCION"
  | "ENTREGADO"
  | "CANCELADO";

export type EstadoAprobacionDiseno =
  | "PENDIENTE_REVISION"
  | "APROBADO"
  | "POR_CORREGIR";

export interface DisenoPedido {
  estadoAprobacion: EstadoAprobacionDiseno;
  trabajadoPor: string;
  ultimaActualizacion: string;
  instrucciones: string;
}

/** Resumen liviano para la tabla de /pedidos — contrato §3.1 */
export interface PedidoResumen {
  id: string;
  codigo: string;
  cliente: { id: string; nombre: string };
  estado: EstadoPedido;
  totalPrendas: number;
  fechaCompromiso: string | null;
  fechaPedido: string;
}

/** Valor de la configuración general de un grupo: una fila por atributo — R-B03 */
export interface ValorConfiguracion {
  atributo: string;
  valor: string;
}

/** Grupo dentro del detalle del pedido — contrato §3.3 */
export interface GrupoDetalle {
  id: string;
  nombre: string;
  tipoProducto: {
    codigo: string;
    nombre: string;
    componentes: { camisetas: number; shorts: number; medias: number };
  };
  cantidadContratada: number;
  politicaNumeracion: string;
  configuracion: ValorConfiguracion[];
}

/**
 * Desglose de piezas por talla — para el panel de Resumen de Producción (§6).
 * Cada entrada resume cuántas prendas (y sus piezas físicas derivadas del BOM)
 * caen en esa talla dentro del grupo.
 */
export interface DesgloseTalla {
  talla: string;
  prendas: number;
  camisetas: number;
  shorts: number;
  medias: number;
}

/**
 * Resumen de producción — GET /api/pedidos/:id/resumen-produccion.
 * Piezas físicas calculadas desde el BOM de cada prenda (R-K03),
 * nunca escritas a mano.
 */
export interface ResumenProduccion {
  pedidoId: string;
  grupoId: string;
  grupoNombre: string;
  totalPrendas: number;
  camisetas: number;
  shorts: number;
  medias: number;
  porTalla: DesgloseTalla[];
}

/** Objeto que devuelve GET /api/pedidos/:id — contrato §3.3 (sin prendas) */
export interface PedidoDetalle {
  id: string;
  codigo: string;
  cliente: {
    id: string;
    nombre: string;
    telefono?: string;
    ciudad?: string;
  };
  estado: EstadoPedido;
  fechaPedido: string;
  fechaCompromiso: string | null;
  observaciones?: string;
  colores: ColorPedido[]; // a nivel de pedido — R-K05
  diseno: DisenoPedido; // bloque de diseño & mockup §3
  grupos: GrupoDetalle[];
}