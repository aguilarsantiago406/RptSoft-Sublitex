import { apiGet } from "@/lib/api/http";

export interface PrendaPublica {
  id: string;
  participanteId: string;
  grupoId: string;
  tipoProductoId: string;
  tallaId: string | null;
  nombreEnPrenda: string | null;
  numero: string | null;
  genero: "HOMBRE" | "MUJER" | "NINO" | "NINA" | "SIN_ESPECIFICAR";
  tipoPrenda: string;
  colorId: string | null;
  esArquero: boolean;
  personalizaciones: Array<{ id: string; ubicacionId: string; contenido: string }>;
  excepciones: Array<{ id: string; motivo?: string | null }>;
}

export interface ParticipantePublicoDetalle {
  id: string;
  grupoId: string;
  nombrePersona: string;
  estado: "PENDIENTE" | "REGISTRADO" | "CONFIRMADO";
  enlaceToken: string;
  enlaceRevocado: boolean;
  enlaceExpiraEn: string | null;
  grupo: {
    id: string;
    pedidoId: string;
    nombre: string;
    politicaNumeracion: string;
  };
  prendas: PrendaPublica[];
}

export function getFichaParticipantePublica(token: string) {
  return apiGet<ParticipantePublicoDetalle>(`/api/participantes/enlace/${encodeURIComponent(token)}`);
}
