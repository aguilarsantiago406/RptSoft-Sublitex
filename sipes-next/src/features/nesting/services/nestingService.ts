import { apiGet, apiPost, SipesApiError } from "@/lib/api/http";
import { getAtributos } from "@/features/catalogos/api/catalogos.api";
import type { ValorAtributoCatalogo } from "@/features/catalogos/types/catalogo";

export interface ParteAsignada {
  id: string;
  nestingId: string;
  pedidoId: string;
  numeroParte: number;
  anchoCm: number;
  largoCm: number;
  esRib: boolean;
}

export interface ArchivoTifItem {
  id: string;
  nestingId: string;
  nombre: string;
  largoM: number;
  ordenEnSerie: number;
  totalSerie: number;
  entregadoEn: string | null;
}

export interface NestingSession {
  id: string;
  codigo: string;
  telaId: string;
  anchoImpresionM: number;
  fecha: string;
  creadoPorId: string;
  tela?: { id: string; etiqueta: string } | null;
  archivos?: ArchivoTifItem[] | null;
  partes?: ParteAsignada[] | null;
  _count?: { partes: number } | null;
}

export interface MetadatosArchivoTif {
  pedido: string;
  tela: string;
  anchoCm: number;
  largoCm: number;
  largoM: number;
  ordenEnSerie: number;
  totalSerie: number;
}

export interface CrearSesionInput {
  codigo: string;
  telaId: string;
}

export interface AsignarParteInput {
  pedidoId: string;
  anchoCm: number;
  largoCm: number;
  esRib?: boolean;
}

export interface DesgloseConsumoPorTela {
  telaId: string;
  telaNombre: string;
  metrosLineales: number;
}

export interface ConsumoResponse {
  pedidoId: string;
  pedidoCodigo?: string;
  partes?: number;
  metrosTela: number;
  metrosRib: number;
  metrosLineales: number;
  anchoMaximoUsadoCm?: number | null;
  desperdicioLateralCm?: number | null;
  porcentajeAprovechamientoAncho?: number | null;
  desglosePorTela?: DesgloseConsumoPorTela[];
  precioPorMetro?: number | null;
  costoImpresion?: number | null;
  nota?: string;
}

export interface ResultadoVinculacionTif {
  binario: { url: string; path: string };
  registro: ArchivoTifItem;
}

const REGEX_NOMBRE_TIF = /^SUBLITEX_([^_]+)_([^_]+)_(\d{1,3})x(\d+)_(\d+)de(\d+)\.tiff?$/i;
const ANCHO_MAXIMO_CM = 180;
const LARGO_MAXIMO_M = 5;

export function metadatosDesdeNombre(nombre: string): MetadatosArchivoTif | null {
  const match = REGEX_NOMBRE_TIF.exec(nombre.trim());
  if (!match) return null;
  const anchoCm = Number(match[3]);
  const largoCm = Number(match[4]);
  const ordenEnSerie = Number(match[5]);
  const totalSerie = Number(match[6]);
  if (anchoCm < 1 || anchoCm > ANCHO_MAXIMO_CM) return null;
  if (largoCm < 1 || largoCm / 100 > LARGO_MAXIMO_M) return null;
  if (ordenEnSerie < 1 || totalSerie < 1 || ordenEnSerie > totalSerie) return null;
  return {
    pedido: match[1],
    tela: match[2],
    anchoCm,
    largoCm,
    largoM: largoCm / 100,
    ordenEnSerie,
    totalSerie,
  };
}

export async function listarSesiones(): Promise<NestingSession[]> {
  return apiGet<NestingSession[]>("/api/nestings");
}

export async function obtenerSesion(sesionId: string): Promise<NestingSession> {
  return apiGet<NestingSession>(`/api/nestings/${encodeURIComponent(sesionId)}`);
}

export async function crearSesion(input: CrearSesionInput): Promise<NestingSession> {
  return apiPost<NestingSession>("/api/nestings", input);
}

export async function asignarParte(
  sesionId: string,
  input: AsignarParteInput,
): Promise<ParteAsignada> {
  return apiPost<ParteAsignada>(
    `/api/nestings/${encodeURIComponent(sesionId)}/partes`,
    input,
  );
}

export async function subirArchivoTif(archivo: File): Promise<{ url: string; path: string }> {
  const formData = new FormData();
  formData.append("archivo", archivo);
  return apiPost<{ url: string; path: string }>(
    `/api/archivos/subir?carpeta=${encodeURIComponent("tifs")}`,
    formData,
  );
}

export async function registrarArchivoTif(
  sesionId: string,
  nombre: string,
  metadatos: MetadatosArchivoTif,
): Promise<ArchivoTifItem> {
  if (metadatos.largoM > LARGO_MAXIMO_M) {
    throw new SipesApiError(`El largo máximo por archivo TIF es de ${LARGO_MAXIMO_M} metros.`, 422);
  }
  if (metadatos.ordenEnSerie > metadatos.totalSerie) {
    throw new SipesApiError("El orden en la serie no puede ser mayor que el total de la serie.", 422);
  }
  return apiPost<ArchivoTifItem>(`/api/nestings/${encodeURIComponent(sesionId)}/archivos`, {
    nombre,
    largoM: metadatos.largoM,
    ordenEnSerie: metadatos.ordenEnSerie,
    totalSerie: metadatos.totalSerie,
  });
}

export async function vincularArchivoTif(
  sesionId: string,
  archivo: File,
): Promise<ResultadoVinculacionTif> {
  const metadatos = metadatosDesdeNombre(archivo.name);
  if (!metadatos) {
    throw new SipesApiError(
      "El nombre del archivo debe seguir el formato: SUBLITEX_{PEDIDO}_{TELA}_{ANCHO}x_{LARGO}_{orden}de{total}.tif (ej: SUBLITEX_PROMO2002_DRYFIT_180x400_1de3.tif).",
      422,
    );
  }
  const binario = await subirArchivoTif(archivo);
  const registro = await registrarArchivoTif(sesionId, archivo.name, metadatos);
  return { binario, registro };
}

export async function obtenerConsumo(pedidoId: string): Promise<ConsumoResponse> {
  return apiGet<ConsumoResponse>(`/api/consumo-tela/pedido/${encodeURIComponent(pedidoId)}`);
}

export async function obtenerTelasCatalogo(): Promise<ValorAtributoCatalogo[]> {
  const atributos = await getAtributos();
  return atributos.find((atributo) => atributo.codigo === "TELA")?.valores ?? [];
}

export const nestingService = {
  listarSesiones,
  obtenerSesion,
  crearSesion,
  asignarParte,
  vincularArchivoTif,
  obtenerConsumo,
  obtenerTelasCatalogo,
};