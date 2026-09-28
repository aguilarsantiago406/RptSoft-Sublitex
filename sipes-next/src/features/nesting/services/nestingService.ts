// "use server";

// import { revalidatePath } from "next/cache";
// import { apiGet, apiPost, SipesApiError } from "@/lib/api/http";
// import { getAtributos } from "@/features/catalogos/api/catalogos.api";
// import type { ValorAtributoCatalogo } from "@/features/catalogos/types/catalogo";

// /* ----------------------------------------------------------------------------
//  * Servicio HTTP · Nesting y Taller de Producción (Corte e Impresión)
//  * ----------------------------------------------------------------------------
//  * Adaptado al contrato real del backend NestJS del repositorio
//  * (feature-frontend/Backend/src/modules/4-taller-produccion/nesting):
//  *
//  *   GET    /api/nestings                    -> listarSesiones()
//  *   GET    /api/nestings/:id                -> obtenerSesion()
//  *   POST   /api/nestings                    -> crearSesion()  { codigo, telaId }
//  *   POST   /api/nestings/:id/partes         -> asignarParte() { pedidoId, anchoCm, largoCm, esRib? }
//  *   POST   /api/nestings/:id/archivos       -> registrarArchivoTif()  (R-K13, JSON)
//  *   POST   /api/archivos/subir?carpeta=tifs -> subirArchivoTif()      (binario, FormData)
//  *   GET    /api/consumo-tela/pedido/:id     -> obtenerConsumo()       (R-K15)
//  *
//  * El archivo lleva "use server" (como las actions del proyecto) porque el
//  * cliente HTTP (src/lib/api/http.ts) lee el token JWT desde next/headers y
//  * por lo tanto solo puede ejecutarse en el servidor. Así el componente cliente
//  * invoca estas funciones como Server Actions y la página las usa en la precarga.
//  * -------------------------------------------------------------------------- */

// /* ------------------------------ Tipos del dominio -------------------------- */

// /** Estados legibles para el operario; se derivan del avance real de la sesión. */
// export type EstadoNesting = "BORRADOR" | "EN_PROCESO" | "COMPLETADO" | "CANCELADO";

// /** Una parte real ya colocada, cargada a un pedido dentro del nesting (R-K11). */
// export interface ParteAsignada {
//   id: string;
//   nestingId: string;
//   pedidoId: string;
//   numeroParte: number;
//   anchoCm: number;
//   largoCm: number;
//   esRib: boolean;
// }

// /** Archivo TIF exportado y vinculado a una sesión (R-K13). */
// export interface ArchivoTifItem {
//   id: string;
//   nestingId: string;
//   nombre: string;
//   largoM: number;
//   ordenEnSerie: number;
//   totalSerie: number;
//   entregadoEn: string | null;
// }

// /** Serialización de la entidad Nesting tal como la devuelve el backend. */
// export interface NestingSession {
//   id: string;
//   codigo: string;
//   telaId: string;
//   anchoImpresionM: number;
//   fecha: string;
//   creadoPorId: string;
//   tela?: { id: string; etiqueta: string } | null;
//   archivos?: ArchivoTifItem[] | null;
//   partes?: ParteAsignada[] | null;
//   _count?: { partes: number } | null;
// }

// /** Metadatos del nombre R-K13:
//  *  SUBLITEX_{PEDIDO}_{TELA}_{ANCHO}x_{LARGO}_{orden}de{total}.tif            */
// export interface MetadatosArchivoTif {
//   pedido: string;
//   tela: string;
//   anchoCm: number;
//   largoCm: number;
//   largoM: number;
//   ordenEnSerie: number;
//   totalSerie: number;
// }

// export interface CrearSesionInput {
//   codigo: string;
//   telaId: string;
// }

// export interface AsignarParteInput {
//   pedidoId: string;
//   anchoCm: number;
//   largoCm: number;
//   esRib?: boolean;
// }

// export interface DesgloseConsumoPorTela {
//   telaId: string;
//   telaNombre: string;
//   metrosLineales: number;
// }

// /** Respuesta de GET /api/consumo-tela/pedido/:pedidoId (R-K12, R-K14, R-K15). */
// export interface ConsumoResponse {
//   pedidoId: string;
//   pedidoCodigo: string;
//   partes: number;
//   metrosTela: number;
//   metrosRib: number;
//   metrosLineales: number;
//   anchoMaximoUsadoCm: number | null;
//   desperdicioLateralCm: number | null;
//   porcentajeAprovechamientoAncho: number | null;
//   desglosePorTela: DesgloseConsumoPorTela[];
//   precioPorMetro: number | null;
//   costoImpresion: number | null;
//   nota?: string;
// }

