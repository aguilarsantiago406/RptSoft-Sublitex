import { apiGet } from "@/lib/api/http";
import type { PedidoDetalle, PedidoResumen } from "../types/pedido";

export interface GetPedidosParams {
  estado?: string;
  clienteId?: string;
}

export function getPedidos(params?: GetPedidosParams) {
  const query = new URLSearchParams();
  if (params?.estado) query.set("estado", params.estado);
  if (params?.clienteId) query.set("clienteId", params.clienteId);
  const qs = query.toString();
  return apiGet<PedidoResumen[]>(`/api/pedidos${qs ? `?${qs}` : ""}`);
}

export function getPedido(id: string) {
  return apiGet<PedidoDetalle>(`/api/pedidos/${encodeURIComponent(id)}`);
}
