import type { EstadoPedido } from "@/types/pedidos";

export const ESTADO_LABEL: Record<EstadoPedido, string> = {
  BORRADOR: "Borrador",
  EN_CONFIGURACION: "En configuración",
  EN_RECOLECCION: "En recolección",
  EN_REVISION: "En revisión",
  CERRADO: "Cerrado",
  EN_PRODUCCION: "En producción",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const ESTADOS_PEDIDO: EstadoPedido[] = [
  "BORRADOR",
  "EN_CONFIGURACION",
  "EN_RECOLECCION",
  "EN_REVISION",
  "CERRADO",
  "EN_PRODUCCION",
  "ENTREGADO",
  "CANCELADO",
];

export const ESTADO_BADGE: Record<EstadoPedido, { chip: string; dot: string }> = {
  BORRADOR:         { chip: "border border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300", dot: "bg-slate-500 dark:bg-slate-300" },
  EN_CONFIGURACION: { chip: "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/60 dark:text-amber-400", dot: "bg-amber-600 dark:bg-amber-400" },
  EN_RECOLECCION:   { chip: "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/60 dark:text-amber-400", dot: "bg-amber-600 dark:bg-amber-400" },
  EN_REVISION:      { chip: "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/60 dark:text-amber-400", dot: "bg-amber-600 dark:bg-amber-400" },
  CERRADO:          { chip: "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/60 dark:text-emerald-400", dot: "bg-emerald-600 dark:bg-emerald-400" },
  EN_PRODUCCION:    { chip: "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/60 dark:text-emerald-400", dot: "bg-emerald-600 dark:bg-emerald-400" },
  ENTREGADO:        { chip: "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/60 dark:text-emerald-400", dot: "bg-emerald-600 dark:bg-emerald-400" },
  CANCELADO:        { chip: "border border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400", dot: "bg-red-600 dark:bg-red-400" },
};

export function etiquetaEstado(estado: EstadoPedido): string {
  return ESTADO_LABEL[estado];
}