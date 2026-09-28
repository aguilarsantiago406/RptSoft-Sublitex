"use server";

import { revalidatePath } from "next/cache";
import {
  crearTipoProducto,
  crearValorAtributo,
} from "../api/catalogos.api";
import { SipesApiError } from "@/lib/api/http";

export interface TipoProductoForm {
  codigo: string;
  nombre: string;
  camisetas: number;
  shorts: number;
  medias: number;
}

export interface TelaForm {
  atributoId: string;
  codigo: string;
  etiqueta: string;
}

export async function actionCrearTipoProducto(
  data: TipoProductoForm
): Promise<{ ok: boolean; error?: string }> {
  const codigo = data.codigo.trim().toUpperCase();
  const nombre = data.nombre.trim();

  if (!codigo) {
    return { ok: false, error: "El código de la prenda es obligatorio." };
  }
  if (!nombre) {
    return { ok: false, error: "El nombre descriptivo de la prenda es obligatorio." };
  }

  const camisetas = Math.max(0, Math.floor(Number(data.camisetas) || 0));
  const shorts = Math.max(0, Math.floor(Number(data.shorts) || 0));
  const medias = Math.max(0, Math.floor(Number(data.medias) || 0));

  if (camisetas === 0 && shorts === 0 && medias === 0) {
    return {
      ok: false,
      error: "Debe especificar al menos una pieza física (camiseta, short o medias) según la regla R-K03.",
    };
  }

  try {
    await crearTipoProducto({
      codigo,
      nombre,
      camisetas,
      shorts,
      medias,
    });
    revalidatePath("/catalogos");
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      if (error.status === 404 || error.status === 405) {
        return {
          ok: false,
          error:
            "El endpoint backend para creación dinámica de productos aún no está expuesto en esta versión. (Contactar al equipo de backend para habilitar POST /api/catalogos/tipos-producto).",
        };
      }
      return { ok: false, error: error.message };
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error inesperado al crear el tipo de prenda.",
    };
  }
}

export async function actionCrearTela(
  data: TelaForm
): Promise<{ ok: boolean; error?: string }> {
  const atributoId = data.atributoId.trim();
  const codigo = data.codigo.trim().toUpperCase();
  const etiqueta = data.etiqueta.trim();

  if (!atributoId) {
    return { ok: false, error: "El identificador del atributo de tela es obligatorio." };
  }
  if (!codigo) {
    return { ok: false, error: "El código técnico de la tela es obligatorio." };
  }
  if (!etiqueta) {
    return { ok: false, error: "El nombre comercial de la tela es obligatorio." };
  }

  try {
    await crearValorAtributo(atributoId, {
      atributoId,
      codigo,
      etiqueta,
    });
    revalidatePath("/catalogos");
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      if (error.status === 404 || error.status === 405) {
        return {
          ok: false,
          error:
            "El endpoint backend para creación dinámica de valores de atributos aún no está expuesto en esta versión. (Contactar al equipo de backend para habilitar POST /api/catalogos/atributos/:id/valores).",
        };
      }
      return { ok: false, error: error.message };
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error inesperado al registrar la nueva tela.",
    };
  }
}
