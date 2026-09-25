"use server";

import { revalidatePath } from "next/cache";
import { apiDelete, apiPatch, apiPost, SipesApiError } from "@/lib/api/http";

export interface UpdatePrendaParams {
  tallaId?: string;
  numero?: string;
  genero?: "HOMBRE" | "MUJER" | "NINO" | "NINA" | "SIN_ESPECIFICAR";
  nombreEnPrenda?: string;
  colorId?: string | null;
}

export async function actionActualizarPrenda(
  prendaId: string,
  pedidoId: string,
  data: UpdatePrendaParams
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiPatch(`/api/prendas/${encodeURIComponent(prendaId)}`, {
      tallaId: data.tallaId || undefined,
      numero: data.numero?.trim() || undefined,
      genero: data.genero || undefined,
      nombreEnPrenda: data.nombreEnPrenda?.trim() || undefined,
      colorId: data.colorId || undefined,
    });

    revalidatePath(`/pedidos/${pedidoId}/prendas`);
    revalidatePath(`/pedidos/${pedidoId}/participantes`);
    revalidatePath(`/pedidos/${pedidoId}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo actualizar la prenda." };
  }
}

export interface CreateExcepcionParams {
  prendaId: string;
  atributoId: string;
  valorAtributoId: string;
  motivo: string;
}

export async function actionCrearExcepcionPrenda(
  pedidoId: string,
  data: CreateExcepcionParams
): Promise<{ ok: boolean; error?: string }> {
  const motivo = data.motivo.trim();
  if (!data.atributoId || !data.valorAtributoId) {
    return { ok: false, error: "Debes seleccionar un atributo y un valor para la excepción." };
  }
  if (!motivo) {
    return { ok: false, error: "El motivo de la excepción es obligatorio para el taller (Regla R-C04)." };
  }

  try {
    await apiPost("/api/excepciones-prenda", {
      prendaId: data.prendaId,
      atributoId: data.atributoId,
      valorAtributoId: data.valorAtributoId,
      motivo,
    });

    revalidatePath(`/pedidos/${pedidoId}/prendas`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo registrar la excepción de la prenda." };
  }
}

export async function actionEliminarExcepcionPrenda(
  pedidoId: string,
  excepcionId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiDelete(`/api/excepciones-prenda/${encodeURIComponent(excepcionId)}`);

    revalidatePath(`/pedidos/${pedidoId}/prendas`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo eliminar la excepción." };
  }
}