// export interface ResultadoVinculacionTif {
//   binario: { url: string; path: string };
//   registro: ArchivoTifItem;
// }

// /* ------------------------------- Validación R-K13 -------------------------- */

// // Formato oficial: SUBLITEX_PROMO2002_DRYFIT_180x400_1de3.tif
// const REGEX_NOMBRE_TIF = /^SUBLITEX_([^_]+)_([^_]+)_(\d{1,3})x(\d+)_(\d+)de(\d+)\.tiff?$/i;
// const ANCHO_MAXIMO_CM = 180; // R-K12 · ancho de impresión fijo 1.80 m
// const LARGO_MAXIMO_M = 5; // R-K13 · largo máximo por archivo TIF

// function metadatosDesdeNombre(nombre: string): MetadatosArchivoTif | null {
//   const match = REGEX_NOMBRE_TIF.exec(nombre.trim());
//   if (!match) return null;
//   const anchoCm = Number(match[3]);
//   const largoCm = Number(match[4]);
//   const ordenEnSerie = Number(match[5]);
//   const totalSerie = Number(match[6]);
//   if (anchoCm < 1 || anchoCm > ANCHO_MAXIMO_CM) return null;
//   if (largoCm < 1 || largoCm / 100 > LARGO_MAXIMO_M) return null;
//   if (ordenEnSerie < 1 || totalSerie < 1 || ordenEnSerie > totalSerie) return null;
//   return {
//     pedido: match[1],
//     tela: match[2],
//     anchoCm,
//     largoCm,
//     largoM: largoCm / 100,
//     ordenEnSerie,
//     totalSerie,
//   };
// }

// /* --------------------------------- Funciones ------------------------------- */

// /** Lista todas las sesiones de nesting (GET /api/nestings). */
// export async function listarSesiones(): Promise<NestingSession[]> {
//   return apiGet<NestingSession[]>("/api/nestings");
// }

// /** Detalle de una sesión con sus partes y archivos TIF (GET /api/nestings/:id). */
// export async function obtenerSesion(sesionId: string): Promise<NestingSession> {
//   return apiGet<NestingSession>(`/api/nestings/${encodeURIComponent(sesionId)}`);
// }

// /** Crea una sesión de nesting indicando código y tela (POST /api/nestings). */
// export async function crearSesion(input: CrearSesionInput): Promise<NestingSession> {
//   const sesion = await apiPost<NestingSession>("/api/nestings", input);
//   revalidatePath("/taller");
//   return sesion;
// }


// /** Agrega una parte real (ancho y largo en cm) asignada a un pedido (R-K11, R-H04). */
// export async function asignarParte(
//   sesionId: string,
//   input: AsignarParteInput
// ): Promise<ParteAsignada> {
//   const parte = await apiPost<ParteAsignada>(
//     `/api/nestings/${encodeURIComponent(sesionId)}/partes`,
//     input
//   );
//   revalidatePath("/taller");
//   return parte;
// }

// /** Sube el binario .tif a Supabase Storage, carpeta tifs (POST /api/archivos/subir).
//  *  apiPost detecta FormData y deja que el navegador fije el boundary multipart. */
// export async function subirArchivoTif(archivo: File): Promise<{ url: string; path: string }> {
//   const formData = new FormData();
//   formData.append("archivo", archivo);
//   return apiPost<{ url: string; path: string }>(
//     `/api/archivos/subir?carpeta=${encodeURIComponent("tifs")}`,
//     formData
//   );
// }

// /** Registra los metadatos de la serie TIF contra la sesión (POST /api/nestings/:id/archivos). */
// export async function registrarArchivoTif(
//   sesionId: string,
//   nombre: string,
//   metadatos: MetadatosArchivoTif
// ): Promise<ArchivoTifItem> {
//   if (metadatos.largoM > LARGO_MAXIMO_M) {
//     throw new SipesApiError(
//       `El largo máximo por archivo TIF es de ${LARGO_MAXIMO_M} metros (R-K13).`,
//       422
//     );
//   }
//   if (metadatos.ordenEnSerie > metadatos.totalSerie) {
//     throw new SipesApiError(
//       "El orden en la serie no puede ser mayor que el total de la serie (R-K13).",
//       422
//     );
//   }
//   return apiPost<ArchivoTifItem>(`/api/nestings/${encodeURIComponent(sesionId)}/archivos`, {
//     nombre,
//     largoM: metadatos.largoM,
//     ordenEnSerie: metadatos.ordenEnSerie,
//     totalSerie: metadatos.totalSerie,
//   });
// }

