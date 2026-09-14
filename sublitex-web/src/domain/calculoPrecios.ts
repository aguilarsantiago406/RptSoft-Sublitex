import type {
  PrendaItem,
  ResultadoPrecio,
  Tarifa,
  ValorEfectivo,
} from "@/types/prendas";

/**
 * Resuelve el valor efectivo de un atributo dentro de la grilla.
 * El backend ya lo entrega resuelto (R-C03); acá solo se busca en la lista.
 */
export function valorEfectivo(
  prenda: Pick<PrendaItem, "valores">,
  atributo: string
): ValorEfectivo | undefined {
  return prenda.valores.find((v) => v.atributo === atributo);
}

/** Valor efectivo de un atributo como string (o null si falta). */
export function valorDe(
  prenda: Pick<PrendaItem, "valores">,
  atributo: string
): string | null {
  return valorEfectivo(prenda, atributo)?.valor ?? null;
}

/**
 * Busca la tarifa vigente de {tipo, concepto} — R-K10.
 * Nunca un precio escrito a mano. Devuelve 0 si no existe.
 */
export function tarifaActiva(
  tarifas: Tarifa[],
  tipo: Tarifa["tipo"],
  concepto: string
): number {
  const tarifa = tarifas.find(
    (t) =>
      t.tipo === tipo &&
      t.concepto === concepto &&
      t.activo &&
      t.vigenteHasta === null
  );
  return tarifa?.valor ?? 0;
}

/**
 * Precio unitario de una prenda a partir de las tarifas vigentes.
 * Base del producto + recargo por talla, tela, cuello y acabado — R-K10.
 * Si el tipo es OBSEQUIO o MUESTRA el precio unitario es 0 — R-K02.
 */
export function calcularPrecio(
  prenda: Pick<PrendaItem, "producto" | "talla" | "tipoPrenda" | "valores">,
  tarifas: Tarifa[]
): ResultadoPrecio {
  const precioBase = tarifaActiva(tarifas, "PRODUCTO", prenda.producto);

  const recTalla = tarifaActiva(tarifas, "RECARGO_TALLA", prenda.talla);
  const recTela = tarifaActiva(
    tarifas,
    "RECARGO_TELA",
    valorDe(prenda, "TELA") ?? ""
  );
  const recCuello = tarifaActiva(
    tarifas,
    "RECARGO_CUELLO",
    valorDe(prenda, "CUELLO") ?? ""
  );
  const recAcabado = tarifaActiva(
    tarifas,
    "RECARGO_ACABADO",
    valorDe(prenda, "ACABADO") ?? ""
  );

  const subtotal = precioBase + recTalla + recTela + recCuello + recAcabado;

  const precioUnitario = prenda.tipoPrenda === "VENTA" ? subtotal : 0;

  return {
    precioBase,
    recTalla,
    recTela,
    recCuello,
    recAcabado,
    precioUnitario,
  };
}