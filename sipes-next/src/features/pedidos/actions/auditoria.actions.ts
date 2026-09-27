"use server";

import { getRegistrosCambio, type ListarAuditoriaParams } from "../api/auditoria.api";
import type { RegistroCambioItem } from "../types/auditoria";
import { SipesApiError } from "@/lib/api/http";

export async function actionObtenerAuditoriaPedido(
  pedidoId?: string,
  params?: Omit<ListarAuditoriaParams, "pedidoId">
): Promise<{ ok: boolean; data?: RegistroCambioItem[]; error?: string }> {
  try {
    const data = await getRegistrosCambio({ pedidoId, ...params });
    return { ok: true, data };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo obtener el historial de cambios." };
  }
}
