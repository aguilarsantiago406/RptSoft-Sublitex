import type { CatalogoCompleto } from "@/types/prendas";

/**
 * CATÁLOGO OFICIAL (GET /api/catalogos — contrato §2.1)
 * Forma exacta del modelo real: productos con BOM declarado (R-K03),
 * tallas POR PRODUCTO (R-E04) y atributos cerrados con valores cerrados (R-B04).
 *
 * Los precios NO viven acá: salen de GET /api/tarifas (R-K10).
 */
export const catalogoMock: CatalogoCompleto = {
  productos: [
    { codigo: "CAMISETA", orden: 1, nombre: "Camiseta", componentes: { camisetas: 1, shorts: 0, medias: 0 } },
    { codigo: "CAMISETA_SHORT", orden: 2, nombre: "Camiseta + short", componentes: { camisetas: 1, shorts: 1, medias: 0 } },
    { codigo: "KIT", orden: 3, nombre: "Kit completo", componentes: { camisetas: 1, shorts: 1, medias: 1 } },
    { codigo: "ARQUERO", orden: 4, nombre: "Camiseta arquero", componentes: { camisetas: 1, shorts: 0, medias: 0 } },
    { codigo: "CONJUNTO_ARQUERO", orden: 5, nombre: "Conjunto arquero", componentes: { camisetas: 1, shorts: 1, medias: 1 } },
    { codigo: "SHORT", orden: 6, nombre: "Short solo", componentes: { camisetas: 0, shorts: 1, medias: 0 } },
    { codigo: "MEDIAS", orden: 7, nombre: "Medias", componentes: { camisetas: 0, shorts: 0, medias: 1 } },
    { codigo: "FALDA", orden: 8, nombre: "Falda deportiva", componentes: { camisetas: 1, shorts: 0, medias: 0 } },
    { codigo: "BANDEROLA", orden: 9, nombre: "Banderola", componentes: { camisetas: 0, shorts: 0, medias: 0 } },
  ],
  tallasPorProducto: [
    {
      productoCodigo: "CAMISETA",
      tallas: adultoSizes(),
    },
    {
      productoCodigo: "CAMISETA_SHORT",
      tallas: adultoSizes(),
    },
    {
      productoCodigo: "KIT",
      tallas: adultoSizes(),
    },
    {
      productoCodigo: "ARQUERO",
      tallas: adultoSizes(),
    },
    {
      productoCodigo: "CONJUNTO_ARQUERO",
      tallas: adultoSizes(),
    },
    {
      productoCodigo: "SHORT",
      tallas: adultoSizes(),
    },
    {
      productoCodigo: "MEDIAS",
      tallas: [
        { codigo: "UNICA", etiqueta: "Talla única", orden: 1 },
      ],
    },
    {
      // R-E04: la falda usa tallas infantiles, no las mismas del adulto
      productoCodigo: "FALDA",
      tallas: [
        { codigo: "6", etiqueta: "6", orden: 1 },
        { codigo: "8", etiqueta: "8", orden: 2 },
        { codigo: "10", etiqueta: "10", orden: 3 },
        { codigo: "12", etiqueta: "12", orden: 4 },
        { codigo: "14", etiqueta: "14", orden: 5 },
        { codigo: "16", etiqueta: "16", orden: 6 },
      ],
    },
    {
      productoCodigo: "BANDEROLA",
      tallas: adultoSizes(),
    },
  ],
  atributos: [
    {
      codigo: "TELA",
      nombre: "Tela",
      obligatorio: true,
      criticoProduccion: false,
      valores: [
        { codigo: "DRY_FIT", etiqueta: "Dry Fit", orden: 1 },
        { codigo: "WIN_FRESH", etiqueta: "Win Fresh", orden: 2 },
        { codigo: "MARATHON", etiqueta: "Marathon", orden: 3 },
        { codigo: "PUMA", etiqueta: "Puma", orden: 4 },
        { codigo: "PALMEIRA", etiqueta: "Palmeira", orden: 5 },
        { codigo: "HEXAGONAL", etiqueta: "Hexagonal", orden: 6 },
        { codigo: "LABRADA", etiqueta: "Labrada", orden: 7 },
        { codigo: "NOVA_SIN_FORRO", etiqueta: "Nova sin forro", orden: 8 },
      ],
    },
    {
      codigo: "COLOR",
      nombre: "Color",
      obligatorio: true,
      criticoProduccion: false,
      valores: [],
    },
    {
      codigo: "CUELLO",
      nombre: "Cuello",
      obligatorio: true,
      criticoProduccion: false,
      valores: [
        { codigo: "REDONDO", etiqueta: "Redondo", orden: 1 },
        { codigo: "V", etiqueta: "V", orden: 2 },
        { codigo: "REDONDO_CRUZADO", etiqueta: "Redondo cruzado", orden: 3 },
        { codigo: "V_CRUZADO", etiqueta: "V cruzado", orden: 4 },
        { codigo: "CAMISERO", etiqueta: "Camisero", orden: 5 },
      ],
    },
    {
      codigo: "MANGA",
      nombre: "Manga",
      obligatorio: false,
      criticoProduccion: false,
      valores: [
        { codigo: "CORTA", etiqueta: "Corta", orden: 1 },
        { codigo: "LARGA", etiqueta: "Larga", orden: 2 },
      ],
    },
    {
      codigo: "CORTE",
      nombre: "Corte",
      obligatorio: true,
      criticoProduccion: false,
      valores: [
        { codigo: "RECTO", etiqueta: "Recto", orden: 1 },
        { codigo: "ENTALLADO", etiqueta: "Entallado", orden: 2 },
        { codigo: "PRINCESA", etiqueta: "Princesa", orden: 3 },
      ],
    },
    {
      codigo: "ESCUDO",
      nombre: "Escudo",
      obligatorio: false,
      criticoProduccion: true,
      valores: [],
    },
    {
      codigo: "ACABADO",
      nombre: "Acabado",
      obligatorio: false,
      criticoProduccion: false,
      valores: [
        { codigo: "NINGUNO", etiqueta: "Ninguno", orden: 1 },
        { codigo: "SUBLIMADO", etiqueta: "Sublimado", orden: 2 },
        { codigo: "TERMOSELLADO", etiqueta: "Termosellado", orden: 3 },
        { codigo: "BORDADO", etiqueta: "Bordado", orden: 4 },
        { codigo: "DTF", etiqueta: "DTF", orden: 5 },
        { codigo: "VINIL", etiqueta: "Vinil", orden: 6 },
        { codigo: "PARCHE", etiqueta: "Parche", orden: 7 },
      ],
    },
  ],
  ubicaciones: [
    { codigo: "PECHO", etiqueta: "Pecho", orden: 1 },
    { codigo: "ESPALDA", etiqueta: "Espalda", orden: 2 },
    { codigo: "CUELLO_DELANTERO", etiqueta: "Cuello delantero", orden: 3 },
    { codigo: "CUELLO_POSTERIOR", etiqueta: "Cuello posterior", orden: 4 },
    { codigo: "MANGA_IZQUIERDA", etiqueta: "Manga izquierda", orden: 5 },
    { codigo: "MANGA_DERECHA", etiqueta: "Manga derecha", orden: 6 },
    { codigo: "SHORT_DELANTERO", etiqueta: "Short delantero", orden: 7 },
    { codigo: "SHORT_POSTERIOR", etiqueta: "Short posterior", orden: 8 },
  ],
  generos: ["HOMBRE", "MUJER", "NINO", "NINA", "SIN_ESPECIFICAR"],
  tiposPrenda: ["VENTA", "OBSEQUIO", "MUESTRA"],
};

function adultoSizes() {
  return [
    { codigo: "S", etiqueta: "S", orden: 1 },
    { codigo: "M", etiqueta: "M", orden: 2 },
    { codigo: "L", etiqueta: "L", orden: 3 },
    { codigo: "XL", etiqueta: "XL", orden: 4 },
    { codigo: "XXL", etiqueta: "XXL", orden: 5 },
    { codigo: "XXXL", etiqueta: "XXXL", orden: 6 },
  ];
}