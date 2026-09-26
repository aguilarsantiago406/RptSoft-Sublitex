"use server";

import { revalidatePath } from "next/cache";
import { apiGet, apiPost, SipesApiError } from "@/lib/api/http";
import { revocarEnlaceParticipante } from "../api/participantes.api";

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
  pedidoId: string,
  tipoProductoId?: string
): Promise<CrearParticipanteResult> {
  const nombreTrimmed = nombrePersona.trim();
  if (!grupoId || !nombreTrimmed) {
    return { ok: false, error: "El nombre y el grupo son obligatorios." };
  }

  try {
    const res = await apiPost<{
      id: string;
      nombrePersona: string;
      enlaceToken: string;
      estado: string;
    }>(`/api/grupos/${encodeURIComponent(grupoId)}/participantes`, {
      nombrePersona: nombreTrimmed,
    });

    // Crear la prenda física base para este participante
    if (tipoProductoId) {
      try {
        let colorId: string | undefined;
        try {
          const ped = await apiGet<{ colores?: Array<{ id: string }> }>(
            `/api/pedidos/${encodeURIComponent(pedidoId)}`
          );
          if (ped.colores && ped.colores.length > 0) {
            colorId = ped.colores[0].id;
          }
        } catch {
          // Si no se pudo obtener el color, se crea la prenda sin color
        }

        await apiPost("/api/prendas", {
          participanteId: res.id,
          grupoId,
          tipoProductoId,
          colorId,
          nombreEnPrenda: nombreTrimmed,
        });
      } catch (err) {
        console.warn("No se pudo crear la prenda base para el participante:", err);
      }
    }

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

export async function actionRevocarEnlace(
  participanteId: string,
  pedidoId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await revocarEnlaceParticipante(participanteId);

    revalidatePath(`/pedidos/${pedidoId}/participantes`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo revocar el enlace del participante." };
  }
}
