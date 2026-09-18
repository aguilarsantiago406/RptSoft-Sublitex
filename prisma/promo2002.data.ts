export interface ProductoSeed {
  codigo: string;
  nombre: string;
  orden: number;
  camisetas: number;
  shorts: number;
  medias: number;
  tallas: string[];
}

export const PRODUCTOS: ProductoSeed[] = [
  { codigo: 'CAMISETA', nombre: 'Camiseta', orden: 1, camisetas: 1, shorts: 0, medias: 0, tallas: ['S', 'M', 'L', 'XL', 'XXL', '10', '12', '14'] },
  { codigo: 'CONJUNTO', nombre: 'Conjunto deportivo', orden: 2, camisetas: 1, shorts: 1, medias: 1, tallas: ['S', 'M', 'L', 'XL', '10', '12', '14'] },
  { codigo: 'KIT', nombre: 'Kit completo', orden: 3, camisetas: 1, shorts: 1, medias: 1, tallas: ['S', 'M', 'L', 'XL', 'XXL', '10', '12', '14'] },
  { codigo: 'ARQUERO', nombre: 'Camiseta arquero', orden: 4, camisetas: 1, shorts: 1, medias: 1, tallas: ['M', 'L', 'XL'] },
  { codigo: 'SHORT', nombre: 'Short', orden: 5, camisetas: 0, shorts: 1, medias: 0, tallas: ['S', 'M', 'L', 'XL'] },
  { codigo: 'MEDIAS', nombre: 'Medias', orden: 6, camisetas: 0, shorts: 0, medias: 1, tallas: ['UNICA'] },
  { codigo: 'FALDA', nombre: 'Falda', orden: 7, camisetas: 0, shorts: 0, medias: 0, tallas: ['S', 'M', 'L'] },
];

export interface AtributoSeed {
  codigo: string;
  nombre: string;
  obligatorio: boolean;
  criticoProduccion: boolean;
  orden: number;
  valores: Array<{ codigo: string; etiqueta: string; orden: number }>;
}

export const ATRIBUTOS: AtributoSeed[] = [
  {
    codigo: 'TELA',
    nombre: 'Tela',
    obligatorio: true,
    criticoProduccion: false,
    orden: 1,
    valores: [
      { codigo: 'DRY_FIT', etiqueta: 'Dry Fit', orden: 1 },
      { codigo: 'PUMA', etiqueta: 'Puma', orden: 2 },
      { codigo: 'WIN', etiqueta: 'Win', orden: 3 },
      { codigo: 'ALGODON', etiqueta: 'Algodón', orden: 4 },
    ],
  },
  {
    codigo: 'CUELLO',
    nombre: 'Cuello',
    obligatorio: true,
    criticoProduccion: false,
    orden: 2,
    valores: [
      { codigo: 'REDONDO', etiqueta: 'Redondo', orden: 1 },
      { codigo: 'CAMISERO', etiqueta: 'Camisero', orden: 2 },
      { codigo: 'V', etiqueta: 'Cuello V', orden: 3 },
    ],
  },
  {
    codigo: 'MANGA',
    nombre: 'Manga',
    obligatorio: true,
    criticoProduccion: false,
    orden: 3,
    valores: [
      { codigo: 'CORTA', etiqueta: 'Corta', orden: 1 },
      { codigo: 'LARGA', etiqueta: 'Larga', orden: 2 },
    ],
  },
  {
    codigo: 'CORTE',
    nombre: 'Corte',
    obligatorio: true,
    criticoProduccion: true,
    orden: 4,
    valores: [
      { codigo: 'RECTO', etiqueta: 'Recto', orden: 1 },
      { codigo: 'ENTALLADO', etiqueta: 'Entallado', orden: 2 },
      { codigo: 'PRINCESA', etiqueta: 'Princesa', orden: 3 },
      { codigo: 'MODERNO', etiqueta: 'Moderno', orden: 4 },
    ],
  },
  {
    codigo: 'ESCUDO',
    nombre: 'Escudo',
    obligatorio: false,
    criticoProduccion: true,
    orden: 5,
    valores: [
      { codigo: 'NINGUNO', etiqueta: 'Ninguno', orden: 1 },
      { codigo: 'TERMOSELLADO', etiqueta: 'Termosellado', orden: 2 },
      { codigo: 'BORDADO', etiqueta: 'Bordado', orden: 3 },
    ],
  },
  {
    codigo: 'ACABADO',
    nombre: 'Acabado',
    obligatorio: false,
    criticoProduccion: false,
    orden: 6,
    valores: [
      { codigo: 'NINGUNO', etiqueta: 'Ninguno', orden: 1 },
      { codigo: 'SUBLIMADO', etiqueta: 'Sublimado', orden: 2 },
      { codigo: 'TERMOSELLADO', etiqueta: 'Termosellado', orden: 3 },
    ],
  },
];

