"use server";

import { revalidatePath } from "next/cache";
import { apiPost, apiPatch, apiDelete, SipesApiError } from "@/lib/api/http";

export type BitacoraForm = {
  descripcionCambio: string;
  solicitadoPor: string;
  prendaId?: string;
  avisadoATaller?: boolean;
};

export async function actionRegistrarBitacora(
  pedidoId: string,
  data: BitacoraForm
): Promise<{ ok: boolean; error?: string }> {
  if (!data.descripcionCambio?.trim()) {
    return { ok: false, error: "La descripción del cambio es obligatoria." };
  }
  if (!data.solicitadoPor?.trim()) {
    return { ok: false, error: "Debe indicar quién solicitó el cambio." };
  }

  try {
    await apiPost(`/api/pedidos/${encodeURIComponent(pedidoId)}/bitacoras`, {
      descripcionCambio: data.descripcionCambio.trim(),
      solicitadoPor: data.solicitadoPor.trim(),
      prendaId: data.prendaId ? data.prendaId.trim() : undefined,
      avisadoATaller: data.avisadoATaller,
    });
    revalidatePath(`/pedidos/${pedidoId}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo registrar la modificación en la bitácora." };
  }
}

export async function actionToggleAvisadoTaller(
  pedidoId: string,
  bitacoraId: string,
  avisado: boolean
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiPatch(`/api/pedidos/${encodeURIComponent(pedidoId)}/bitacoras/${encodeURIComponent(bitacoraId)}/avisar`, {
      avisado,
    });
    revalidatePath(`/pedidos/${pedidoId}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo actualizar el estado de aviso a taller." };
  }
}

export async function actionEliminarBitacora(
  pedidoId: string,
  bitacoraId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiDelete(`/api/pedidos/${encodeURIComponent(pedidoId)}/bitacoras/${encodeURIComponent(bitacoraId)}`);
    revalidatePath(`/pedidos/${pedidoId}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo eliminar el registro de la bitácora." };
  }
}
