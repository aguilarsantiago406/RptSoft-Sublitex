import type {
  Genero,
  PrendaItem,
  TextoPrenda,
  TipoPrenda,
  UpdatePrenda,
  ValorEfectivo,
} from "@/types/prendas";

/**
 * Aplica un UpdatePrenda (contrato §5.2) a una prenda de forma pura.
 * Compartido entre el hook cliente (edición optimista en grilla) y la
 * ruta PATCH /api/prendas/:id — un solo lugar para la regla R-C08:
 * editar genera una EXCEPCION; volver al valor del grupo restaura HEREDADO.
 */

export function aplicarUpdate(
  p: PrendaItem,
  update: UpdatePrenda,
  configBase: Map<string, string>
): PrendaItem {
  switch (update.tipo) {
    case "valor": {
      const existente = p.valores.find((v) => v.atributo === update.atributo);
      if (!existente) return p;

      return {
        ...p,
        valores: p.valores.map((v) =>
          v.atributo === update.atributo
            ? resolverOrigen(v, update.valor, configBase.get(update.atributo))
            : v
        ),
      };
    }

    case "color":
      return { ...p, color: update.color };

    case "booleano":
      return { ...p, esArquero: update.valor };

    case "texto":
      return aplicarTexto(p, update.campo, update.valor);
  }
}

function resolverOrigen(
  prev: ValorEfectivo,
  nuevo: string,
  base?: string
): ValorEfectivo {
  if (nuevo === prev.valor) return prev;
  if (base !== undefined && nuevo === base) {
    return { atributo: prev.atributo, valor: nuevo, origen: "HEREDADO" };
  }
  return {
    atributo: prev.atributo,
    valor: nuevo,
    origen: "EXCEPCION",
    motivo: "Editado en grilla",
  };
}

function aplicarTexto(
  p: PrendaItem,
  campo: TextoPrenda,
  valor: string
): PrendaItem {
  switch (campo) {
    case "nombreEnPrenda":
      return { ...p, nombreEnPrenda: valor.toUpperCase() };
    case "nombrePersona":
      return { ...p, nombrePersona: valor };
    case "numero":
      return { ...p, numero: valor };
    case "producto":
      return { ...p, producto: valor };
    case "talla":
      return { ...p, talla: valor };
    case "genero":
      return { ...p, genero: valor as Genero };
    case "tipoPrenda":
      return { ...p, tipoPrenda: valor as TipoPrenda };
  }
}