export const UBICACIONES = [
  { codigo: 'PECHO', etiqueta: 'Pecho', orden: 1 },
  { codigo: 'ESPALDA', etiqueta: 'Espalda', orden: 2 },
  { codigo: 'CUELLO_DELANTERO', etiqueta: 'Cuello delantero', orden: 3 },
  { codigo: 'CUELLO_POSTERIOR', etiqueta: 'Cuello posterior', orden: 4 },
  { codigo: 'MANGA_IZQUIERDA', etiqueta: 'Manga izquierda', orden: 5 },
  { codigo: 'MANGA_DERECHA', etiqueta: 'Manga derecha', orden: 6 },
  { codigo: 'SHORT_DELANTERO', etiqueta: 'Short delantero', orden: 7 },
  { codigo: 'SHORT_POSTERIOR', etiqueta: 'Short posterior', orden: 8 },
];

export interface ColorSeed {
  nombre: string;
  codigoHex: string;
  referenciaFisica: string;
}

export const COLORES: ColorSeed[] = [
  { nombre: 'Blanco hueso', codigoHex: '#F7F4F2', referenciaFisica: 'Pantone 11-0601 TCX' },
  { nombre: 'Azul', codigoHex: '#1D4ED8', referenciaFisica: 'Muestra azul del pedido PROMO 2002' },
];

export interface PrendaSeed {
  nombreEnPrenda: string;
  nombrePersona: string;
  numero: string;
  talla: string;
  genero: 'HOMBRE' | 'MUJER' | 'NINO' | 'NINA';
  tipoPrenda: 'VENTA' | 'OBSEQUIO' | 'MUESTRA';
  color: 'Blanco hueso' | 'Azul';
}

export interface GrupoPromoSeed {
  nombre: string;
  tipoProducto: string;
  cantidadContratada: number;
  politica: 'LIBRE' | 'UNICA';
  prendas: PrendaSeed[];
}

