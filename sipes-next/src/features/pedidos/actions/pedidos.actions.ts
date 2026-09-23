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

export interface CreatePedidoParams {
  clienteId: string;
  fechaCompromiso: string;
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

export interface UpdatePrendaParams {
  tallaId?: string;
  numero?: string;
  genero?: "HOMBRE" | "MUJER" | "NINO" | "NINA" | "SIN_ESPECIFICAR";
  nombreEnPrenda?: string;
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


