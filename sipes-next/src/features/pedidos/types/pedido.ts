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
  vendedora?: { id: string; nombre: string; email: string } | null;
  estado: EstadoPedido;
  totalPrendas: number;
  tiempoDias?: number | null;
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
  vendedora?: { id: string; nombre: string; email: string } | null;
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

export interface PrendaDetalle {
  id: string;
  participanteId: string;
  grupoId: string;
  tipoProductoId: string;
  tallaId: string | null;
  numero: string | null;
  genero: "HOMBRE" | "MUJER" | "NINO" | "NINA" | "SIN_ESPECIFICAR";
  tipoPrenda: "VENTA" | "OBSEQUIO" | "MUESTRA";
  nombreEnPrenda: string | null;
  esArquero: boolean;
  colorId: string | null;
  participante?: {
    id: string;
    nombrePersona: string;
    estado: string;
  } | null;
  grupo?: {
    id: string;
    nombre: string;
    politicaNumeracion: string;
  } | null;
  tipoProducto?: {
    id: string;
    codigo: string;
    nombre: string;
    camisetas: number;
    shorts: number;
    medias: number;
  } | null;
  talla?: {
    id: string;
    codigo: string;
    etiqueta: string;
  } | null;
  color?: {
    id: string;
    nombre: string;
    codigoHex: string;
  } | null;
  excepciones?: Array<{
    id: string;
    motivo?: string | null;
    atributo?: { id: string; nombre: string; codigo: string };
    valor?: { id: string; etiqueta: string; codigo: string };
  }>;
  personalizaciones?: Array<{
    id: string;
    contenido?: string | null;
    ubicacion?: { id: string; etiqueta: string; codigo: string };
  }>;
}
