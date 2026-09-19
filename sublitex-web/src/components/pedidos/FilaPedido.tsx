"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { PedidoListaPresentacion } from "@/types/presentacion";

export function FilaPedido({ pedido }: { pedido: PedidoListaPresentacion }) {
  return (
    <Link
      href={`/pedidos/${pedido.id}`}
      className="grid grid-cols-[minmax(120px,1.2fr)_minmax(180px,2fr)_minmax(150px,1.5fr)_110px_130px] items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
    >
      <span className="font-mono text-sm font-semibold text-zinc-900">{pedido.codigo}</span>
      <span className="text-sm text-zinc-700">{pedido.clienteGrupo}</span>
      <span className="text-sm text-zinc-600">{pedido.tipoPrendaPrincipal}</span>
      <span className="text-sm text-zinc-500">{pedido.fecha}</span>
      <Badge estado={pedido.estado} />
    </Link>
  );
}