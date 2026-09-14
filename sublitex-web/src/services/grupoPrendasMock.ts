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
 * Cada celda viene con su valor efectivo ya resuelto (excepcion ?? config, R-C03)
 * y su ORIGEN: HEREDADO se pinta en gris, EXCEPCION se resalta (R-C06/R-C08).
 */
export const grupoPrendasMock: GrillaGrupo = {
  grupo: {
    id: "grp_001",
    nombre: "Conjunto Blanco Titular",
    tipoProducto: { codigo: "KIT", nombre: "Kit completo" },
    politicaNumeracion: "LIBRE",
  },
  prendas: [
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
    esArquero: false,
    color: COLORES[input.color] ?? null,
    valores,
    personalizaciones: input.personalizaciones ?? [],
  };
}