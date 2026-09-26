"use server";

import { revalidatePath } from "next/cache";
import { SipesApiError } from "@/lib/api/http";
import {
  crearPersonalizacion,
  eliminarPersonalizacion,
  type CreatePersonalizacionInput,
} from "../api/personalizaciones.api";

export async function actionCrearPersonalizacion(
  pedidoId: string,
  data: CreatePersonalizacionInput
): Promise<{ ok: boolean; error?: string }> {
  if (!data.prendaId) {
    return { ok: false, error: "La prenda es obligatoria." };
  }
  if (!data.ubicacionId) {
    return { ok: false, error: "La ubicación es obligatoria (R-F03)." };
  }

  const contenido = data.contenido.trim();
  if (!contenido) {
    return { ok: false, error: "El contenido del estampado es obligatorio." };
  }

  try {
    await crearPersonalizacion({
      prendaId: data.prendaId,
      ubicacionId: data.ubicacionId,
      contenido,
    });

    revalidatePath(`/pedidos/${pedidoId}/prendas`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo registrar la personalización." };
  }
}

export async function actionEliminarPersonalizacion(
  pedidoId: string,
  personalizacionId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await eliminarPersonalizacion(personalizacionId);

    revalidatePath(`/pedidos/${pedidoId}/prendas`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo eliminar la personalización." };
  }
}
