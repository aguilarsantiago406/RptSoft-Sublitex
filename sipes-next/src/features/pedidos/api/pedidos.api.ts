import { apiGet } from "@/lib/api/http";
import type { PedidoDetalle, PedidoResumen } from "../types/pedido";

export function getPedidos() {
  return apiGet<PedidoResumen[]>("/api/pedidos");
}

export function getPedido(id: string) {
  return apiGet<PedidoDetalle>(`/api/pedidos/${encodeURIComponent(id)}`);
}
