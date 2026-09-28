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
