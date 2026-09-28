import { apiGet } from "@/lib/api/http";
import type { BloquePedidoItem } from "../types/bloque";

export async function getBloquesPedido(pedidoId: string): Promise<BloquePedidoItem[]> {
  return apiGet<BloquePedidoItem[]>(`/api/pedidos/${encodeURIComponent(pedidoId)}/bloques`).catch(() => []);
}
