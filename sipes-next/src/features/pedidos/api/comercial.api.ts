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
  codigoRecojo?: string | null;
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

export type TipoComprobante = "BOLETA" | "FACTURA" | "NOTA_VENTA" | "NINGUNO";

export interface ConfirmacionItem {
  id: string;
  pedidoId: string;
  version: number;
  totalSinIgv: number;
  recargoTallas?: number;
  recargoTelas?: number;
  recargoCuellos?: number;
  recargoAcabados?: number;
  adicionales?: number;
  adelantoSugerido: number;
  adelantoRecibido: number;
  saldo: number;
  comprobante: TipoComprobante | string;
  igvCalculado?: number | null;
  pdfUrl: string;
  emitidaPorId?: string | null;
  emitidaPor?: {
    id: string;
    nombre: string;
    email: string;
  } | null;
  creadoEn: string;
}

export interface EmitirConfirmacionParams {
  adelantoRecibido?: number;
  comprobante?: TipoComprobante;
  recargoTallas?: number;
  recargoTelas?: number;
  recargoCuellos?: number;
  recargoAcabados?: number;
  adicionales?: number;
}

export async function getConfirmaciones(pedidoId: string): Promise<ConfirmacionItem[]> {
  return apiGet<ConfirmacionItem[]>(`/api/comercial/pedidos/${encodeURIComponent(pedidoId)}/confirmaciones`).catch(() => []);
}

export interface PagoItem {
  id: string;
  pedidoId: string;
  monto: number;
  medio: "YAPE" | "PLIN" | "TRANSFERENCIA" | "EFECTIVO";
  numeroOperacion?: string | null;
  comprobanteUrl?: string | null;
  fechaPago: string;
  registradoPor?: {
    id: string;
    nombre: string;
    email?: string;
  } | null;
  notas?: string | null;
  creadoEn: string;
}

export interface ResumenPagos {
  pagos: PagoItem[];
  totalPedido: number;
  totalPagado: number;
  saldoPendiente: number;
}

export async function getPagos(pedidoId: string): Promise<ResumenPagos> {
  return apiGet<ResumenPagos>(`/api/comercial/pedidos/${encodeURIComponent(pedidoId)}/pagos`).catch(() => ({
    pagos: [],
    totalPedido: 0,
    totalPagado: 0,
    saldoPendiente: 0,
  }));
}


