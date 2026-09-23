"use server";

import { revalidatePath } from "next/cache";
import { apiDelete, apiPatch, apiPost, SipesApiError } from "@/lib/api/http";
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

export interface AgregarColorParams {
  nombre: string;
  codigoHex: string;
  referenciaFisica?: string;
}

export async function actionAgregarColorPedido(
  pedidoId: string,
  data: AgregarColorParams
): Promise<{ ok: boolean; error?: string }> {
  const nombre = data.nombre.trim();
  const codigoHex = data.codigoHex.trim().toUpperCase();
  const referenciaFisica = data.referenciaFisica?.trim() || undefined;

  if (!nombre) {
    return { ok: false, error: "El nombre del color es obligatorio." };
  }

  const hexRegex = /^#([0-9A-F]{6})$/;
  if (!hexRegex.test(codigoHex)) {
    return { ok: false, error: "El código HEX debe tener formato #RRGGBB (ej: #001489)." };
  }

  try {
    await apiPost(`/api/pedidos/${encodeURIComponent(pedidoId)}/colores`, {
      nombre,
      codigoHex,
      referenciaFisica,
    });

    revalidatePath(`/pedidos/${pedidoId}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo registrar el color en el pedido." };
  }
}

export async function actionEliminarColorPedido(
  pedidoId: string,
  colorId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiDelete(`/api/pedidos/${encodeURIComponent(pedidoId)}/colores/${encodeURIComponent(colorId)}`);
    revalidatePath(`/pedidos/${pedidoId}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo eliminar el color." };
  }
}

export interface CreateGrupoParams {
  nombre: string;
  tipoProductoId: string;
  cantidadContratada: number;
  politicaNumeracion: "LIBRE" | "UNICA";
  observaciones?: string;
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
