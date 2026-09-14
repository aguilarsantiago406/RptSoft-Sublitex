import { NextResponse } from "next/server";
import { pedidosListaMock } from "@/services/pedidosListaMock";

/**
 * GET /api/pedidos
 * Devuelve el listado de pedidos para la pantalla principal
 */
export async function GET() {
  return NextResponse.json(pedidosListaMock);
}
