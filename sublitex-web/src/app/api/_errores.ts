import { NextResponse } from "next/server";

/**
 * Cuerpo de error consistente para TODOS los endpoints del contrato (§1.3).
 * Un solo lugar para construirlo: mismo shape, mismo formato de mensaje.
 */
export interface ApiError {
  codigo: string;
  mensaje: string;
  detalle?: unknown;
}

export function errorApi(
  codigo: string,
  mensaje: string,
  status: number,
  detalle?: unknown
): NextResponse<ApiError> {
  const cuerpo: ApiError = { codigo, mensaje };
  if (detalle !== undefined) cuerpo.detalle = detalle;
  return NextResponse.json(cuerpo, { status });
}

export function noEncontrado(recurso: string, id: string): NextResponse<ApiError> {
  return errorApi("NOT_FOUND", `No se encontró ${recurso}: ${id}`, 404);
}