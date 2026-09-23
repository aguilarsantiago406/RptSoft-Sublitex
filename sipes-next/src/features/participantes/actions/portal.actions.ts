"use server";

import { revalidatePath } from "next/cache";
import { apiPut, apiPost, SipesApiError } from "@/lib/api/http";

export interface GuardarFichaEnlaceDto {
  prendas: Array<{
    prendaId: string;
    tallaId?: string;
    numero?: string;
    genero?: "HOMBRE" | "MUJER" | "NINO" | "NINA" | "SIN_ESPECIFICAR";
    nombreEnPrenda?: string;
    personalizaciones?: Array<{ ubicacionId: string; contenido: string }>;
  }>;
}

export async function actionGuardarFichaParticipante(
  token: string,
  dto: GuardarFichaEnlaceDto
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiPut(`/api/participantes/enlace/${encodeURIComponent(token)}/ficha`, dto);
    revalidatePath(`/participante/${token}`);
    return { ok: true };
  } catch (err) {
    if (err instanceof SipesApiError) {
      return { ok: false, error: err.message };
    }
    return { ok: false, error: "Error inesperado al guardar tus datos." };
  }
}

export async function actionConfirmarFichaParticipante(
  token: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiPost(`/api/participantes/enlace/${encodeURIComponent(token)}/confirmar`);
    revalidatePath(`/participante/${token}`);
    return { ok: true };
  } catch (err) {
    if (err instanceof SipesApiError) {
      return { ok: false, error: err.message };
    }
    return { ok: false, error: "Error inesperado al confirmar tus datos." };
  }
}
