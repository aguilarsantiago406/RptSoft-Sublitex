import { apiGet } from "@/lib/api/http";
import type {
  TipoProductoCatalogo,
  TallaCatalogo,
  AtributoCatalogo,
  UbicacionPersonalizacionCatalogo,
  TarifaCatalogo,
} from "../types/catalogo";

export async function getTiposProducto(): Promise<TipoProductoCatalogo[]> {
  return apiGet<TipoProductoCatalogo[]>("/api/catalogos/tipos-producto");
}

export async function getTallas(tipoProductoId?: string): Promise<TallaCatalogo[]> {
  const query = tipoProductoId ? `?tipoProductoId=${encodeURIComponent(tipoProductoId)}` : "";
  return apiGet<TallaCatalogo[]>(`/api/catalogos/tallas${query}`);
}

export async function getAtributos(): Promise<AtributoCatalogo[]> {
  return apiGet<AtributoCatalogo[]>("/api/catalogos/atributos");
}

export async function getUbicaciones(): Promise<UbicacionPersonalizacionCatalogo[]> {
  return apiGet<UbicacionPersonalizacionCatalogo[]>("/api/catalogos/ubicaciones");
}

export async function getTarifasVigentes(): Promise<TarifaCatalogo[]> {
  return apiGet<TarifaCatalogo[]>("/api/comercial/tarifas/vigentes");
}
