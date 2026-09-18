import type { CatalogoCompleto, ResultadoPiezas } from "@/types/prendas";

/**
 * Componentes físicos de un producto (BOM). Se lee del catálogo, donde cada
 * producto declara cuántas camisetas, shorts y medias contiene — R-K03.
 * Si el producto no está declarado devuelve ceros — nunca lanza un error.
 */
export function calcularPiezas(
  producto: string,
  catalogo: CatalogoCompleto
): ResultadoPiezas {
  const declarado = catalogo.productos.find((p) => p.codigo === producto);
  return declarado
    ? { ...declarado.componentes }
    : { camisetas: 0, shorts: 0, medias: 0 };
}

/**
 * Suma el BOM de una lista de prendas.
 * Útil para la barra de totales de la tabla.
 */
export function totalPiezas(
  productos: string[],
  catalogo: CatalogoCompleto
): ResultadoPiezas {
  return productos.reduce(
    (acc, producto) => {
      const piezas = calcularPiezas(producto, catalogo);
      return {
        camisetas: acc.camisetas + piezas.camisetas,
        shorts: acc.shorts + piezas.shorts,
        medias: acc.medias + piezas.medias,
      };
    },
    { camisetas: 0, shorts: 0, medias: 0 }
  );
}