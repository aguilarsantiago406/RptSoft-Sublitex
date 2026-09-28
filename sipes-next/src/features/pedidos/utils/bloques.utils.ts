import type { BloquePedidoItem, TipoBloque } from "../types/bloque";

export interface EvaluacionBloquesReal {
  diseno: {
    encontrado: boolean;
    cerrado: boolean;
    bloque?: BloquePedidoItem;
  };
  lista: {
    encontrado: boolean;
    cerrado: boolean;
    bloque?: BloquePedidoItem;
  };
  comercial: {
    encontrado: boolean;
    cerrado: boolean;
    bloque?: BloquePedidoItem;
  };
  listoParaProduccion: boolean;
  bloquesPendientes: TipoBloque[];
}

export function evaluarBloquesReales(bloques: BloquePedidoItem[]): EvaluacionBloquesReal {
  const bDiseno = bloques.find((b) => b.tipo === "DISENO");
  const bLista = bloques.find((b) => b.tipo === "LISTA");
  const bComercial = bloques.find((b) => b.tipo === "COMERCIAL");

  const disenoCerrado = bDiseno?.estado === "CERRADO";
  const listaCerrada = bLista?.estado === "CERRADO";
  const comercialCerrado = bComercial?.estado === "CERRADO";

  const bloquesPendientes: TipoBloque[] = [];
  if (!disenoCerrado) bloquesPendientes.push("DISENO");
  if (!listaCerrada) bloquesPendientes.push("LISTA");
  if (!comercialCerrado) bloquesPendientes.push("COMERCIAL");

  const listoParaProduccion = disenoCerrado && listaCerrada && comercialCerrado;

  return {
    diseno: {
      encontrado: Boolean(bDiseno),
      cerrado: disenoCerrado,
      bloque: bDiseno,
    },
    lista: {
      encontrado: Boolean(bLista),
      cerrado: listaCerrada,
      bloque: bLista,
    },
    comercial: {
      encontrado: Boolean(bComercial),
      cerrado: comercialCerrado,
      bloque: bComercial,
    },
    listoParaProduccion,
    bloquesPendientes,
  };
}
