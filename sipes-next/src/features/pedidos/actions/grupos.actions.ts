"use server";

import { revalidatePath } from "next/cache";
import { apiDelete, apiPatch, apiPost, SipesApiError } from "@/lib/api/http";

export interface CreateGrupoParams {
  nombre: string;
  tipoProductoId: string;
  cantidadContratada: number;
  politicaNumeracion: "LIBRE" | "UNICA";
  observaciones?: string;
}

export interface ConfiguracionAtributoInput {
  atributoId: string;
  valorAtributoId: string;
}

export interface UpdateGrupoParams {
  nombre?: string;
  tipoProductoId?: string;
  cantidadContratada?: number;
  politicaNumeracion?: "LIBRE" | "UNICA";
  observaciones?: string;
  configuracion?: ConfiguracionAtributoInput[];
}

export async function actionActualizarGrupo(
  grupoId: string,
  pedidoId: string,
  data: UpdateGrupoParams
): Promise<{ ok: boolean; error?: string }> {
  try {
    const payload: Record<string, unknown> = {};
    if (data.nombre !== undefined) payload.nombre = data.nombre.trim();
    if (data.tipoProductoId !== undefined) payload.tipoProductoId = data.tipoProductoId;
    if (data.cantidadContratada !== undefined) payload.cantidadContratada = Number(data.cantidadContratada);
    if (data.politicaNumeracion !== undefined) payload.politicaNumeracion = data.politicaNumeracion;
    if (data.observaciones !== undefined) payload.observaciones = data.observaciones.trim() || undefined;
    if (data.configuracion !== undefined) payload.configuracion = data.configuracion;

    await apiPatch(`/api/grupos/${encodeURIComponent(grupoId)}`, payload);

    revalidatePath(`/pedidos/${pedidoId}`);
    revalidatePath(`/pedidos/${pedidoId}/prendas`);
    revalidatePath(`/pedidos/${pedidoId}/participantes`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) return { ok: false, error: error.message };
    return { ok: false, error: "No se pudo actualizar el grupo." };
  }
}

export async function actionCrearGrupo(
  pedidoId: string,
  data: CreateGrupoParams
): Promise<{ ok: boolean; error?: string }> {
  const nombre = data.nombre.trim();
  if (!nombre) {
    return { ok: false, error: "El nombre del grupo es obligatorio." };
  }
  if (!data.tipoProductoId) {
    return { ok: false, error: "Debes seleccionar un tipo de producto del catálogo." };
  }
  const cantidad = Number(data.cantidadContratada);
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    return { ok: false, error: "La cantidad contratada debe ser un número entero mayor o igual a 1 (Regla R-B02)." };
  }

  try {
    await apiPost(`/api/pedidos/${encodeURIComponent(pedidoId)}/grupos`, {
      nombre,
      tipoProductoId: data.tipoProductoId,
      cantidadContratada: cantidad,
      politicaNumeracion: data.politicaNumeracion,
      observaciones: data.observaciones?.trim() || undefined,
    });

    revalidatePath(`/pedidos/${pedidoId}`);
    revalidatePath(`/pedidos/${pedidoId}/prendas`);
    revalidatePath(`/pedidos/${pedidoId}/participantes`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo crear el grupo en el backend." };
  }
}

export async function actionEliminarGrupo(
  grupoId: string,
  pedidoId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiDelete(`/api/grupos/${encodeURIComponent(grupoId)}`);

    revalidatePath(`/pedidos/${pedidoId}`);
    revalidatePath(`/pedidos/${pedidoId}/prendas`);
    revalidatePath(`/pedidos/${pedidoId}/participantes`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo eliminar el grupo." };
  }
}
