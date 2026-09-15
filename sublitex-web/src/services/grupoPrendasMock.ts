import type { PrendaItem } from "@/types/prendas";

/** Grupo mínimo que acompaña a la grilla — contrato §5.1 */
export interface GrupoGrilla {
  id: string;
  nombre: string;
  tipoProducto: { codigo: string; nombre: string };
  politicaNumeracion?: string;
}

/** Respuesta de GET /api/grupos/:grupoId/prendas — contrato §5.1 */
export interface GrillaGrupo {
  grupo: GrupoGrilla;
  prendas: PrendaItem[];
}

const COLORES: Record<string, { id: string; nombre: string; codigoHex: string }> = {
  c1: { id: "c1", nombre: "Blanco hueso", codigoHex: "#F7F4F2" },
  c2: { id: "c2", nombre: "Dorado", codigoHex: "#CC9933" },
  c3: { id: "c3", nombre: "Negro", codigoHex: "#060604" },
};

/**
 * ARCHIVO DE DATOS MOCK: grilla de prendas por grupo.
 * SPRINT 1: 28 filas reales (p01..p28).
 * Cada celda viene con su valor efectivo ya resuelto (excepcion ?? config, R-C03)
 * y su ORIGEN: HEREDADO se pinta estándar, EXCEPCION se resalta (R-C06/R-C08).
 */
