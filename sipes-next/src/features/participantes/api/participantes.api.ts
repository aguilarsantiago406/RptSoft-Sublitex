import { apiGet, apiPost } from "@/lib/api/http";

export interface PersonalizacionParticipante {
  id: string;
  prendaId: string;
  ubicacionId: string;
  contenido: string;
  ubicacion?: { id: string; codigo: string; etiqueta: string };
}

export interface ExcepcionPrendaParticipante {
  id: string;
  prendaId: string;
  atributoId: string;
  valorAtributoId: string;
  motivo?: string | null;
}

export interface PrendaParticipanteDetalle {
  id: string;
  participanteId: string;
  grupoId: string;
  tipoProductoId: string;
  tallaId: string | null;
  nombreEnPrenda: string | null;
  numero: string | null;
  genero: "HOMBRE" | "MUJER" | "NINO" | "NINA" | "SIN_ESPECIFICAR";
  tipoPrenda: "VENTA" | "OBSEQUIO" | "MUESTRA";
  colorId: string | null;
  esArquero: boolean;
  color?: { id: string; nombre: string; codigoHex: string } | null;
  talla?: { id: string; codigo: string; etiqueta: string } | null;
  tipoProducto?: {
    id: string;
    codigo: string;
    nombre: string;
    camisetas: number;
    shorts: number;
    medias: number;
  } | null;
  personalizaciones: PersonalizacionParticipante[];
  excepciones: ExcepcionPrendaParticipante[];
}

export interface ParticipanteDetalle {
  id: string;
  grupoId: string;
  nombrePersona: string;
  estado: "PENDIENTE" | "REGISTRADO" | "CONFIRMADO";
  enlaceToken: string;
  enlaceExpiraEn: string | null;
  enlaceRevocado: boolean;
  registradoEn: string | null;
  confirmadoEn: string | null;
  prendas: PrendaParticipanteDetalle[];
}

export function getParticipanteDetalle(id: string) {
  return apiGet<ParticipanteDetalle>(
    `/api/participantes/${encodeURIComponent(id)}`
  );
}

export function revocarEnlaceParticipante(id: string) {
  return apiPost<ParticipanteDetalle>(
    `/api/participantes/${encodeURIComponent(id)}/revocar-enlace`
  );
}
