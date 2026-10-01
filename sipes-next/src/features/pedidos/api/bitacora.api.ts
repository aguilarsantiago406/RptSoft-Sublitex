import { apiGet } from "@/lib/api/http";

export interface BitacoraItem {
  id: string;
  pedidoId: string;
  prendaId?: string | null;
  descripcionCambio: string;
  solicitadoPor: string;
  fechaSolicitud: string;
  avisadoATaller: boolean;
  avisadoEn?: string | null;
  avisadoPorId?: string | null;
  prenda?: {
    id: string;
    nombreEnPrenda?: string | null;
    numero?: string | null;
  } | null;
  avisadoPor?: {
    id: string;
    nombre: string;
  } | null;
  creadoEn: string;
}

export async function getBitacoras(pedidoId: string): Promise<BitacoraItem[]> {
  try {
    return await apiGet<BitacoraItem[]>(`/api/pedidos/${encodeURIComponent(pedidoId)}/bitacoras`);
  } catch {
    return [];
  }
}
