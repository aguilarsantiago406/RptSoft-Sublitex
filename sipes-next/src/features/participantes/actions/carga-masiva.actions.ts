"use server";

import { revalidatePath } from "next/cache";
import { apiPost, SipesApiError } from "@/lib/api/http";

export interface FilaCargaMasiva {
  nombre: string;
  apodo?: string;
  talla?: string;
  tallaShort?: string;
  numero?: string;
  genero?: string;
  tipoPrenda?: string;
  esArquero?: boolean;
}

export interface CargaMasivaResult {
  ok: boolean;
  creados?: number;
  errores?: { fila: number; error: string }[];
  error?: string;
}

export async function actionCargaMasiva(
  grupoId: string,
  pedidoId: string,
  filas: FilaCargaMasiva[]
): Promise<CargaMasivaResult> {
  if (!filas.length) return { ok: false, error: "No hay filas para procesar." };

  try {
    const res = await apiPost<{ creados: number; errores: { fila: number; error: string }[] }>(
      `/api/grupos/${encodeURIComponent(grupoId)}/prendas/carga-masiva`,
      { filas }
    );

    revalidatePath(`/pedidos/${pedidoId}/participantes`);
    revalidatePath(`/pedidos/${pedidoId}/prendas`);
    revalidatePath(`/pedidos/${pedidoId}`);

    return { ok: true, creados: res.creados, errores: res.errores };
  } catch (error) {
    if (error instanceof SipesApiError) return { ok: false, error: error.message };
    return { ok: false, error: "No se pudo completar la carga masiva." };
  }
}