export const grupoPrendasMock: GrillaGrupo = {
  grupo: {
    id: "grp_001",
    nombre: "Conjunto Blanco Titular",
    tipoProducto: { codigo: "KIT", nombre: "Kit completo" },
    politicaNumeracion: "LIBRE",
  },
  prendas: [
    // ---- Titulares (Venta) ----
    prenda({
      id: "p01",
      participanteId: "part_1",
      nombreEnPrenda: "CLINT",
      nombrePersona: "Clint Eastwood",
      producto: "KIT",
      talla: "L",
      numero: "69",
      genero: "HOMBRE",
      color: "c1",
      excepciones: { ACABADO: "TERMOSELLADO" },
      personalizaciones: [{ ubicacion: "CUELLO_DELANTERO", contenido: "Nombre de la esposa" }],
    }),
    prenda({
      id: "p02",
      participanteId: "part_1",
      nombreEnPrenda: "CLINT",
      nombrePersona: "Clint Eastwood",
      producto: "CAMISETA",
      talla: "L",
      numero: "69",
      genero: "HOMBRE",
      color: "c2",
    }),
    prenda({
      id: "p03",
      participanteId: "part_2",
      nombreEnPrenda: "PASCUAL",
      nombrePersona: "Carlos Pascual",
      producto: "KIT",
      talla: "M",
      numero: "7",
      genero: "HOMBRE",
      color: "c1",
    }),
    prenda({
      id: "p04",
      participanteId: "part_2",
      nombreEnPrenda: "PASCUAL",
      nombrePersona: "Carlos Pascual",
      producto: "CAMISETA",
      talla: "M",
      numero: "7",
      genero: "HOMBRE",
      color: "c3",
    }),
    prenda({
      id: "p05",
      participanteId: "part_4",
      nombreEnPrenda: "GARCIA",
      nombrePersona: "Pedro García",
      producto: "KIT",
      talla: "XL",
      numero: "10",
      genero: "HOMBRE",
      color: "c1",
    }),
    prenda({
      id: "p06",
      participanteId: "part_4",
      nombreEnPrenda: "GARCIA",
      nombrePersona: "Pedro García",
      producto: "CAMISETA",
      talla: "XL",
      numero: "10",
      genero: "HOMBRE",
      color: "c2",
    }),
    prenda({
      id: "p07",
      participanteId: "part_5",
      nombreEnPrenda: "TORRES",
      nombrePersona: "Álvaro Torres",
      producto: "KIT",
      talla: "M",
      numero: "1",
      genero: "HOMBRE",
      color: "c1",
    }),
    prenda({
      id: "p08",
      participanteId: "part_5",
      nombreEnPrenda: "TORRES",
      nombrePersona: "Álvaro Torres",
      producto: "CAMISETA",
      talla: "M",
      numero: "1",
      genero: "HOMBRE",
      color: "c3",
      excepciones: { CUELLO: "V", TELA: "WIN_FRESH" },
    }),
    prenda({
      id: "p09",
      participanteId: "part_6",
      nombreEnPrenda: "RAMIREZ",
      nombrePersona: "Jorge Ramírez",
      producto: "KIT",
      talla: "S",
      numero: "3",
      genero: "HOMBRE",
      color: "c1",
    }),
    prenda({
      id: "p10",
      participanteId: "part_6",
      nombreEnPrenda: "RAMIREZ",
      nombrePersona: "Jorge Ramírez",
      producto: "CAMISETA",
      talla: "S",
      numero: "3",
      genero: "HOMBRE",
      color: "c2",
    }),
    prenda({
      id: "p11",
      participanteId: "part_7",
      nombreEnPrenda: "CASTILLO",
      nombrePersona: "Raúl Castillo",
      producto: "KIT",
      talla: "M",
      numero: "5",
      genero: "HOMBRE",
      color: "c1",
    }),
    prenda({
      id: "p12",
      participanteId: "part_8",
      nombreEnPrenda: "ROJAS",
      nombrePersona: "Ana Rojas",
      producto: "KIT",
      talla: "S",
      numero: "2",
      genero: "MUJER",
      color: "c1",
      excepciones: { CORTE: "ENTALLADO" },
    }),
    prenda({
      id: "p13",
      participanteId: "part_9",
      nombreEnPrenda: "LUNA",
      nombrePersona: "María Luna",
      producto: "KIT",
      talla: "M",
      numero: "6",
      genero: "MUJER",
      color: "c1",
      excepciones: { CORTE: "ENTALLADO" },
    }),
    prenda({
      id: "p14",
      participanteId: "part_9",
      nombreEnPrenda: "LUNA",
      nombrePersona: "María Luna",
      producto: "CAMISETA",
      talla: "M",
      numero: "6",
      genero: "MUJER",
      color: "c2",
      excepciones: { CORTE: "PRINCESA" },
    }),
    prenda({
      id: "p15",
      participanteId: "part_10",
      nombreEnPrenda: "SANCHEZ",
      nombrePersona: "Luis Sánchez",
      producto: "KIT",
      talla: "L",
      numero: "4",
      genero: "HOMBRE",
      color: "c1",
      excepciones: { CUELLO: "V" },
    }),
    prenda({
      id: "p16",
      participanteId: "part_11",
      nombreEnPrenda: "CHAVEZ",
      nombrePersona: "Renato Chávez",
      producto: "CAMISETA_SHORT",
      talla: "L",
      numero: "11",
      genero: "HOMBRE",
      color: "c2",
    }),
    prenda({
      id: "p17",
      participanteId: "part_12",
      nombreEnPrenda: "VARGAS",
      nombrePersona: "Carlos Vargas",
      producto: "KIT",
      talla: "XL",
      numero: "12",
      genero: "HOMBRE",
      color: "c1",
      excepciones: { ACABADO: "SUBLIMADO" },
    }),
    prenda({
      id: "p18",
      participanteId: "part_14",
      nombreEnPrenda: "QUISPE",
      nombrePersona: "David Quispe",
      producto: "CAMISETA",
      talla: "M",
      numero: "7",
      genero: "HOMBRE",
      color: "c2",
    }),
    prenda({
      id: "p19",
      participanteId: "part_15",
      nombreEnPrenda: "CAMPOS",
      nombrePersona: "Verónica Campos",
      producto: "KIT",
      talla: "S",
      numero: "13",
      genero: "MUJER",
      color: "c1",
    }),
    prenda({
      id: "p20",
      participanteId: "part_16",
      nombreEnPrenda: "AGUILAR",
      nombrePersona: "Mario Aguilar",
      producto: "KIT",
      talla: "L",
      numero: "14",
      genero: "HOMBRE",
      color: "c3",
    }),
    prenda({
      id: "p21",
      participanteId: "part_16",
      nombreEnPrenda: "AGUILAR",
      nombrePersona: "Mario Aguilar",
      producto: "CAMISETA",
      talla: "L",
      numero: "14",
      genero: "HOMBRE",
      color: "c2",
    }),
    prenda({
      id: "p22",
      participanteId: "part_18",
      nombreEnPrenda: "HUAMAN",
      nombrePersona: "Franco Huamán",
      producto: "KIT",
      talla: "M",
      numero: "15",
      genero: "HOMBRE",
      color: "c1",
    }),
    prenda({
      id: "p23",
      participanteId: "part_17",
      nombreEnPrenda: "REYES",
      nombrePersona: "Diego Reyes",
      producto: "CAMISETA",
      talla: "M",
      numero: "S/N",
      genero: "HOMBRE",
      color: "c2",
    }),
    prenda({
      id: "p24",
      participanteId: "part_20",
      nombreEnPrenda: "ROJAS",
      nombrePersona: "Jimena Rojas",
      producto: "FALDA",
      talla: "10",
      numero: "16",
      genero: "MUJER",
      color: "c2",
    }),
    prenda({
      id: "p25",
      participanteId: "part_19",
      nombreEnPrenda: "PRADO",
      nombrePersona: "Jean Pierre Prado",
      producto: "ARQUERO",
      talla: "L",
      numero: "1",
      genero: "HOMBRE",
      color: "c3",
      esArquero: true,
      excepciones: { TELA: "HEXAGONAL" },
    }),
    prenda({
      id: "p26",
      participanteId: "part_13",
      nombreEnPrenda: "GUZMAN",
      nombrePersona: "Nicolás Guzmán",
      producto: "KIT",
      talla: "XXL",
      numero: "18",
      genero: "HOMBRE",
      color: "c1",
      excepciones: { TELA: "PALMEIRA" },
    }),
    prenda({
      id: "p27",
      participanteId: "part_21",
      nombreEnPrenda: "INSTRUCTOR",
      nombrePersona: "Instructor",
      producto: "CAMISETA",
      talla: "L",
      numero: "0",
      genero: "HOMBRE",
      color: "c3",
      tipoPrenda: "OBSEQUIO",
    }),
    prenda({
      id: "p28",
      participanteId: "part_22",
      nombreEnPrenda: "MUESTRA",
      nombrePersona: "Muestra taller",
      producto: "CAMISETA",
      talla: "M",
      numero: "S/N",
      genero: "HOMBRE",
      color: "c1",
      tipoPrenda: "MUESTRA",
    }),
  ],
};

