import type { ReactNode } from "react";
import { getPedido } from "@/features/pedidos/api/pedidos.api";
import { PedidoTopbar } from "@/features/pedidos/components/PedidoTopbar";
import { loadData } from "@/lib/api/loadData";

/* La identidad del pedido es la misma en todas sus secciones, así que se
   resuelve una sola vez acá en servidor y se comparte con cada page. */
export default async function PedidoDetalleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: pedido } = await loadData(() => getPedido(id));

  return (
    <>
      {pedido && <PedidoTopbar pedido={pedido} />}
      {children}
    </>
  );
}
