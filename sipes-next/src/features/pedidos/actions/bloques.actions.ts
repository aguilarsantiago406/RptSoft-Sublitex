"use server";

import { revalidatePath } from "next/cache";
import { apiPost, SipesApiError } from "@/lib/api/http";
import type { TipoBloque } from "../types/bloque";

export interface BloqueActionResult {
  ok: boolean;
  error?: string;
  data?: unknown;
}

export async function actionCerrarBloque(
  pedidoId: string,
  tipo: TipoBloque
): Promise<BloqueActionResult> {
  try {
    const res = await apiPost(`/api/pedidos/${encodeURIComponent(pedidoId)}/bloques/${tipo}/cerrar`, {});
    revalidatePath(`/pedidos/${pedidoId}`);
    revalidatePath("/pedidos");
    return { ok: true, data: res };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo cerrar el bloque en el servidor." };
  }
}

export async function actionReabrirBloque(
  pedidoId: string,
  tipo: TipoBloque,
  motivoReapertura: string
): Promise<BloqueActionResult> {
  const motivoLimpio = motivoReapertura.trim();
  if (motivoLimpio.length < 5) {
    return { ok: false, error: "El motivo de reapertura debe tener al menos 5 caracteres (R-H13)." };
  }

  try {
    const res = await apiPost(`/api/pedidos/${encodeURIComponent(pedidoId)}/bloques/${tipo}/reabrir`, {
      motivoReapertura: motivoLimpio,
    });
    revalidatePath(`/pedidos/${pedidoId}`);
    revalidatePath("/pedidos");
    return { ok: true, data: res };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo reabrir el bloque en el servidor." };
  }
}

export async function actionAcusarReciboVersion(
  pedidoId: string,
  versionId: string,
  area?: "DISENO" | "PRODUCCION"
): Promise<BloqueActionResult> {
  try {
    const res = await apiPost(
      `/api/pedidos/${encodeURIComponent(pedidoId)}/bloques/versiones/${encodeURIComponent(versionId)}/acusar`,
      area ? { area } : {}
    );
    revalidatePath(`/pedidos/${pedidoId}`);
    revalidatePath("/pedidos");
    return { ok: true, data: res };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo registrar el acuse de recibo." };
  }
}
