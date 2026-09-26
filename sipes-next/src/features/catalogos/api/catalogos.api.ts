import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/http";
import type {
  TipoProductoCatalogo,
  TallaCatalogo,
  AtributoCatalogo,
  UbicacionPersonalizacionCatalogo,
  TarifaCatalogo,
  TipoTarifa,
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

export async function getTarifas(tipo?: TipoTarifa): Promise<TarifaCatalogo[]> {
  const query = tipo ? `?tipo=${encodeURIComponent(tipo)}` : "";
  return apiGet<TarifaCatalogo[]>(`/api/comercial/tarifas${query}`);
}

export interface CreateTarifaInput {
  tipo: TipoTarifa;
  concepto: string;
  valor: number;
  vigenteDesde: string;
  vigenteHasta?: string;
  nota?: string;
}

export type UpdateTarifaInput = Partial<CreateTarifaInput>;

export async function crearTarifa(dto: CreateTarifaInput): Promise<TarifaCatalogo> {
  return apiPost<TarifaCatalogo>("/api/comercial/tarifas", dto);
}

export async function actualizarTarifa(
  id: string,
  dto: UpdateTarifaInput
): Promise<TarifaCatalogo> {
  return apiPatch<TarifaCatalogo>(`/api/comercial/tarifas/${encodeURIComponent(id)}`, dto);
}

export async function eliminarTarifa(id: string): Promise<void> {
  return apiDelete<void>(`/api/comercial/tarifas/${encodeURIComponent(id)}`);
}

export async function getTarifa(id: string): Promise<TarifaCatalogo> {
  return apiGet<TarifaCatalogo>(`/api/comercial/tarifas/${encodeURIComponent(id)}`);
}
