import { NextResponse } from "next/server";
import { pedidoDetalleMock } from "@/services/pedidoDetalleMock";
import { noEncontrado } from "@/app/api/_errores";

/**
 * GET /api/pedidos/:id — contrato §3.3
 * Encabezado comercial del pedido: cliente, colores y grupos.
 * NO incluye prendas: la grilla se consulta por grupo (§5.1).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (id !== pedidoDetalleMock.id) {
    return noEncontrado("pedido", id);
  }

  return NextResponse.json(pedidoDetalleMock);
}