export const PEDIDO_PROMO_2002 = {
  codigo: 'SUB-000842',
  cliente: {
    tipo: 'PROMOCION',
    nombre: 'Promoción 2002 - Colegio San José',
    telefono: '999888777',
    ciudad: 'Lima',
  },
  fechaCompromiso: new Date('2026-11-20T00:00:00Z'),
  observaciones: 'Entrega para desfile escolar. Código de color obligatorio en todas las prendas.',
  grupos: [
    {
      nombre: 'Kit completo',
      tipoProducto: 'KIT',
      cantidadContratada: 17,
      politica: 'LIBRE',
      prendas: [
        p('ANMIX BRENIS', 'ANMIX BRENIS', '7', 'M', 'HOMBRE', 'VENTA', 'Blanco hueso'),
        p('J. HUANCAS', 'J. HUANCAS', '7', 'M', 'HOMBRE', 'VENTA', 'Blanco hueso'),
        p('BANCES', 'BANCES', '17', 'M', 'HOMBRE', 'VENTA', 'Blanco hueso'),
        p('VENTURA', 'VENTURA', '9', 'M', 'HOMBRE', 'VENTA', 'Blanco hueso'),
        p('JHEINER', 'JHEINER', '12', 'M', 'HOMBRE', 'VENTA', 'Blanco hueso'),
        p('JUAN R.', 'JUAN R.', '12', 'M', 'HOMBRE', 'VENTA', 'Blanco hueso'),
        p('JORGE C.', 'JORGE C.', '7', 'M', 'HOMBRE', 'VENTA', 'Blanco hueso'),
        p('C. ACOSTA', 'C. ACOSTA', '10', 'M', 'HOMBRE', 'VENTA', 'Blanco hueso'),
        p('LADINES', 'LADINES', '3', 'L', 'HOMBRE', 'VENTA', 'Blanco hueso'),
        p('GUSTAVO R.', 'GUSTAVO R.', '11', 'L', 'HOMBRE', 'VENTA', 'Blanco hueso'),
        p('CALDERON', 'CALDERON', '14', 'L', 'HOMBRE', 'VENTA', 'Blanco hueso'),
        p('ALAN F.', 'ALAN F.', '8', 'L', 'HOMBRE', 'VENTA', 'Blanco hueso'),
        p('ALAN R.', 'ALAN R.', '7', 'L', 'HOMBRE', 'VENTA', 'Blanco hueso'),
        p('FLORES', 'FLORES', '30', 'L', 'HOMBRE', 'VENTA', 'Blanco hueso'),
        p('CLINT', 'CLINT', '69', 'XL', 'HOMBRE', 'VENTA', 'Blanco hueso'),
        p('HA.LI', 'HA.LI', '119', 'XL', 'HOMBRE', 'VENTA', 'Blanco hueso'),
        p('TAPIA', 'TAPIA', '23', 'L', 'HOMBRE', 'VENTA', 'Azul'),
      ],
    },
    {
      nombre: 'Camiseta sola',
      tipoProducto: 'CAMISETA',
      cantidadContratada: 11,
      politica: 'LIBRE',
      prendas: [
        p('THEO', 'THEO', '69', '10', 'NINO', 'VENTA', 'Blanco hueso'),
        p('THIAGO R.', 'THIAGO R.', '8', '14', 'NINO', 'VENTA', 'Blanco hueso'),
        p('AMPARO', 'AMPARO', '4', 'S', 'MUJER', 'VENTA', 'Blanco hueso'),
        p('TOGUE', 'TOGUE', '8', 'S', 'HOMBRE', 'VENTA', 'Blanco hueso'),
        p('MIRTHA', 'MIRTHA', '23', 'S', 'MUJER', 'VENTA', 'Blanco hueso'),
        p('ANA LI', 'ANA LI', '11', 'M', 'MUJER', 'VENTA', 'Blanco hueso'),
        p('LOCONI', 'LOCONI', '98', 'M', 'HOMBRE', 'VENTA', 'Blanco hueso'),
        p('HADA', 'HADA', '8', 'M', 'MUJER', 'VENTA', 'Blanco hueso'),
        p('PATRICIA A.', 'PATRICIA A.', '10', 'M', 'MUJER', 'VENTA', 'Blanco hueso'),
        p('CYNTHIA', 'CYNTHIA', '25', 'L', 'MUJER', 'VENTA', 'Blanco hueso'),
        p('CLINT', 'CLINT', '69', 'XL', 'HOMBRE', 'VENTA', 'Azul'),
      ],
    },
  ],
} as const satisfies PromoSeed;

type PromoSeed = {
  codigo: string;
  cliente: { tipo: string; nombre: string; telefono: string; ciudad: string };
  fechaCompromiso: Date;
  observaciones: string;
  grupos: GrupoPromoSeed[];
};

function p(
  nombreEnPrenda: string,
  nombrePersona: string,
  numero: string,
  talla: string,
  genero: 'HOMBRE' | 'MUJER' | 'NINO' | 'NINA',
  tipoPrenda: 'VENTA' | 'OBSEQUIO' | 'MUESTRA',
  color: 'Blanco hueso' | 'Azul',
): PrendaSeed {
  return { nombreEnPrenda, nombrePersona, numero, talla, genero, tipoPrenda, color };
}