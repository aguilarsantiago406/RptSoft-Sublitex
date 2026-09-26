import { apiGet, apiPost } from "@/lib/api/http";
import type { DisenoItem, BloqueEstadoItem } from "../types/diseno";

export async function getDisenosPedido(pedidoId: string): Promise<DisenoItem[]> {
  return apiGet<DisenoItem[]>(`/api/pedidos/${encodeURIComponent(pedidoId)}/disenos`);
}

export async function getBloquesPedido(pedidoId: string): Promise<BloqueEstadoItem[]> {
  return apiGet<BloqueEstadoItem[]>(`/api/pedidos/${encodeURIComponent(pedidoId)}/bloques`);
}

export async function subirArchivoApi(
  formData: FormData,
  carpeta = "mockups"
): Promise<{ url: string; path: string }> {
  return apiPost<{ url: string; path: string }>(
    `/api/archivos/subir?carpeta=${encodeURIComponent(carpeta)}`,
    formData
  );
}
