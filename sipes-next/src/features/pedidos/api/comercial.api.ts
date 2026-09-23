import { apiGet } from "@/lib/api/http";

export interface TarifaItem {
  id: string;
  tipo: "PRODUCTO" | "RECARGO_TALLA" | "RECARGO_TELA" | "RECARGO_CUELLO" | "RECARGO_ACABADO" | "ADICIONAL" | "COSTO_INTERNO";
  concepto: string;
  valor: number | string;
  vigenteDesde: string;
  vigenteHasta?: string | null;
  nota?: string | null;
}

export interface DatosEnvioItem {
  id: string;
  pedidoId: string;
  nombreCompleto?: string | null;
  dni?: string | null;
  celular?: string | null;
  ciudad?: string | null;
  agencia?: string | null;
  referencia?: string | null;
  correo?: string | null;
}

export interface ResumenProduccionItem {
  pedidoId: string;
  codigo: string;
  totalPrendas: number;
  grupos: Array<{
    grupoId: string;
    nombre: string;
    tipoProducto: {
      id: string;
      codigo: string;
      nombre: string;
      componentes: {
        camisetas: number;
        shorts: number;
        medias: number;
      };
    };
    cantidadContratada: number;
    prendasRegistradas: number;
    prendasFaltantes: number;
    prendasSobrantes: number;
    estado: "FALTANTES" | "EXCEDENTE" | "COMPLETO";
    piezasContratadas: {
      camisetas: number;
      shorts: number;
      medias: number;
    };
    piezasRegistradas: {
      camisetas: number;
      shorts: number;
      medias: number;
    };
  }>;
  totales: {
    cantidadContratada: number;
    prendasRegistradas: number;
    prendasFaltantes: number;
    prendasSobrantes: number;
    piezasContratadas: {
      camisetas: number;
      shorts: number;
      medias: number;
    };
    piezasRegistradas: {
      camisetas: number;
      shorts: number;
      medias: number;
    };
  };
}

export async function getTarifasVigentes(tipo?: string) {
  const q = tipo ? `?tipo=${encodeURIComponent(tipo)}` : "";
  return apiGet<TarifaItem[]>(`/api/comercial/tarifas/vigentes${q}`).catch(() => []);
}

export async function getDatosEnvio(pedidoId: string) {
  return apiGet<DatosEnvioItem>(`/api/comercial/pedidos/${encodeURIComponent(pedidoId)}/envio`).catch(() => null);
}

export async function getResumenProduccion(pedidoId: string) {
  return apiGet<ResumenProduccionItem>(`/api/pedidos/${encodeURIComponent(pedidoId)}/resumen-produccion`).catch(() => null);
}
