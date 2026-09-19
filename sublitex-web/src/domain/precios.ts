export type TipoPrecio = "VENTA" | "OBSEQUIO" | "MUESTRA";

export interface RecargosPrecio {
  talla: number;
  tela: number;
  cuello: number;
  acabado: number;
}

export interface EntradaPrecio {
  precioBase: number;
  recargos: RecargosPrecio;
  tipoPrecio: TipoPrecio;
}

export const RECARGO_NULO: RecargosPrecio = { talla: 0, tela: 0, cuello: 0, acabado: 0 };

export function redondear2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function recargoTotal(recargos: RecargosPrecio): number {
  return recargos.talla + recargos.tela + recargos.cuello + recargos.acabado;
}

export function esSinCosto(tipo: TipoPrecio): boolean {
  return tipo === "OBSEQUIO" || tipo === "MUESTRA";
}

export function calcCountSinCosto(tipos: TipoPrecio[]): number {
  return tipos.filter((t) => esSinCosto(t)).length;
}

export function calcularPrecioUnitario(entrada: EntradaPrecio): number {
  if (esSinCosto(entrada.tipoPrecio)) {
    return 0;
  }
  return redondear2(entrada.precioBase + recargoTotal(entrada.recargos));
}

export function desglosarRecargos(entrada: EntradaPrecio): RecargosPrecio {
  if (esSinCosto(entrada.tipoPrecio)) {
    return { ...RECARGO_NULO };
  }
  return { ...entrada.recargos };
}