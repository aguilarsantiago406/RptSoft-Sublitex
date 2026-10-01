"use server";

import { revalidatePath } from "next/cache";
import { apiDelete, apiPatch, apiPost, SipesApiError } from "@/lib/api/http";

export interface UpdatePrendaParams {
  tallaId?: string;
  tallaShortId?: string | null;
  numero?: string;
  genero?: "HOMBRE" | "MUJER" | "NINO" | "NINA" | "SIN_ESPECIFICAR";
  nombreEnPrenda?: string;
  colorId?: string | null;
  tipoPrenda?: "VENTA" | "OBSEQUIO" | "MUESTRA";
  esArquero?: boolean;
}

export async function actionActualizarPrenda(
  prendaId: string,
  pedidoId: string,
  data: UpdatePrendaParams
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiPatch(`/api/prendas/${encodeURIComponent(prendaId)}`, {
      tallaId: data.tallaId || undefined,
      tallaShortId: data.tallaShortId !== undefined ? (data.tallaShortId || null) : undefined,
      numero: data.numero?.trim() || undefined,
      genero: data.genero || undefined,
      nombreEnPrenda: data.nombreEnPrenda?.trim() || undefined,
      colorId: data.colorId || undefined,
      tipoPrenda: data.tipoPrenda || undefined,
      esArquero: data.esArquero !== undefined ? data.esArquero : undefined,
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

export async function actionEliminarPrenda(
  prendaId: string,
  pedidoId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiDelete(`/api/prendas/${encodeURIComponent(prendaId)}`);

    revalidatePath(`/pedidos/${pedidoId}/prendas`);
    revalidatePath(`/pedidos/${pedidoId}/participantes`);
    revalidatePath(`/pedidos/${pedidoId}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo eliminar la prenda." };
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
    return { ok: false, error: "El motivo de la excepción es obligatorio para el taller." };
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

export interface CreatePrendaParams {
  participanteId: string;
  grupoId: string;
  tipoProductoId: string;
  tipoPrenda?: "VENTA" | "OBSEQUIO" | "MUESTRA";
  esArquero?: boolean;
  colorId?: string;
  nombreEnPrenda?: string;
  numero?: string;
  tallaId?: string;
  genero?: "HOMBRE" | "MUJER" | "NINO" | "NINA" | "SIN_ESPECIFICAR";
}

export async function actionCrearPrenda(
  pedidoId: string,
  data: CreatePrendaParams
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiPost("/api/prendas", {
      participanteId: data.participanteId,
      grupoId: data.grupoId,
      tipoProductoId: data.tipoProductoId,
      tipoPrenda: data.tipoPrenda || "VENTA",
      esArquero: Boolean(data.esArquero),
      colorId: data.colorId || undefined,
      nombreEnPrenda: data.nombreEnPrenda?.trim() || undefined,
      numero: data.numero?.trim() || undefined,
      tallaId: data.tallaId || undefined,
      genero: data.genero || undefined,
    });

    revalidatePath(`/pedidos/${pedidoId}/prendas`);
    revalidatePath(`/pedidos/${pedidoId}/participantes`);
    revalidatePath(`/pedidos/${pedidoId}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo registrar la prenda." };
  }
}
