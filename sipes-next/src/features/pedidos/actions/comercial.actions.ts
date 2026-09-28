"use server";

import { revalidatePath } from "next/cache";
import { apiPost, SipesApiError } from "@/lib/api/http";
import type { EmitirConfirmacionParams } from "../api/comercial.api";

export interface EmitirConfirmacionResult {
  ok: boolean;
  error?: string;
  data?: unknown;
}

export async function actionEmitirConfirmacion(
  pedidoId: string,
  params: EmitirConfirmacionParams
): Promise<EmitirConfirmacionResult> {
  try {
    const payload = {
      adelantoRecibido: Number(params.adelantoRecibido ?? 0),
      comprobante: params.comprobante ?? "NINGUNO",
      recargoTallas: params.recargoTallas ? Number(params.recargoTallas) : undefined,
      recargoTelas: params.recargoTelas ? Number(params.recargoTelas) : undefined,
      recargoCuellos: params.recargoCuellos ? Number(params.recargoCuellos) : undefined,
      recargoAcabados: params.recargoAcabados ? Number(params.recargoAcabados) : undefined,
      adicionales: params.adicionales ? Number(params.adicionales) : undefined,
    };

    const res = await apiPost(`/api/comercial/pedidos/${encodeURIComponent(pedidoId)}/confirmacion`, payload);

    revalidatePath(`/pedidos/${pedidoId}/proforma`);
    revalidatePath(`/pedidos/${pedidoId}`);
    revalidatePath("/pedidos");

    return { ok: true, data: res };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo emitir la confirmación comercial." };
  }
}
