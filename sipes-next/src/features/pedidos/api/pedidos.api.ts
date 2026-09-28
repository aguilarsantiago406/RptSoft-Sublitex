import { apiGet, apiPatch, apiPost, apiPut } from "@/lib/api/http";
import type { GrupoPedido, PedidoDetalle, PedidoResumen } from "../types/pedido";
import type { ResumenProduccionItem } from "./comercial.api";

export interface GetPedidosParams {
  estado?: string;
  clienteId?: string;
}

export interface ParticipanteConPrendas {
  id: string;
  grupoId: string;
  nombrePersona: string;
  estado: string;
  enlaceToken: string;
  enlaceRevocado: boolean;
  prendas: Array<{
    id: string;
    participanteId: string;
    grupoId: string;
    tipoProductoId: string;
    tallaId: string | null;
    nombreEnPrenda: string | null;
    numero: string | null;
    genero: "HOMBRE" | "MUJER" | "NINO" | "NINA" | "SIN_ESPECIFICAR";
    tipoPrenda: "VENTA" | "OBSEQUIO" | "MUESTRA";
    colorId: string | null;
    esArquero: boolean;
    excepciones: Array<{ id: string; motivo?: string | null }>;
    personalizaciones: Array<{ id: string; contenido?: string | null }>;
  }>;
}

export interface TallaCatalogoItem {
  id: string;
  tipoProductoId: string;
  codigo: string;
  etiqueta: string;
}

export function getPedidos(params?: GetPedidosParams) {
  const query = new URLSearchParams();
  if (params?.estado) query.set("estado", params.estado);
  if (params?.clienteId) query.set("clienteId", params.clienteId);
  const qs = query.toString();
  return apiGet<PedidoResumen[]>(`/api/pedidos${qs ? `?${qs}` : ""}`);
}

export function getPedido(id: string) {
  return apiGet<PedidoDetalle>(`/api/pedidos/${encodeURIComponent(id)}`);
}

export function getParticipantesGrupo(grupoId: string) {
  return apiGet<ParticipanteConPrendas[]>(`/api/grupos/${encodeURIComponent(grupoId)}/participantes`);
}

export function getTallasCatalogo() {
  return apiGet<TallaCatalogoItem[]>("/api/catalogos/tallas");
}

export interface TipoProductoCatalogoItem {
  id: string;
  codigo: string;
  nombre: string;
  componentes: {
    camisetas: number;
    shorts: number;
    medias: number;
  };
}

export function getTiposProducto() {
  return apiGet<TipoProductoCatalogoItem[]>("/api/tipos-producto");
}

export interface ClienteListItem {
  id: string;
  nombre: string;
  tipo: string;
  ciudad?: string | null;
  telefono?: string | null;
}

export function getClientes(q?: string) {
  const query = q ? `?q=${encodeURIComponent(q)}` : "";
  return apiGet<ClienteListItem[]>(`/api/clientes${query}`);
}

export interface AtributoCatalogoItem {
  id: string;
  codigo: string;
  nombre: string;
  obligatorio: boolean;
  criticoProduccion: boolean;
  orden: number;
  valores: Array<{
    id: string;
    atributoId: string;
    codigo: string;
    etiqueta: string;
    orden: number;
  }>;
}

export function getAtributosCatalogo() {
  return apiGet<AtributoCatalogoItem[]>("/api/catalogos/atributos");
}

export type PoliticaNumeracion = "LIBRE" | "UNICA";

export interface GrupoDetalle extends GrupoPedido {
  pedidoId: string;
  tipoProductoId: string;
  politicaNumeracion: PoliticaNumeracion;
}

export interface UpdateGrupoInput {
  nombre?: string;
  politicaNumeracion?: PoliticaNumeracion;
  tipoProductoId?: string;
  cantidadContratada?: number;
  observaciones?: string;
}

export interface GrupoPoliticaActualizada {
  id: string;
  nombre: string;
  politicaNumeracion: PoliticaNumeracion;
}

export function getGrupo(id: string) {
  return apiGet<GrupoDetalle>(`/api/grupos/${encodeURIComponent(id)}`);
}

export function actualizarGrupo(id: string, data: UpdateGrupoInput) {
  return apiPut<GrupoDetalle>(`/api/grupos/${encodeURIComponent(id)}`, data);
}

export function actualizarPoliticaGrupo(
  id: string,
  politicaNumeracion: PoliticaNumeracion
) {
  return apiPatch<GrupoPoliticaActualizada>(
    `/api/grupos/${encodeURIComponent(id)}/politica`,
    { politicaNumeracion }
  );
}

export function calcularResumenProduccion(pedidoId: string) {
  return apiPost<ResumenProduccionItem>(
    `/api/pedidos/${encodeURIComponent(pedidoId)}/resumen-produccion`
  );
}
