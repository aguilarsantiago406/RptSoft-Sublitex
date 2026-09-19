export interface PrendaCompleta {
  genero: string | null;
  corte: string | null;
  talla: string | null;
  numero: string | null;
  color: string | null;
}

export const ETIQUETAS_FALTANTES: Record<keyof PrendaCompleta, string> = {
  genero: "género",
  corte: "corte",
  talla: "talla",
  numero: "número",
  color: "color",
};

export function queFalta(prenda: PrendaCompleta): string[] {
  const faltantes: string[] = [];
  for (const clave of Object.keys(ETIQUETAS_FALTANTES) as (keyof PrendaCompleta)[]) {
    if (prenda[clave] == null || prenda[clave] === "") {
      faltantes.push(ETIQUETAS_FALTANTES[clave]);
    }
  }
  return faltantes;
}

export function estaCompleta(prenda: PrendaCompleta): boolean {
  return queFalta(prenda).length === 0;
}