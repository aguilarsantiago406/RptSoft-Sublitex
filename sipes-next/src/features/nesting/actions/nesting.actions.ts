"use server";

import { revalidatePath } from "next/cache";
import { apiGet, SipesApiError } from "@/lib/api/http";
import {
  asignarParte,
  crearSesion,
  listarSesiones,
  obtenerConsumo,
  obtenerSesion,
  obtenerTelasCatalogo,
  vincularArchivoTif,
  type ArchivoTifItem,
  type ConsumoResponse,
  type NestingSession,
  type ParteAsignada,
  type ResultadoVinculacionTif,
} from "../services/nestingService";
import type { ValorAtributoCatalogo } from "@/features/catalogos/types/catalogo";

export interface PedidoProduccionItem {
  id: string;
  codigo: string;
  clienteNombre: string;
  totalPrendas: number;
  estado: string;
  bloquesListos: boolean;
}

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function run<T>(fn: () => Promise<T>, fallback: string): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    if (error instanceof SipesApiError) return { ok: false, error: error.message };
    if (error instanceof Error) return { ok: false, error: error.message };
    return { ok: false, error: fallback };
  }
}

export async function actionListarSesiones(): Promise<ActionResult<NestingSession[]>> {
  return run(() => listarSesiones(), "No se pudieron cargar las sesiones de nesting.");
}

export async function actionObtenerSesion(id: string): Promise<ActionResult<NestingSession>> {
  return run(() => obtenerSesion(id), "No se pudo obtener el detalle de la sesión.");
}

export async function actionCrearSesion(
  codigo: string,
  telaId: string,
): Promise<ActionResult<NestingSession>> {
  const result = await run(
    () => crearSesion({ codigo, telaId }),
    "No se pudo crear la sesión de nesting.",
  );
  if (result.ok) revalidatePath("/taller");
  return result;
}

export async function actionAsignarParte(
  id: string,
  pedidoId: string,
  anchoCm: number,
  largoCm: number,
  esRib?: boolean,
): Promise<ActionResult<ParteAsignada>> {
  const result = await run(
    () => asignarParte(id, { pedidoId, anchoCm, largoCm, esRib }),
    "No se pudo asignar la parte al rollo.",
  );
  if (result.ok) revalidatePath("/taller");
  return result;
}

export async function actionVincularArchivoTif(
  id: string,
  formData: FormData,
): Promise<ActionResult<ResultadoVinculacionTif>> {
  const archivo = formData.get("archivo");
  if (!(archivo instanceof File)) {
    return { ok: false, error: "El archivo TIF es requerido." };
  }
  const result = await run(
    () => vincularArchivoTif(id, archivo),
    "No se pudo vincular el archivo TIF.",
  );
  if (result.ok) revalidatePath("/taller");
  return result;
}

export async function actionObtenerConsumo(
  pedidoId: string,
): Promise<ActionResult<ConsumoResponse>> {
  return run(() => obtenerConsumo(pedidoId), "No se pudo calcular el consumo.");
}

export async function actionObtenerTelasCatalogo(): Promise<ActionResult<ValorAtributoCatalogo[]>> {
  return run(() => obtenerTelasCatalogo(), "No se pudieron cargar las telas del catálogo.");
}

export async function actionListarPedidosProduccion(): Promise<ActionResult<PedidoProduccionItem[]>> {
  return run(async () => {
    const pedidos = await apiGet<any[]>("/api/pedidos");
    return (pedidos ?? []).map((p: any) => {
      const diseno = p.bloques?.find((b: any) => b.tipo === "DISENO");
      const lista = p.bloques?.find((b: any) => b.tipo === "LISTA");
      const bloquesListos = diseno?.estado === "CERRADO" && lista?.estado === "CERRADO";
      const totalPrendas = (p.grupos ?? []).reduce(
        (acc: number, g: any) => acc + (g.cantidadContratada ?? 0),
        0,
      );
      return {
        id: p.id,
        codigo: p.codigo,
        clienteNombre: p.cliente?.nombre ?? "Sin cliente",
        totalPrendas,
        estado: p.estado,
        bloquesListos,
      };
    });
  }, "No se pudieron cargar los pedidos para producción.");
}