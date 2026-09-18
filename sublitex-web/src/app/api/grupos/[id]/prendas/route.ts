import { NextResponse } from "next/server";
import { grupoPrendasMock } from "@/services/grupoPrendasMock";
import { noEncontrado } from "@/app/api/_errores";

/**
 * GET /api/grupos/:grupoId/prendas — contrato §5.1
 * La grilla COMPLETA del grupo: prendas con valor efectivo resuelto
 * (excepcion ?? config, R-C03) y el ORIGEN de cada celda (R-C06/R-C08).
 * El detalle del pedido NO incluye prendas: esta es la única vía.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (id !== grupoPrendasMock.grupo.id) {
    return noEncontrado("grupo", id);
  }

  return NextResponse.json(grupoPrendasMock);
}