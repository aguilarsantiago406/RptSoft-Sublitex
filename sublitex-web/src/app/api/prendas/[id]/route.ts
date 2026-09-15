import { NextResponse } from "next/server";
import { grupoPrendasMock } from "@/services/grupoPrendasMock";
import { pedidoDetalleMock } from "@/services/pedidoDetalleMock";
import { noEncontrado, errorValidacion } from "@/app/api/_errores";
import { aplicarUpdate } from "@/domain/actualizarPrenda";
import type { UpdatePrenda } from "@/types/prendas";

/**
 * PATCH /api/prendas/:id — edición en línea de una celda (contrato §5.2).
 * Acepta el payload discriminado UpdatePrenda y devuelve la prenda actualizada
 * con el origen recalculado (R-C08): si el valor vuelve al del grupo → HEREDADO,
 * si se aparta → EXCEPCION.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const prenda = grupoPrendasMock.prendas.find((p) => p.id === id);
  if (!prenda) {
    return noEncontrado("prenda", id);
  }

  let update: UpdatePrenda;
  try {
    update = (await request.json()) as UpdatePrenda;
  } catch {
    return errorValidacion("El cuerpo de la petición no es JSON válido");
  }

  if (!update || typeof update !== "object" || !("tipo" in update)) {
    return errorValidacion("El payload no es un UpdatePrenda válido", update);
  }

  const configBase = new Map(
    (pedidoDetalleMock.grupos.find((g) => g.id === grupoPrendasMock.grupo.id)
      ?.configuracion ?? []).map((c) => [c.atributo, c.valor])
  );

  const actualizada = aplicarUpdate(prenda, update, configBase);
  return NextResponse.json(actualizada);
}