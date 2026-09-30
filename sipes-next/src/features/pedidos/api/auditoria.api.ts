import { apiGet } from "@/lib/api/http";
import type { RegistroCambioItem } from "../types/auditoria";

export interface ListarAuditoriaParams {
  pedidoId?: string;
  entidad?: string;
  origen?: string;
  limit?: number;
}

export async function getRegistrosCambio(
  params?: ListarAuditoriaParams
): Promise<RegistroCambioItem[]> {
  const query = new URLSearchParams();
  if (params?.pedidoId) query.set("pedidoId", params.pedidoId);
  if (params?.entidad) query.set("entidad", params.entidad);
  if (params?.origen) query.set("origen", params.origen);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiGet<RegistroCambioItem[]>(`/api/registros-cambio${qs ? `?${qs}` : ""}`);
}

export async function getRegistrosCambioPedido(
  pedidoId: string
): Promise<RegistroCambioItem[]> {
  return getRegistrosCambio({ pedidoId });
}
