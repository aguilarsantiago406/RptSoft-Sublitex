export type EstadoPedido =
  | "BORRADOR"
  | "EN_CONFIGURACION"
  | "EN_RECOLECCION"
  | "EN_REVISION"
  | "CERRADO"
  | "EN_PRODUCCION"
  | "ENTREGADO"
  | "CANCELADO";

export interface PedidoResumen {
  id: string;
  codigo: string;
  cliente: { id: string; nombre: string };
  estado: EstadoPedido;
  totalPrendas: number;
  fechaPedido: string;
  fechaCompromiso: string | null;
}

export interface GrupoPedido {
  id: string;
  nombre: string;
  tipoProducto?: {
    id: string;
    codigo: string;
    nombre: string;
    componentes: { camisetas: number; shorts: number; medias: number };
  };
  cantidadContratada: number;
  politicaNumeracion: string;
  observaciones?: string | null;
  configuracion: Array<{ atributo: string; valor: string }>;
}

export interface PedidoDetalle {
  id: string;
  codigo: string;
  estado: EstadoPedido;
  fechaPedido: string;
  fechaCompromiso: string | null;
  observaciones?: string | null;
  cliente: {
    id: string;
    nombre: string;
    telefono?: string | null;
    ciudad?: string | null;
  };
  colores: Array<{
    id: string;
    nombre: string;
    codigoHex: string;
    referenciaFisica?: string | null;
  }>;
  grupos: GrupoPedido[];
}
