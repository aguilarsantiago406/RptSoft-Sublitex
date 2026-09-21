import { api } from "./apiClient";
import {
  GENEROS_VALIDOS,
  TIPOS_PRENDA_VALIDOS,
  obtenerIndicesCatalogo,
} from "./catalogosApi";
import type { ValorConfiguracion } from "@/types/pedidos";
import type {
  CatalogoCompleto,
  ColorPedido,
  Genero,
  GrillaGrupo,
  GrupoGrilla,
  Personalizacion,
  PrendaItem,
  TipoPrenda,
  ValorEfectivo,
} from "@/types/prendas";

// -----------------------------------------------------------------------------
// Forma cruda que devuelve el backend real
// -----------------------------------------------------------------------------

interface PersonalizacionApi {
  id: string;
  ubicacionId: string;
  contenido: string;
}

interface ExcepcionApi {
  id: string;
  atributoId: string;
  valorAtributoId: string;
  motivo: string | null;
}

interface PrendaApi {
  id: string;
  participanteId: string;
  tipoProductoId: string;
  tallaId: string | null;
  nombreEnPrenda: string | null;
  numero: string | null;
  genero: string;
  tipoPrenda: string;
  colorId: string | null;
  esArquero: boolean;
  personalizaciones: PersonalizacionApi[];
  excepciones: ExcepcionApi[];
}

interface ParticipanteApi {
  id: string;
  nombrePersona: string;
  prendas: PrendaApi[];
}

/**
 * Construye la grilla de un grupo desde los participantes reales.
 *
 * El backend entrega ids crudos (tipoProductoId, tallaId, atributoId,
 * valorAtributoId, ubicacionId): aquí se resuelven contra los índices del
 * catálogo cargado por catalogosApi. El mapa de resolución vive acá.
 */
export async function obtenerGrillaGrupo(
  grupoId: string,
  configuracion: ValorConfiguracion[],
  coloresMap: Map<string, ColorPedido>,
  catalogo: CatalogoCompleto,
  grupo: GrupoGrilla
): Promise<GrillaGrupo> {
  const participantes = await api<ParticipanteApi[]>(
    `/api/grupos/${grupoId}/participantes`
  );

  const idx = obtenerIndicesCatalogo();

  const prendas: PrendaItem[] = participantes.flatMap((participante) =>
    (participante.prendas ?? []).map((prenda) =>
      mapPrenda(prenda, participante, configuracion, coloresMap, catalogo, idx)
    )
  );

  return { grupo, prendas };
}

function mapPrenda(
  prenda: PrendaApi,
  participante: ParticipanteApi,
  configuracion: ValorConfiguracion[],
  coloresMap: Map<string, ColorPedido>,
  catalogo: CatalogoCompleto,
  idx: ReturnType<typeof obtenerIndicesCatalogo>
): PrendaItem {
  return {
    id: prenda.id,
    participanteId: participante.id,
    nombrePersona: participante.nombrePersona,
    nombreEnPrenda: prenda.nombreEnPrenda ?? "",
    producto: resolverProducto(prenda.tipoProductoId, catalogo, idx),
    talla: resolverTalla(prenda.tallaId, catalogo, idx),
    numero: prenda.numero ?? "",
    genero: GENEROS_VALIDOS.has(prenda.genero) ? (prenda.genero as Genero) : "SIN_ESPECIFICAR",
    tipoPrenda: TIPOS_PRENDA_VALIDOS.has(prenda.tipoPrenda)
      ? (prenda.tipoPrenda as TipoPrenda)
      : "VENTA",
    esArquero: prenda.esArquero,
    color: coloresMap.get(prenda.colorId ?? "") ?? null,
    valores: resolverValores(prenda, configuracion, idx),
    personalizaciones: resolverPersonalizaciones(prenda, idx),
  };
}

/**
 * Valores efectivos de la prenda: los heredados de la configuración del grupo
 * y, encima, las excepciones propias (R-C03/R-C08). La excepción reemplaza al
 * heredado del mismo atributo si existiera.
 */
export function resolverValores(
  prenda: Pick<PrendaApi, "excepciones">,
  configuracion: ValorConfiguracion[],
  idx: ReturnType<typeof obtenerIndicesCatalogo>
): ValorEfectivo[] {
  const porAtributo = new Map<string, ValorEfectivo>();

  for (const c of configuracion) {
    porAtributo.set(c.atributo, {
      atributo: c.atributo,
      valor: c.valor,
      origen: "HEREDADO",
    });
  }

  for (const exc of prenda.excepciones ?? []) {
    const atributo =
      idx?.atributoPorId.get(exc.atributoId)?.codigo ?? exc.atributoId;
    const valor =
      idx?.valorAtributoPorId.get(exc.valorAtributoId)?.codigo ??
      exc.valorAtributoId;

    porAtributo.set(atributo, {
      atributo,
      valor,
      origen: "EXCEPCION",
      motivo: exc.motivo ?? undefined,
    });
  }

  return [...porAtributo.values()];
}

function resolverPersonalizaciones(
  prenda: Pick<PrendaApi, "personalizaciones">,
  idx: ReturnType<typeof obtenerIndicesCatalogo>
): Personalizacion[] {
  return (prenda.personalizaciones ?? []).map((p) => ({
    // Contrato de datos: el CODIGO de la ubicación (R-F03 valida contra
    // catalogo.ubicaciones[].codigo). La UI resuelve la etiqueta al renderizar.
    ubicacion: idx?.ubicacionCodigoPorId.get(p.ubicacionId) ?? p.ubicacionId,
    contenido: p.contenido,
  }));
}

function resolverProducto(
  tipoProductoId: string,
  catalogo: CatalogoCompleto,
  idx: ReturnType<typeof obtenerIndicesCatalogo>
): string {
  const porId = idx?.productoPorId.get(tipoProductoId);
  if (porId) return porId.codigo;
  // Defensivo: si el backend ya enviara el código en lugar del id.
  return catalogo.productos.find((p) => p.codigo === tipoProductoId)?.codigo ?? "?";
}

function resolverTalla(
  tallaId: string | null,
  catalogo: CatalogoCompleto,
  idx: ReturnType<typeof obtenerIndicesCatalogo>
): string {
  if (!tallaId) return "—";
  const porId = idx?.tallaPorId.get(tallaId);
  if (porId) return porId.etiqueta;
  // Defensivo: si el backend ya enviara el código en lugar del id.
  for (const tp of catalogo.tallasPorProducto) {
    const talla = tp.tallas.find((t) => t.codigo === tallaId);
    if (talla) return talla.etiqueta;
  }
  return "—";
}
