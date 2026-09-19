import type {
  CatalogosDto,
  FichaMinimaDto,
  PedidoDetalleDto,
  PedidoListaDto,
  PrendaDto,
  ResumenProduccionDto,
  TipoPrendaDto,
} from "@/services/contrato";

const ES_TIPO_PRENDA: TipoPrendaDto[] = ["VENTA", "OBSEQUIO", "MUESTRA"];
const ES_ESTADO_PEDIDO = ["Borrador", "En Revisión", "Confirmado", "En Producción"];
const ES_ESTADO_PARTICIPANTE = ["PENDIENTE", "REGISTRADO", "CONFIRMADO"];

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function esTexto(valor: unknown): valor is string {
  return typeof valor === "string";
}

function esNumero(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isFinite(valor);
}

function esBooleano(valor: unknown): valor is boolean {
  return typeof valor === "boolean";
}

function esArray(valor: unknown): valor is unknown[] {
  return Array.isArray(valor);
}

function esUnoDe(valor: unknown, opciones: readonly string[]): boolean {
  return esTexto(valor) && opciones.includes(valor);
}

export function esPrendaDto(valor: unknown): valor is PrendaDto {
  if (!esObjeto(valor)) return false;
  if (!esTexto(valor.id) || !esTexto(valor.participanteId) || !esTexto(valor.grupoId)) return false;
  if (!esTexto(valor.tipoProductoId)) return false;
  if (valor.tallaId !== null && !esTexto(valor.tallaId)) return false;
  if (valor.numero !== null && !esTexto(valor.numero)) return false;
  if (valor.genero !== null && !esTexto(valor.genero)) return false;
  if (!esUnoDe(valor.tipoPrenda, ES_TIPO_PRENDA)) return false;
  if (valor.colorId !== null && !esTexto(valor.colorId)) return false;
  if (!esTexto(valor.nombreEnPrenda)) return false;
  if (!esBooleano(valor.esArquero)) return false;
  if (!esNumero(valor.precioCalculado)) return false;
  if (!esArray(valor.personalizaciones) || !esArray(valor.excepciones)) return false;
  return true;
}

export function esResumenProduccionDto(valor: unknown): valor is ResumenProduccionDto {
  if (!esObjeto(valor)) return false;
  if (!esTexto(valor.pedidoId)) return false;
  if (!esNumero(valor.totalPrendas)) return false;
  if (!esObjeto(valor.desgloseTiposPrenda)) return false;
  const desglose = valor.desgloseTiposPrenda;
  if (!esNumero(desglose.venta) || !esNumero(desglose.obsequio) || !esNumero(desglose.muestra)) return false;
  if (!esObjeto(valor.piezasFisicas)) return false;
  const piezas = valor.piezasFisicas;
  if (!esNumero(piezas.totalCamisetas) || !esNumero(piezas.totalShorts) || !esNumero(piezas.totalMedias)) return false;
  if (!esNumero(valor.importeTotalEstimado)) return false;
  return true;
}

export function esCatalogosDto(valor: unknown): valor is CatalogosDto {
  if (!esObjeto(valor)) return false;
  const arrayDeObjetos = (v: unknown) => esArray(v) && v.every((x) => esObjeto(x));
  if (!arrayDeObjetos(valor.productos)) return false;
  if (!arrayDeObjetos(valor.tallas)) return false;
  if (!arrayDeObjetos(valor.telas)) return false;
  if (!arrayDeObjetos(valor.cuellos)) return false;
  if (!arrayDeObjetos(valor.acabados)) return false;
  if (!arrayDeObjetos(valor.cortes)) return false;
  if (!arrayDeObjetos(valor.colores)) return false;
  if (!esObjeto(valor.parametros)) return false;
  if (!esObjeto(valor.listas)) return false;
  return true;
}

export function esPedidoDetalleDto(valor: unknown): valor is PedidoDetalleDto {
  if (!esObjeto(valor)) return false;
  if (!esObjeto(valor.pedido)) return false;
  const pedido = valor.pedido;
  if (!esTexto(pedido.id) || !esTexto(pedido.grupoId) || !esTexto(pedido.codigo)) return false;
  if (!esUnoDe(pedido.estado, ES_ESTADO_PEDIDO)) return false;
  if (!esTexto(pedido.tipoPrendaPrincipal)) return false;
  if (!esObjeto(pedido.identificacion)) return false;
  if (!esObjeto(pedido.disenoAprobado)) return false;
  if (!esArray(pedido.colores) || !esArray(pedido.ubicacionesEstampado)) return false;
  if (!esObjeto(pedido.envioProvincia)) return false;
  if (!esArray(pedido.controlCambios)) return false;
  if (!esObjeto(pedido.valoresGrupo)) return false;
  if (
    !esArray(valor.participantes) ||
    !valor.participantes.every((p) => esObjeto(p) && esUnoDe(p.estado, ES_ESTADO_PARTICIPANTE))
  )
    return false;
  if (!esArray(valor.prendas) || !valor.prendas.every((p) => esPrendaDto(p))) return false;
  if (!esCatalogosDto(valor.catalogos)) return false;
  if (!esResumenProduccionDto(valor.resumenProduccion)) return false;
  return true;
}

export function esFichaMinima(valor: unknown): valor is FichaMinimaDto {
  if (!esObjeto(valor)) return false;
  if (valor.tallaId !== null && !esTexto(valor.tallaId)) return false;
  if (valor.numero !== null && !esTexto(valor.numero)) return false;
  if (valor.genero !== null && !esTexto(valor.genero)) return false;
  return esTexto(valor.nombreEnPrenda);
}

export function esItemPedidoListaDto(valor: unknown): valor is PedidoListaDto {
  return (
    esObjeto(valor) &&
    esTexto(valor.id) &&
    esTexto(valor.codigo) &&
    esTexto(valor.clienteGrupo) &&
    esTexto(valor.tipoPrendaPrincipal) &&
    esTexto(valor.fecha ?? "") &&
    esUnoDe(valor.estado, ES_ESTADO_PEDIDO)
  );
}

export function esPedidoListaDto(valor: unknown): valor is PedidoListaDto[] {
  if (!esObjArr(valor)) return false;
  return valor.every(esItemPedidoListaDto);
}

export const esListaPedidosDto = esPedidoListaDto;

function esObjArr(valor: unknown): valor is unknown[] {
  return esArray(valor);
}

export class RespuestaInvalidaError extends Error {
  constructor(public readonly endpoint: string) {
    super(`Respuesta inválida del contrato en ${endpoint}`);
    this.name = "RespuestaInvalidaError";
  }
}

export type Guard<T> = (valor: unknown) => valor is T;

export function validarRespuesta<T>(endpoint: string, guard: (valor: unknown) => valor is T, cuerpo: unknown): T {
  if (!guard(cuerpo)) {
    throw new RespuestaInvalidaError(endpoint);
  }
  return cuerpo;
}