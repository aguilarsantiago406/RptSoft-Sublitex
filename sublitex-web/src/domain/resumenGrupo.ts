import type { CatalogoCompleto, PrendaItem, ResultadoPiezas } from "@/types/prendas";
import { calcularPiezas } from "./calculoPiezas";
import { validarPrenda } from "./validacionPrenda";

// =============================================================================
// RESUMEN DE ESTADO DEL GRUPO (una pasada, todo derivado — R-I06)
// Consolidación de los indicadores cruzados que las reglas del sprint 1 exigen.
// Nada se escribe a mano: cada campo se calcula desde los datos actuales.
// =============================================================================

/** R-C07: excepciones agrupadas por atributo, con conteo y detalle por valor. */
export interface ExcepcionPorAtributo {
  atributo: string; // código (CORTE)
  nombreAtributo: string; // etiqueta del catálogo (Corte)
  total: number; // prendas con alguna EXCEPCION en el atributo
  porValor: {
    valor: string;
    cantidad: number;
    prendaIds: string[];
  }[];
}

/** R-G05: dorsal repetido. INFO si la política es libre; nunca bloqueante. */
export interface NumeroRepetido {
  numero: string;
  cantidad: number;
  prendaIds: string[];
  severidad: "INFO" | "AVISO"; // INFO => política LIBRE (R-G05)
}

export type EstadoDiscrepancia = "COINCIDE" | "FALTAN" | "SOBRAN";

/** R-B02/R-H03: registrado contra lo contratado comercialmente. */
export interface DiscrepanciaContratado {
  contratado: number;
  registrado: number;
  diferencia: number; // registrado - contratado
  estado: EstadoDiscrepancia;
}

/** R-E03: prenda que no llega a la ficha mínima (nombre en prenda + número + talla). */
export interface PrendaIncompleta {
  prendaId: string;
  referencia: string; // nombreEnPrenda
  faltantes: string[]; // salida de validarPrenda
}

/** R-K03: piezas físicas por producto (BOM del catálogo × cantidad). */
export interface ProduccionPorProducto {
  productoCodigo: string;
  nombre: string;
  cantidad: number;
  piezas: ResultadoPiezas;
}

/** R-F03: personalización con ubicación fuera del catálogo (inválida). */
export interface PersonalizacionInvalida {
  prendaId: string;
  referencia: string;
  ubicacion: string;
  contenido: string;
}

export interface ResumenGrupo {
  excepcionesPorAtributo: ExcepcionPorAtributo[];
  numerosRepetidos: NumeroRepetido[];
  discrepancia: DiscrepanciaContratado;
  prendasIncompletas: PrendaIncompleta[];
  produccionPorProducto: ProduccionPorProducto[];
  personalizacionesInvalidas: PersonalizacionInvalida[];
}

export const RESUMEN_GRUPO_VACIO: ResumenGrupo = {
  excepcionesPorAtributo: [],
  numerosRepetidos: [],
  discrepancia: { contratado: 0, registrado: 0, diferencia: 0, estado: "COINCIDE" },
  prendasIncompletas: [],
  produccionPorProducto: [],
  personalizacionesInvalidas: [],
};

/**
 * Construye el resumen completo del grupo en UNA pasada sobre las prendas.
 * Todas las secciones son derivadas (R-I06): se recalculan en cada render y
 * nunca se guardan como estado que pueda quedar desactualizado.
 *
 * @param politicaNumeracion undefined => "AVISO" (conservador, R-G05)
 */
