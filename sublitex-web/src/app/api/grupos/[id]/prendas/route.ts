import { NextResponse } from "next/server";
import { grupoPrendasMock } from "@/services/grupoPrendasMock";
import { noEncontrado } from "@/app/api/_errores";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

/**
 * GET /api/grupos/:grupoId/prendas — contrato §5.1
 * La grilla COMPLETA del grupo: prendas con valor efectivo resuelto
 * (excepcion ?? config, R-C03) y el ORIGEN de cada celda (R-C06/R-C08).
 * El detalle del pedido NO incluye prendas: esta es la única vía.
 * Proxy al backend real (NestJS, puerto 3000) con fallback al mock local.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/pedidos/mock/PROMO-2002/grupos/${id}/prendas`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return noEncontrado("grupo", id);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    // Backend no disponible → fallback al mock local
    if (id !== grupoPrendasMock.grupo.id) {
      return noEncontrado("grupo", id);
    }
    return NextResponse.json(grupoPrendasMock);
  }
}