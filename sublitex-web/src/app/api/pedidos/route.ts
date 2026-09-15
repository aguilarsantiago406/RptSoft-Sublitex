import { NextResponse } from "next/server";
import {
  crearPedido,
  leerPedidos,
  type NuevoPedidoInput,
} from "@/services/pedidosListaMock";
import { errorValidacion } from "@/app/api/_errores";

/**
 * GET /api/pedidos — contrato §3.1
 * POST /api/pedidos — creación básica de un pedido
 */
export async function GET() {
  return NextResponse.json(leerPedidos());
}

export async function POST(request: Request) {
  let body: Partial<NuevoPedidoInput>;
  try {
    body = (await request.json()) as Partial<NuevoPedidoInput>;
  } catch {
    return errorValidacion("El cuerpo de la petición no es JSON válido");
  }

  const nombre = body.clienteNombre?.trim();
  if (!nombre || nombre.length < 3) {
    return errorValidacion(
      "El nombre del cliente es obligatorio (mínimo 3 caracteres)",
      { campo: "clienteNombre" }
    );
  }

  const pedido = crearPedido({
    clienteNombre: nombre,
    clienteTelefono: body.clienteTelefono,
    ciudad: body.ciudad,
    fechaCompromiso: body.fechaCompromiso ?? null,
    observaciones: body.observaciones,
    estado: body.estado,
  });

  return NextResponse.json(pedido, { status: 201 });
}