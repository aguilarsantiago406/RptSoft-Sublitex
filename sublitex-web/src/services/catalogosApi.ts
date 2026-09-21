import { api } from "./apiClient";
import type {
  AtributoCatalogo,
  CatalogoCompleto,
  ComponentesProducto,
  Genero,
  ProductoCatalogo,
  TallaCatalogo,
  TallasPorProducto,
  TipoPrenda,
} from "@/types/prendas";

const GENEROS: Genero[] = [
  "HOMBRE",
  "MUJER",
  "NINO",
  "NINA",
  "SIN_ESPECIFICAR",
];

const TIPOS_PRENDA: TipoPrenda[] = ["VENTA", "OBSEQUIO", "MUESTRA"];

/** Géneros válidos que acepta la UI. Fuente única para validar datos del backend. */
export const GENEROS_VALIDOS: ReadonlySet<string> = new Set(GENEROS);
/** Tipos de prenda válidos que acepta la UI. Fuente única para validar datos del backend. */
export const TIPOS_PRENDA_VALIDOS: ReadonlySet<string> = new Set(TIPOS_PRENDA);

// -----------------------------------------------------------------------------
// Forma cruda que devuelve el backend real (incluye ids que el frontend no expone)
// -----------------------------------------------------------------------------

interface TipoProductoApi {
  id: string;
  codigo: string;
  nombre: string;
  componentes: ComponentesProducto;
  orden?: number;
}

interface TallaApi {
  id: string;
  tipoProductoId: string;
  codigo: string;
  etiqueta: string;
  orden: number;
  tipoProducto: { id: string; codigo: string; nombre: string; orden?: number };
}

interface ValorAtributoApi {
  id: string;
  atributoId: string;
  codigo: string;
  etiqueta: string;
  orden: number;
}

interface AtributoApi {
  id: string;
  codigo: string;
  nombre: string;
  obligatorio: boolean;
  criticoProduccion: boolean;
  orden?: number;
  valores: ValorAtributoApi[];
}

interface UbicacionApi {
  id: string;
  codigo: string;
  etiqueta: string;
  orden: number;
}

// -----------------------------------------------------------------------------
// Índices internos por id
// El backend entrega ids crudos (tallaId, atributoId, valorAtributoId, ubicacionId)
// y el catálogo del frontend no los expone. Estos mapas viven SOLO aquí y se
// consultan desde prendasApi para resolver la grilla.
// -----------------------------------------------------------------------------

export interface IndicesCatalogo {
  productoPorId: Map<string, ProductoCatalogo>;
  /** id de talla → { codigo, etiqueta } (sin tocar el tipo TallaCatalogo) */
  tallaPorId: Map<string, { codigo: string; etiqueta: string }>;
  /** id de atributo → { codigo, nombre } */
  atributoPorId: Map<string, { codigo: string; nombre: string }>;
  /** id de valor de atributo → { codigo, etiqueta } */
  valorAtributoPorId: Map<string, { codigo: string; etiqueta: string }>;
  /** id de ubicación → codigo (contrato de datos; R-F03 valida contra codigo) */
  ubicacionCodigoPorId: Map<string, string>;
  /** id de ubicación → etiqueta legible (ej. "Espalda", solo para la UI) */
  ubicacionEtiquetaPorId: Map<string, string>;
}

let indices: IndicesCatalogo | null = null;

/** Índices del último catálogo cargado (null si todavía no se cargó). */
export function obtenerIndicesCatalogo(): IndicesCatalogo | null {
  return indices;
}

/**
 * Compone el catálogo completo del frontend a partir de 4 endpoints de catálogo
 * (en paralelo). Los géneros y tipos de prenda son listas fijas del dominio
 * porque el backend no los expone como catálogo. Conserva además los índices
 * por id en memoria.
 */
export async function obtenerCatalogoCompleto(): Promise<CatalogoCompleto> {
  const [tipos, tallas, atributos, ubicaciones] = await Promise.all([
    api<TipoProductoApi[]>("/api/catalogos/tipos-producto"),
    api<TallaApi[]>("/api/catalogos/tallas"),
    api<AtributoApi[]>("/api/catalogos/atributos"),
    api<UbicacionApi[]>("/api/catalogos/ubicaciones"),
  ]);

  const productos: ProductoCatalogo[] = tipos.map((t, i) => ({
    codigo: t.codigo,
    nombre: t.nombre,
    orden: t.orden ?? i + 1,
    componentes: t.componentes,
  }));

  const productoPorId = new Map<string, ProductoCatalogo>();
  tipos.forEach((t, i) => {
    productoPorId.set(t.id, productos[i]);
  });

  const tallasAgrupadas = new Map<string, TallaCatalogo[]>();
  const tallaPorId = new Map<string, { codigo: string; etiqueta: string }>();

  for (const t of tallas) {
    const productoCodigo = t.tipoProducto?.codigo ?? "";
    const lista = tallasAgrupadas.get(productoCodigo) ?? [];
    lista.push({ codigo: t.codigo, etiqueta: t.etiqueta, orden: t.orden });
    tallasAgrupadas.set(productoCodigo, lista);
    tallaPorId.set(t.id, { codigo: t.codigo, etiqueta: t.etiqueta });
  }

  const tallasPorProducto: TallasPorProducto[] = [...tallasAgrupadas.entries()].map(
    ([productoCodigo, lista]) => ({ productoCodigo, tallas: lista })
  );

  const atributoPorId = new Map<string, { codigo: string; nombre: string }>();
  const valorAtributoPorId = new Map<
    string,
    { codigo: string; etiqueta: string }
  >();

  const catalogoAtributos: AtributoCatalogo[] = atributos.map((a) => {
    atributoPorId.set(a.id, { codigo: a.codigo, nombre: a.nombre });
    for (const v of a.valores) {
      valorAtributoPorId.set(v.id, { codigo: v.codigo, etiqueta: v.etiqueta });
    }
    return {
      codigo: a.codigo,
      nombre: a.nombre,
      obligatorio: a.obligatorio,
      criticoProduccion: a.criticoProduccion,
      valores: a.valores.map((v) => ({
        codigo: v.codigo,
        etiqueta: v.etiqueta,
        orden: v.orden,
      })),
    };
  });

  const ubicacionCodigoPorId = new Map<string, string>();
  const ubicacionEtiquetaPorId = new Map<string, string>();
  const catalogoUbicaciones = ubicaciones.map((u) => {
    ubicacionCodigoPorId.set(u.id, u.codigo);
    ubicacionEtiquetaPorId.set(u.id, u.etiqueta);
    return { codigo: u.codigo, etiqueta: u.etiqueta, orden: u.orden };
  });

  indices = {
    productoPorId,
    tallaPorId,
    atributoPorId,
    valorAtributoPorId,
    ubicacionCodigoPorId,
    ubicacionEtiquetaPorId,
  };

  return {
    productos,
    tallasPorProducto,
    atributos: catalogoAtributos,
    ubicaciones: catalogoUbicaciones,
    generos: GENEROS,
    tiposPrenda: TIPOS_PRENDA,
  };
}
