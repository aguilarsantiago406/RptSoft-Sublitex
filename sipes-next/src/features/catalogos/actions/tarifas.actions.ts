"use server";

import { revalidatePath } from "next/cache";
import {
  actualizarTarifa,
  crearTarifa,
  eliminarTarifa,
  type CreateTarifaInput,
} from "../api/catalogos.api";
import { TIPOS_TARIFA, type TipoTarifa } from "../types/catalogo";

export interface TarifaForm {
  tipo: TipoTarifa;
  concepto: string;
  valor: string;
  vigenteDesde: string;
  vigenteHasta?: string;
  nota?: string;
}

const TIPOS_VALIDOS = new Set<string>(TIPOS_TARIFA.map((t) => t.value));

function validarTarifa(data: TarifaForm): string | null {
  if (!TIPOS_VALIDOS.has(data.tipo)) {
    return "El tipo de tarifa seleccionado no es válido.";
  }

  const concepto = data.concepto.trim();
  if (!concepto) {
    return "El concepto es obligatorio.";
  }

  const valor = Number(data.valor);
  if (!Number.isFinite(valor) || valor <= 0) {
    return "El valor debe ser un número positivo mayor a cero.";
  }

  const desde = new Date(data.vigenteDesde);
  if (Number.isNaN(desde.getTime())) {
    return "La fecha de vigencia inicial es obligatoria y debe ser válida.";
  }

  if (data.vigenteHasta) {
    const hasta = new Date(data.vigenteHasta);
    if (Number.isNaN(hasta.getTime())) {
      return "La fecha de fin de vigencia no es válida.";
    }
    if (hasta <= desde) {
      return "La fecha de fin de vigencia debe ser posterior a la inicial.";
    }
  }

  return null;
}

function formToBody(data: TarifaForm): CreateTarifaInput {
  return {
    tipo: data.tipo,
    concepto: data.concepto.trim(),
    valor: Number(data.valor),
    vigenteDesde: new Date(data.vigenteDesde).toISOString(),
    ...(data.vigenteHasta
      ? { vigenteHasta: new Date(data.vigenteHasta).toISOString() }
      : {}),
    ...(data.nota?.trim() ? { nota: data.nota.trim() } : {}),
  };
}

export async function actionCrearTarifa(
  data: TarifaForm
): Promise<{ ok: boolean; error?: string }> {
  const validationError = validarTarifa(data);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  try {
    await crearTarifa(formToBody(data));
    revalidatePath("/catalogos");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo crear la tarifa.",
    };
  }
}

export async function actionActualizarTarifa(
  id: string,
  data: TarifaForm
): Promise<{ ok: boolean; error?: string }> {
  const validationError = validarTarifa(data);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  try {
    await actualizarTarifa(id, formToBody(data));
    revalidatePath("/catalogos");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la tarifa.",
    };
  }
}

export async function actionEliminarTarifa(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await eliminarTarifa(id);
    revalidatePath("/catalogos");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la tarifa.",
    };
  }
}