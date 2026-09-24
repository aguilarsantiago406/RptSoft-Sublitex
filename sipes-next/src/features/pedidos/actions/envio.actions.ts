"use server";

import { revalidatePath } from "next/cache";
import { apiDelete, apiPatch, apiPost, SipesApiError } from "@/lib/api/http";

export type DatosEnvioForm = {
  nombreCompleto: string;
  dni: string;
  celular: string;
  ciudad: string;
  agencia: string;
  referencia?: string;
  correo?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function opcionalDefinido(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function validarDatosEnvio(data: DatosEnvioForm): string | null {
  const obligatorios = [
    { key: "nombreCompleto" as const, minimo: 2, label: "El nombre completo" },
    { key: "dni" as const, minimo: 7, label: "El DNI" },
    { key: "celular" as const, minimo: 9, label: "El celular" },
    { key: "ciudad" as const, minimo: 2, label: "La ciudad" },
    { key: "agencia" as const, minimo: 2, label: "La agencia" },
  ];

  for (const { key, minimo, label } of obligatorios) {
    const valor = (data[key] ?? "").trim();
    if (!valor) {
      return `${label} es obligatorio.`;
    }
    if (valor.length < minimo) {
      return `${label} debe tener al menos ${minimo} caracteres.`;
    }
  }

  const correo = opcionalDefinido(data.correo);
  if (correo && !EMAIL_REGEX.test(correo)) {
    return "El correo debe tener un formato válido (ej: usuario@dominio.com).";
  }

  return null;
}

function formToBody(data: DatosEnvioForm) {
  return {
    nombreCompleto: data.nombreCompleto.trim(),
    dni: data.dni.trim(),
    celular: data.celular.trim(),
    ciudad: data.ciudad.trim(),
    agencia: data.agencia.trim(),
    referencia: opcionalDefinido(data.referencia),
    correo: opcionalDefinido(data.correo),
  };
}

function envioPath(pedidoId: string) {
  return `/api/comercial/pedidos/${encodeURIComponent(pedidoId)}/envio`;
}

function revalidatePedido(pedidoId: string) {
  revalidatePath(`/pedidos/${pedidoId}`);
  revalidatePath(`/pedidos/${pedidoId}/proforma`);
}

export async function actionRegistrarDatosEnvio(
  pedidoId: string,
  data: DatosEnvioForm
): Promise<{ ok: boolean; error?: string }> {
  const validationError = validarDatosEnvio(data);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  try {
    await apiPost(envioPath(pedidoId), formToBody(data));
    revalidatePedido(pedidoId);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo guardar los datos de envío." };
  }
}

export async function actionActualizarDatosEnvio(
  pedidoId: string,
  data: DatosEnvioForm
): Promise<{ ok: boolean; error?: string }> {
  const validationError = validarDatosEnvio(data);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  try {
    await apiPatch(envioPath(pedidoId), formToBody(data));
    revalidatePedido(pedidoId);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo guardar los datos de envío." };
  }
}

export async function actionEliminarDatosEnvio(
  pedidoId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiDelete(envioPath(pedidoId));
    revalidatePedido(pedidoId);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo eliminar los datos de envío." };
  }
}