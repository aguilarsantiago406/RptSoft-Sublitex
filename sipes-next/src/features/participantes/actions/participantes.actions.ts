"use server";

import { revalidatePath } from "next/cache";
import { apiPost, SipesApiError } from "@/lib/api/http";

export interface CrearParticipanteResult {
  ok: boolean;
  error?: string;
  participante?: {
    id: string;
    nombrePersona: string;
    enlaceToken: string;
    estado: string;
  };
}

export async function actionCrearParticipante(
  grupoId: string,
  nombrePersona: string,
  pedidoId: string
): Promise<CrearParticipanteResult> {
  if (!grupoId || !nombrePersona.trim()) {
    return { ok: false, error: "El nombre y el grupo son obligatorios." };
  }

  try {
    const res = await apiPost<{
      id: string;
      nombrePersona: string;
      enlaceToken: string;
      estado: string;
    }>(`/api/grupos/${encodeURIComponent(grupoId)}/participantes`, {
      nombrePersona: nombrePersona.trim(),
    });

    revalidatePath(`/pedidos/${pedidoId}/participantes`);
    revalidatePath(`/pedidos/${pedidoId}/prendas`);
    return { ok: true, participante: res };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo registrar el participante en el backend." };
  }
}

export async function actionRegenerarEnlace(
  participanteId: string,
  pedidoId: string
): Promise<{ ok: boolean; error?: string; enlaceToken?: string }> {
  try {
    const res = await apiPost<{ id: string; enlaceToken: string }>(
      `/api/participantes/${encodeURIComponent(participanteId)}/regenerar-enlace`
    );

    revalidatePath(`/pedidos/${pedidoId}/participantes`);
    return { ok: true, enlaceToken: res.enlaceToken };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo regenerar el enlace." };
  }
}

export async function actionConfirmarManual(
  participanteId: string,
  pedidoId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiPost<{ id: string; estado: string }>(
      `/api/participantes/${encodeURIComponent(participanteId)}/confirmar`
    );

    revalidatePath(`/pedidos/${pedidoId}/participantes`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo confirmar el participante." };
  }
}
