import type { CatalogoCompleto, PrendaItem } from "@/types/prendas";
import { valorDe } from "./calculoPrecios";

/**
 * Campos obligatorios para que una prenda esté lista para producción.
 * Devuelve la lista de nombres de campos vacíos o inválidos.
 * Si devuelve [] la prenda está completa.
 *
 * DATA-DRIVEN (R-B06): los atributos obligatorios salen del catálogo
 * (`atributo.obligatorio`), no se hardcodean. Si el catálogo marca un
 * atributo como obligatorio, la validación lo exige automáticamente.
 */
export function validarPrenda(
  prenda: PrendaItem,
  catalogo: CatalogoCompleto
): string[] {
  const faltantes: string[] = [];

  if (!prenda.producto) faltantes.push("producto");
  if (!prenda.talla) faltantes.push("talla");
  if (!prenda.genero) faltantes.push("género");
  if (!prenda.nombreEnPrenda.trim()) faltantes.push("nombre en prenda");
  if (!prenda.numero.trim()) faltantes.push("dorsal");
  if (!prenda.color) faltantes.push("color"); // R-K05

  // Atributos obligatorios del catálogo — R-B06.
  // COLOR se valida arriba sobre `prenda.color` (vive fuera de valores[], R-K05).
  for (const atributo of catalogo.atributos) {
    if (atributo.obligatorio && atributo.codigo !== "COLOR") {
      if (!valorDe(prenda, atributo.codigo)) {
        faltantes.push(atributo.nombre.toLowerCase());
      }
    }
  }

  return faltantes;
}