interface PrendaMockInput {
  id: string;
  participanteId: string;
  nombreEnPrenda: string;
  nombrePersona: string;
  producto: string;
  talla: string;
  numero: string;
  genero: PrendaItem["genero"];
  color: string;
  tipoPrenda?: PrendaItem["tipoPrenda"];
  esArquero?: boolean;
  excepciones?: Record<string, string>;
  personalizaciones?: PrendaItem["personalizaciones"];
}

function prenda(input: PrendaMockInput): PrendaItem {
  const heredados: Array<[string, string]> = [
    ["CUELLO", "REDONDO"],
    ["TELA", "DRY_FIT"],
    ["CORTE", "RECTO"],
    ["ACABADO", "NINGUNO"],
  ];

  const valores = heredados.map(([atributo, valor]) => ({
    atributo,
    valor: input.excepciones?.[atributo] ?? valor,
    origen: (input.excepciones?.[atributo] ? "EXCEPCION" : "HEREDADO") as PrendaItem["valores"][number]["origen"],
  }));

  return {
    id: input.id,
    participanteId: input.participanteId,
    nombreEnPrenda: input.nombreEnPrenda,
    nombrePersona: input.nombrePersona,
    producto: input.producto,
    talla: input.talla,
    numero: input.numero,
    genero: input.genero,
    tipoPrenda: input.tipoPrenda ?? "VENTA",
    esArquero: input.esArquero ?? false,
    color: COLORES[input.color] ?? null,
    valores,
    personalizaciones: input.personalizaciones ?? [],
  };
}