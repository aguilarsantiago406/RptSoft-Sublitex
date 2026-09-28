import { apiGet, apiPatch } from "@/lib/api/http";
import type {
  BloquePedidoItem,
  VersionesPendientesAcuseResponse,
  AcuseReciboResponse,
} from "../types/bloque";

export async function getBloquesPedido(pedidoId: string): Promise<BloquePedidoItem[]> {
  return apiGet<BloquePedidoItem[]>(`/api/pedidos/${encodeURIComponent(pedidoId)}/bloques`).catch(() => []);
}

export async function getVersionesPendientesAcuse(
  pedidoId: string
): Promise<VersionesPendientesAcuseResponse | null> {
  return apiGet<VersionesPendientesAcuseResponse>(
    `/api/pedidos/${encodeURIComponent(pedidoId)}/bloques/versiones-pendientes-acuse`
  ).catch(() => null);
}

export async function acusarReciboVersion(
  pedidoId: string,
  versionId: string,
  area?: "DISENO" | "PRODUCCION"
): Promise<AcuseReciboResponse> {
  return apiPatch<AcuseReciboResponse>(
    `/api/pedidos/${encodeURIComponent(pedidoId)}/bloques/versiones/${encodeURIComponent(versionId)}/acusar`,
    area ? { area } : {}
  );
}
