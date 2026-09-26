export type EstadoDiseno = "BORRADOR" | "PROPUESTO" | "APROBADO" | "RECHAZADO";

export interface DisenoItem {
  id: string;
  pedidoId: string;
  version: number;
  estado: EstadoDiseno;
  archivoUrl: string | null;
  imagenUrl: string | null;
  aprobadoEn: string | null;
  aprobadoPorId: string | null;
  creadoEn: string;
}

export interface BloqueEstadoItem {
  tipo: "DISENO" | "LISTA" | "COMERCIAL";
  estado: "ABIERTO" | "EN_REVISION" | "CERRADO";
  versionActiva?: number;
  cerradoEn?: string | null;
  cerradoPorId?: string | null;
}
