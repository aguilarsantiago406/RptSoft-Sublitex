"use server";

import { revalidatePath } from "next/cache";
import { apiPost, apiPatch, apiDelete, SipesApiError } from "@/lib/api/http";
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

export async function actionRegistrarAdelanto(
  pedidoId: string,
  confirmacionId: string,
  adelantoRecibido: number
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiPatch(`/api/comercial/pedidos/${encodeURIComponent(pedidoId)}/confirmaciones/${encodeURIComponent(confirmacionId)}/adelanto`, {
      adelantoRecibido: Number(adelantoRecibido),
    });

    revalidatePath(`/pedidos/${pedidoId}/proforma`);
    revalidatePath(`/pedidos/${pedidoId}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo registrar el adelanto." };
  }
}

export interface RegistrarPagoParams {
  monto: number;
  medio: "YAPE" | "PLIN" | "TRANSFERENCIA" | "EFECTIVO";
  numeroOperacion?: string;
  comprobanteUrl?: string;
  fechaPago?: string;
  notas?: string;
}

export async function actionRegistrarPago(
  pedidoId: string,
  params: RegistrarPagoParams
): Promise<{ ok: boolean; error?: string; data?: unknown }> {
  try {
    if (!params.monto || Number(params.monto) <= 0) {
      return { ok: false, error: "El monto debe ser mayor a 0." };
    }

    const payload = {
      monto: Number(params.monto),
      medio: params.medio,
      numeroOperacion: params.numeroOperacion?.trim() || undefined,
      comprobanteUrl: params.comprobanteUrl?.trim() || undefined,
      fechaPago: params.fechaPago || new Date().toISOString(),
      notas: params.notas?.trim() || undefined,
    };

    const res = await apiPost(`/api/comercial/pedidos/${encodeURIComponent(pedidoId)}/pagos`, payload);

    revalidatePath(`/pedidos/${pedidoId}/proforma`);
    revalidatePath(`/pedidos/${pedidoId}`);
    revalidatePath(`/pedidos/${pedidoId}/estado`);
    revalidatePath("/pedidos");

    return { ok: true, data: res };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo registrar el pago." };
  }
}

export async function actionEliminarPago(
  pedidoId: string,
  pagoId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiDelete(`/api/comercial/pedidos/${encodeURIComponent(pedidoId)}/pagos/${encodeURIComponent(pagoId)}`);

    revalidatePath(`/pedidos/${pedidoId}/proforma`);
    revalidatePath(`/pedidos/${pedidoId}`);
    revalidatePath(`/pedidos/${pedidoId}/estado`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo eliminar el pago." };
  }
}

export async function actionSubirComprobantePago(
  formData: FormData
): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const res = await apiPost<{ url: string; path: string }>(
      "/api/archivos/subir?carpeta=comprobantes",
      formData
    );
    return { ok: true, url: res.url };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo subir el comprobante." };
  }
}