// /** Vincula un archivo .tif a la sesión: valida R-K13, sube el binario y registra la serie. */
// export async function vincularArchivoTif(
//   sesionId: string,
//   archivo: File
// ): Promise<ResultadoVinculacionTif> {
//   const metadatos = metadatosDesdeNombre(archivo.name);
//   if (!metadatos) {
//     throw new SipesApiError(
//       "El nombre del archivo debe seguir el formato R-K13: " +
//         "SUBLITEX_{PEDIDO}_{TELA}_{ANCHO}x_{LARGO}_{orden}de{total}.tif " +
//         "(ej: SUBLITEX_PROMO2002_DRYFIT_180x400_1de3.tif).",
//       422
//     );
//   }
//   const binario = await subirArchivoTif(archivo);
//   const registro = await registrarArchivoTif(sesionId, archivo.name, metadatos);
//   return { binario, registro };
// }

// /** Consumo de tela de un pedido: suma de SUS partes (R-K15) y costo por tarifa (R-K14). */
// export async function obtenerConsumo(pedidoId: string): Promise<ConsumoResponse> {
//   return apiGet<ConsumoResponse>(`/api/consumo-tela/pedido/${encodeURIComponent(pedidoId)}`);
// }

// /** Valores del atributo TELA del catálogo para poblar el selector de telas. */
// export async function obtenerTelasCatalogo(): Promise<ValorAtributoCatalogo[]> {
//   const atributos = await getAtributos();
//   return atributos.find((atributo) => atributo.codigo === "TELA")?.valores ?? [];
// }

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/http";

export type EstadoNesting = "BORRADOR" | "EN_PROCESO" | "COMPLETADO" | "CANCELADO";

export interface ParteAsignada {
  id: string;
  pedidoId: string;
  parteId: string;
  descripcion?: string | null;
}

export interface NestingSession {
  id: string;
  nombre: string;
  anchoTelaMetros: number;
  estado: EstadoNesting;
  partes: ParteAsignada[];
  archivoTifUrl?: string | null;
  creadoEn?: string;
}

export interface ConsumoResponse {
  pedidoId: string;
  consumoRealMetros: number;
  mermaPorcentaje: number;
  metrosDesperdiciados: number;
}

const BASE = "/api/nesting";
const enc = encodeURIComponent;

/**
 * Capa HTTP del módulo de nesting. Usa el cliente de `@/lib/api/http`, que lee
 * la cookie de sesión en el servidor: solo debe invocarse desde Server Actions
 * o Server Components (ver `../actions/nesting.actions.ts`).
 */
export const nestingService = {
  listarSesiones(): Promise<NestingSession[]> {
    return apiGet<NestingSession[]>(BASE);
  },

  crearSesion(datos: { nombre: string; anchoTelaMetros: number }): Promise<NestingSession> {
    return apiPost<NestingSession>(BASE, datos);
  },

  actualizarEstado(id: string, estado: EstadoNesting): Promise<NestingSession> {
    return apiPatch<NestingSession>(`${BASE}/${enc(id)}/estado`, { estado });
  },

  asignarParte(id: string, datos: { pedidoId: string; parteId: string }): Promise<NestingSession> {
    return apiPost<NestingSession>(`${BASE}/${enc(id)}/parte`, datos);
  },

  removerParte(id: string, parteId: string): Promise<NestingSession | null> {
    return apiDelete<NestingSession | null>(`${BASE}/${enc(id)}/parte/${enc(parteId)}`);
  },

  /**
   * R-K13: archivo TIF de impresión (máx. 5 m). Se envía como multipart;
   * `apiPost` detecta FormData y deja que fetch fije el Content-Type con su
   * boundary (forzar 'multipart/form-data' a mano rompería la carga).
   */
  vincularArchivoTif(id: string, formData: FormData): Promise<NestingSession> {
    return apiPost<NestingSession>(`${BASE}/${enc(id)}/archivo`, formData);
  },

  /** R-K15: consumo real de tela y merma de un pedido. */
  obtenerConsumo(pedidoId: string): Promise<ConsumoResponse> {
    return apiGet<ConsumoResponse>(`${BASE}/consumo/${enc(pedidoId)}`);
  },
};