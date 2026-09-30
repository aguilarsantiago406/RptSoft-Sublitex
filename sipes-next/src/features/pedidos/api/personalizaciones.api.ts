import { apiDelete, apiPost } from "@/lib/api/http";

export interface Personalizacion {
  id: string;
  prendaId: string;
  ubicacionId: string;
  contenido: string;
}

export interface CreatePersonalizacionInput {
  prendaId: string;
  ubicacionId: string;
  contenido: string;
}

export function crearPersonalizacion(data: CreatePersonalizacionInput) {
  return apiPost<Personalizacion>("/api/personalizaciones", data);
}

export function eliminarPersonalizacion(id: string): Promise<void> {
  return apiDelete<void>(`/api/personalizaciones/${encodeURIComponent(id)}`);
}
