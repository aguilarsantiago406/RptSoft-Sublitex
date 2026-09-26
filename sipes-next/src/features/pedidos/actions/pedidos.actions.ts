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

const hexRegex = /^#([0-9A-F]{6})$/;

function sanitizarColor(item: AgregarColorParams) {
  const nombre = item.nombre.trim();
  const codigoHex = item.codigoHex.trim().toUpperCase();
  const referenciaFisica = item.referenciaFisica?.trim() || undefined;

  if (!nombre) throw new Error("El nombre del color es obligatorio.");
  if (!hexRegex.test(codigoHex)) {
    throw new Error(`Código HEX '${codigoHex}' inválido. Debe tener formato #RRGGBB.`);
  }
  return { nombre, codigoHex, referenciaFisica };
}

export async function actionAgregarColorPedido(
  pedidoId: string,
  data: AgregarColorParams | AgregarColorParams[]
): Promise<{ ok: boolean; error?: string }> {
  try {
    const payload = Array.isArray(data)
      ? data.map(sanitizarColor)
      : sanitizarColor(data);

    if (Array.isArray(payload) && payload.length === 0) {
      return { ok: false, error: "Debes enviar al menos un color." };
    }

    await apiPost(`/api/pedidos/${encodeURIComponent(pedidoId)}/colores`, payload);
    revalidatePath(`/pedidos/${pedidoId}`);
    return { ok: true };
  } catch (error: any) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: error?.message || "No se pudo registrar el color en el pedido." };
  }
}

export interface UpdatePedidoCabeceraParams {
  fechaCompromiso?: string;
  vendedoraId?: string | null;
  observaciones?: string;
}

export async function actionActualizarCabeceraPedido(
  pedidoId: string,
  data: UpdatePedidoCabeceraParams
): Promise<{ ok: boolean; error?: string }> {
  try {
    let fechaCompromisoISO: string | undefined;
    if (data.fechaCompromiso) {
      const d = new Date(data.fechaCompromiso);
      if (isNaN(d.getTime())) return { ok: false, error: "Fecha de compromiso inválida." };
      fechaCompromisoISO = d.toISOString();
    }

    await apiPatch(`/api/pedidos/${encodeURIComponent(pedidoId)}`, {
      fechaCompromiso: fechaCompromisoISO,
      vendedoraId: data.vendedoraId || undefined,
      observaciones: data.observaciones?.trim() || undefined,
    });

    revalidatePath(`/pedidos/${pedidoId}`);
    revalidatePath("/pedidos");
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) return { ok: false, error: error.message };
    return { ok: false, error: "No se pudo actualizar la información del pedido." };
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


export interface CreatePedidoParams {
  clienteId: string;
  fechaCompromiso: string;
  vendedoraId?: string;
  observaciones?: string;
}

export async function actionCrearPedido(
  data: CreatePedidoParams
): Promise<{ ok: boolean; error?: string; pedido?: { id: string; codigo: string } }> {
  if (!data.clienteId) {
    return { ok: false, error: "Debes seleccionar un cliente." };
  }
  if (!data.fechaCompromiso) {
    return { ok: false, error: "La fecha de entrega / compromiso es obligatoria (Regla R-A09)." };
  }

  const compromisoDate = new Date(data.fechaCompromiso);
  if (isNaN(compromisoDate.getTime())) {
    return { ok: false, error: "Fecha de compromiso inválida." };
  }

  try {
    const res = await apiPost<{ id: string; codigo: string }>("/api/pedidos", {
      clienteId: data.clienteId,
      fechaCompromiso: compromisoDate.toISOString(),
      vendedoraId: data.vendedoraId?.trim() || undefined,
      observaciones: data.observaciones?.trim() || undefined,
    });

    revalidatePath("/pedidos");
    return { ok: true, pedido: res };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo crear el pedido en el backend." };
  }
}

export interface CreateClienteParams {
  nombre: string;
  tipo: "COLEGIO" | "PROMOCION" | "CLUB" | "EMPRESA" | "PARTICULAR";
  ciudad?: string;
  telefono?: string;
}

export async function actionCrearCliente(
  data: CreateClienteParams
): Promise<{ ok: boolean; error?: string; cliente?: { id: string; nombre: string } }> {
  if (!data.nombre.trim()) {
    return { ok: false, error: "El nombre del cliente es obligatorio." };
  }

  try {
    const res = await apiPost<{ id: string; nombre: string }>("/api/clientes", {
      nombre: data.nombre.trim(),
      tipo: data.tipo,
      ciudad: data.ciudad?.trim() || undefined,
      telefono: data.telefono?.trim() || undefined,
    });

    revalidatePath("/pedidos");
    return { ok: true, cliente: res };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo registrar el cliente en el backend." };
  }
}


