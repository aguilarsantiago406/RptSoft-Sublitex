export type TipoBloque = "DISENO" | "LISTA" | "COMERCIAL";
export type EstadoBloque = "ABIERTO" | "CERRADO";

export interface VersionBloqueItem {
  id: string;
  numero: number;
  motivoReapertura?: string | null;
  acusadoDisenoEn?: string | null;
  acusadoProduccionEn?: string | null;
  creadoEn: string;
  creadoPor: {
    id: string;
    nombre: string;
    email: string;
    rol?: string;
  };
}

export interface BloquePedidoItem {
  id: string;
  pedidoId: string;
  tipo: TipoBloque;
  estado: EstadoBloque;
  cerradoEn?: string | null;
  cerradoPorId?: string | null;
  cerradoPor?: {
    id: string;
    nombre: string;
    email: string;
    rol?: string;
  } | null;
  versiones?: VersionBloqueItem[];
}

export interface VersionPendienteAcuseItem {
  id: string;
  bloqueId: string;
  tipoBloque: TipoBloque;
  numero: number;
  motivoReapertura?: string | null;
  acusadoDisenoEn?: string | null;
  acusadoProduccionEn?: string | null;
  pendienteDiseno: boolean;
  pendienteProduccion: boolean;
  creadoEn: string;
  creadoPor: {
    id: string;
    nombre: string;
    email: string;
    rol?: string;
  };
}

export interface VersionesPendientesAcuseResponse {
  pedidoId: string;
  alertaTallerActiva: boolean;
  totalPendientes: number;
  versiones: VersionPendienteAcuseItem[];
}

export interface AcuseReciboResponse {
  mensaje: string;
  yaAcusado: boolean;
  area: "DISENO" | "PRODUCCION";
  version: VersionBloqueItem;
}
