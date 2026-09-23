"use server";

import { revalidatePath } from "next/cache";
import { apiPatch, SipesApiError } from "@/lib/api/http";
import type { EstadoPedido } from "../types/pedido";

export interface ActualizarEstadoResult {
  ok: boolean;
  error?: string;
}

export async function actionActualizarEstadoPedido(
  pedidoId: string,
  nuevoEstado: EstadoPedido,
  motivo?: string
): Promise<ActualizarEstadoResult> {
  try {
    await apiPatch(`/api/pedidos/${encodeURIComponent(pedidoId)}/estado`, {
      estado: nuevoEstado,
      motivo: motivo?.trim() || undefined,
    });

    revalidatePath(`/pedidos/${pedidoId}`);
    revalidatePath("/pedidos");
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo actualizar el estado del pedido." };
  }
}
