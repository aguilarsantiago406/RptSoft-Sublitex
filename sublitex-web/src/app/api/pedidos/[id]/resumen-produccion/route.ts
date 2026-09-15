import { NextResponse } from "next/server";
import { obtenerResumenProduccion } from "@/services/resumenProduccionMock";
import { noEncontrado } from "@/app/api/_errores";

/**
 * GET /api/pedidos/:id/resumen-produccion
 * Piezas físicas del pedido CALCULADAS desde el BOM de la grilla (R-K03):
 * total de prendas, camisetas, shorts y medias.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const resumen = obtenerResumenProduccion(id);
  if (!resumen) {
    return noEncontrado("pedido", id);
  }

  return NextResponse.json(resumen);
}