export function resumirGrupo(
  prendas: PrendaItem[],
  catalogo: CatalogoCompleto,
  cantidadContratada: number,
  politicaNumeracion?: string
): ResumenGrupo {
  // ---- Acumuladores (una pasada) --------------------------------------------
  const excepcionesPorAtributo = new Map<
    string,
    Map<string, { cantidad: number; prendaIds: string[] }>
  >();
  const repetidos = new Map<string, string[]>();
  const piezasPorProducto = new Map<
    string,
    { cantidad: number; nombre: string; productoCodigo: string }
  >();
  const incompletas: PrendaIncompleta[] = [];
  const personalizacionesInvalidas: PersonalizacionInvalida[] = [];

  const ubicacionesValidas = new Set(catalogo.ubicaciones.map((u) => u.codigo));

  for (const prenda of prendas) {
    // R-C07 — excepciones por atributo
    for (const v of prenda.valores) {
      if (v.origen !== "EXCEPCION") continue;
      let porAtributo = excepcionesPorAtributo.get(v.atributo);
      if (!porAtributo) {
        porAtributo = new Map();
        excepcionesPorAtributo.set(v.atributo, porAtributo);
      }
      const porValor = porAtributo.get(v.valor) ?? { cantidad: 0, prendaIds: [] };
      porValor.cantidad += 1;
      porValor.prendaIds.push(prenda.id);
      porAtributo.set(v.valor, porValor);
    }

    // R-G05 — dorsales repetidos (se excluyen vacíos y "S/N": R-K04 los trata aparte)
    const dorsal = prenda.numero.trim();
    if (dorsal !== "" && dorsal !== "S/N") {
      const ids = repetidos.get(dorsal) ?? [];
      ids.push(prenda.id);
      repetidos.set(dorsal, ids);
    }

    // R-K03 — BOM por producto
    const acc = piezasPorProducto.get(prenda.producto) ?? {
      cantidad: 0,
      nombre: prenda.producto,
      productoCodigo: prenda.producto,
    };
    acc.cantidad += 1;
    piezasPorProducto.set(prenda.producto, acc);

    // R-E03 — ficha mínima (usa validarPrenda, data-driven del catálogo)
    const faltantes = validarPrenda(prenda, catalogo);
    if (faltantes.length > 0) {
      incompletas.push({
        prendaId: prenda.id,
        referencia: prenda.nombreEnPrenda,
        faltantes,
      });
    }

    // R-F03 — personalización con ubicación fuera del catálogo cerrado
    for (const p of prenda.personalizaciones) {
      if (!ubicacionesValidas.has(p.ubicacion)) {
        personalizacionesInvalidas.push({
          prendaId: prenda.id,
          referencia: prenda.nombreEnPrenda,
          ubicacion: p.ubicacion,
          contenido: p.contenido,
        });
      }
    }
  }

  // ---- Ordenar y construir el resultado --------------------------------------
  const nombreAtributo = (codigo: string) =>
    catalogo.atributos.find((a) => a.codigo === codigo)?.nombre ?? codigo;

  const excepciones = [...excepcionesPorAtributo.entries()]
    .map(([atributo, porValor]) => ({
      atributo,
      nombreAtributo: nombreAtributo(atributo),
      total: [...porValor.values()].reduce((acc, pv) => acc + pv.cantidad, 0),
      porValor: [...porValor.entries()]
        .map(([valor, pv]) => ({
          valor,
          cantidad: pv.cantidad,
          prendaIds: pv.prendaIds,
        }))
        .sort((a, b) => b.cantidad - a.cantidad),
    }))
    .sort((a, b) => a.nombreAtributo.localeCompare(b.nombreAtributo));

  const numerosRepetidos = [...repetidos.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([numero, ids]) => ({
      numero,
      cantidad: ids.length,
      prendaIds: ids,
      severidad: (politicaNumeracion === "LIBRE" ? "INFO" : "AVISO") as "INFO" | "AVISO",
    }))
    .sort((a, b) => b.cantidad - a.cantidad);

  const produccionPorProducto = [...piezasPorProducto.entries()]
    .map(([productoCodigo, acc]) => {
      const bom = calcularPiezas(productoCodigo, catalogo);
      return {
        productoCodigo,
        nombre: catalogo.productos.find((p) => p.codigo === productoCodigo)?.nombre ?? productoCodigo,
        cantidad: acc.cantidad,
        // R-K03: BOM del catálogo × cantidad de prendas de ese producto
        piezas: {
          camisetas: bom.camisetas * acc.cantidad,
          shorts: bom.shorts * acc.cantidad,
          medias: bom.medias * acc.cantidad,
        },
      };
    })
    .sort((a, b) => b.cantidad - a.cantidad);

  const registrado = prendas.length;
  const diferencia = registrado - cantidadContratada;
  const discrepancia: DiscrepanciaContratado = {
    contratado: cantidadContratada,
    registrado,
    diferencia,
    estado: diferencia === 0 ? "COINCIDE" : diferencia < 0 ? "FALTAN" : "SOBRAN",
  };

  return {
    excepcionesPorAtributo: excepciones,
    numerosRepetidos,
    discrepancia,
    prendasIncompletas: incompletas,
    produccionPorProducto,
    personalizacionesInvalidas,
  };
}