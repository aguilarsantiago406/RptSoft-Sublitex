import { api, getAuthToken } from "./apiClient";
import type { Tarifa } from "@/types/prendas";

/**
 * Tarifario vigente (GET /api/comercial/tarifas/vigentes) — R-K10.
 * Requiere JWT: si no hay sesión, o el backend responde 401, devuelve [].
 * Sin tarifas los precios base quedan en 0 (nunca se inventan).
 *
 * El error técnico ya lo loguea apiClient (frontera HTTP). Este service solo
 * degrada el tarifario a [] para que la pantalla siga operando.
 */
export async function obtenerTarifasVigentes(): Promise<Tarifa[]> {
  if (!getAuthToken()) return [];

  try {
    const tarifas = await api<Tarifa[]>("/api/comercial/tarifas/vigentes");
    return Array.isArray(tarifas) ? tarifas : [];
  } catch {
    return [];
  }
}
