import type {
  CatalogoCompleto,
  PrendaItem,
  Tarifa,
  TotalesPedido,
} from "@/types/prendas";
import { calcularPrecio } from "./calculoPrecios";
import { totalPiezas } from "./calculoPiezas";

export const TOTALES_VACIOS: TotalesPedido = {
  totalBase: 0,
  totalRecTalla: 0,
  totalRecTela: 0,
  totalRecCuello: 0,
  totalRecAcabado: 0,
  importeTotal: 0,
  camisetas: 0,
  shorts: 0,
  medias: 0,
};

/**
 * Totales de la grilla en UNA sola pasada sobre las prendas (evita recalcular
 * el precio por columna) — R-E07/R-E08: nada se cuenta a mano.
 */
export function calcularTotales(
  prendas: PrendaItem[],
  tarifas: Tarifa[],
  catalogo: CatalogoCompleto
): TotalesPedido {
  let totalBase = 0;
  let totalRecTalla = 0;
  let totalRecTela = 0;
  let totalRecCuello = 0;
  let totalRecAcabado = 0;
  let importeTotal = 0;

  for (const prenda of prendas) {
    const precio = calcularPrecio(prenda, tarifas);
    totalBase += precio.precioBase;
    totalRecTalla += precio.recTalla;
    totalRecTela += precio.recTela;
    totalRecCuello += precio.recCuello;
    totalRecAcabado += precio.recAcabado;
    importeTotal += precio.precioUnitario;
  }

  const piezas = totalPiezas(
    prendas.map((p) => p.producto),
    catalogo
  );

  return {
    totalBase,
    totalRecTalla,
    totalRecTela,
    totalRecCuello,
    totalRecAcabado,
    importeTotal,
    ...piezas,
  };
}