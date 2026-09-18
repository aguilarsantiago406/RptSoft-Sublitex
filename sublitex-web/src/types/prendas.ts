// =============================================================================
// ENUMS
// =============================================================================

export type TipoPrenda = "VENTA" | "OBSEQUIO" | "MUESTRA";

export type Genero = "HOMBRE" | "MUJER" | "NINO" | "NINA" | "SIN_ESPECIFICAR";

export type TipoTarifa =
  | "PRODUCTO"
  | "RECARGO_TALLA"
  | "RECARGO_TELA"
  | "RECARGO_CUELLO"
  | "RECARGO_ACABADO"
  | "ADICIONAL"
  | "COSTO_INTERNO";

export type OrigenValor = "HEREDADO" | "EXCEPCION";

// =============================================================================
// CATÁLOGO (GET /api/catalogos — contrato §2.1)
// =============================================================================

export interface ComponentesProducto {
  camisetas: number;
  shorts: number;
  medias: number;
}

export interface ProductoCatalogo {
  codigo: string;
  nombre: string;
  orden: number;
  componentes: ComponentesProducto; // R-K03: cada producto declara sus piezas físicas
}

export interface TallaCatalogo {
  codigo: string;
  etiqueta: string;
  orden: number;
}

export interface TallasPorProducto {
  productoCodigo: string;
  tallas: TallaCatalogo[]; // R-E04: las tallas viven dentro de su producto
}

export interface ValorAtributo {
  codigo: string;
  etiqueta: string;
  orden: number;
}

export interface AtributoCatalogo {
  codigo: string;
  nombre: string;
  obligatorio: boolean; // R-B06: sin valor, el grupo no pasa a recolección
  criticoProduccion: boolean;
  valores: ValorAtributo[];
}

export interface CatalogoCompleto {
  productos: ProductoCatalogo[];
  tallasPorProducto: TallasPorProducto[];
  atributos: AtributoCatalogo[];
  ubicaciones: { codigo: string; etiqueta: string; orden: number }[];
  generos: Genero[];
  tiposPrenda: TipoPrenda[];
}

// =============================================================================
// TARIFAS (GET /api/tarifas — contrato §2.2)
// Ningún precio se escribe a mano — R-K10
// =============================================================================

export interface Tarifa {
  id: string;
  tipo: TipoTarifa;
  concepto: string;
  valor: number;
  vigenteDesde: string;
  vigenteHasta: string | null;
  activo: boolean;
  nota?: string | null;
}

// =============================================================================
// COLOR DEL PEDIDO — R-K05 (siempre con codigoHex)
// =============================================================================

export interface ColorPedido {
  id: string;
  nombre: string;
  codigoHex: string;
}

// =============================================================================
// VALOR EFECTIVO DE UN ATRIBUTO EN LA PRENDA
// R-C03/R-C06/R-C08: el backend lo resuelve al leer (excepcion ?? config)
// y cada celda entrega su origen para que la grilla pinte heredado/excepción
// =============================================================================

export interface ValorEfectivo {
  atributo: string;
  valor: string;
  origen: OrigenValor;
  motivo?: string;
}

export interface Personalizacion {
  ubicacion: string;
  contenido: string; // R-F04: ortografía exacta con la que se registró
}

// =============================================================================
// PRENDA (GET /api/grupos/:grupoId/prendas — contrato §5.1)
// La unidad física que se fabrica y cuenta
// =============================================================================

export interface PrendaItem {
  id: string;
  participanteId: string;
  nombrePersona: string;
  nombreEnPrenda: string;
  producto: string; // código del catálogo: KIT, CAMISETA, CAMISETA_SHORT...
  talla: string;
  numero: string; // dorsal — ES TEXTO: "7", "S/N" — R-K04
  genero: Genero;
  tipoPrenda: TipoPrenda; // VENTA cuenta al importe; OBSEQUIO/MUESTRA no — R-K02
  esArquero: boolean;
  color: ColorPedido | null;
  valores: ValorEfectivo[];
  personalizaciones: Personalizacion[];
}

// =============================================================================
// UPDATE DE UNA CELDA DE LA GRILLA (edición en línea — contrato §5.2)
// Tipado discriminado: cada caso solo admite su valor coherente
// =============================================================================

export type TextoPrenda =
  | "nombreEnPrenda"
  | "nombrePersona"
  | "numero"
  | "producto"
  | "talla"
  | "genero"
  | "tipoPrenda";

export type UpdatePrenda =
  | { tipo: "valor"; atributo: string; valor: string }
  | { tipo: "color"; color: ColorPedido }
  | { tipo: "texto"; campo: TextoPrenda; valor: string }
  | { tipo: "booleano"; campo: "esArquero"; valor: boolean };

// =============================================================================
// RESULTADO DE CÁLCULO (lo que devuelven las funciones del domain/)
// =============================================================================

export interface ResultadoPrecio {
  precioBase: number;
  recTalla: number;
  recTela: number;
  recCuello: number;
  recAcabado: number;
  precioUnitario: number; // 0 si OBSEQUIO o MUESTRA — R-K02
}

export interface ResultadoPiezas {
  camisetas: number;
  shorts: number;
  medias: number;
}

export interface TotalesPedido extends ResultadoPiezas {
  totalBase: number;
  totalRecTalla: number;
  totalRecTela: number;
  totalRecCuello: number;
  totalRecAcabado: number;
  importeTotal: number;
}