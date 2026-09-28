"use server";

import { SipesApiError } from "@/lib/api/http";
import {
  nestingService,
  type ConsumoResponse,
  type EstadoNesting,
  type NestingSession,
} from "../services/nestingService";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function run<T>(fn: () => Promise<T>, fallback: string): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    if (error instanceof SipesApiError) return { ok: false, error: error.message };
    return { ok: false, error: fallback };
  }
}

export async function actionListarSesiones(): Promise<ActionResult<NestingSession[]>> {
  return run(() => nestingService.listarSesiones(), "No se pudieron cargar las sesiones de nesting.");
}

export async function actionCrearSesion(
  nombre: string,
  anchoTelaMetros: number,
): Promise<ActionResult<NestingSession>> {
  return run(() => nestingService.crearSesion({ nombre, anchoTelaMetros }), "No se pudo crear la sesión.");
}

export async function actionActualizarEstado(
  id: string,
  estado: EstadoNesting,
): Promise<ActionResult<NestingSession>> {
  return run(() => nestingService.actualizarEstado(id, estado), "No se pudo actualizar el estado.");
}

export async function actionAsignarParte(
  id: string,
  pedidoId: string,
  parteId: string,
): Promise<ActionResult<NestingSession>> {
  return run(() => nestingService.asignarParte(id, { pedidoId, parteId }), "No se pudo asignar la parte.");
}

export async function actionRemoverParte(
  id: string,
  parteId: string,
): Promise<ActionResult<NestingSession | null>> {
  return run(() => nestingService.removerParte(id, parteId), "No se pudo remover la parte.");
}

export async function actionVincularArchivoTif(
  id: string,
  formData: FormData,
): Promise<ActionResult<NestingSession>> {
  return run(() => nestingService.vincularArchivoTif(id, formData), "No se pudo vincular el archivo TIF.");
}

export async function actionObtenerConsumo(pedidoId: string): Promise<ActionResult<ConsumoResponse>> {
  return run(() => nestingService.obtenerConsumo(pedidoId), "No se pudo calcular el consumo.");
}