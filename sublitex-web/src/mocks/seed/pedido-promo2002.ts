import type { DbSimuladorDto, PrendaDbDto } from "@/services/contrato";
import { redondear2 } from "@/domain/precios";

const productosPorId = (id: string) => {
  const encontrado = productos.find((p) => p.id === id);
  return encontrado ?? { id, nombre: id, precioBase: 0, componentes: { camisetas: 0, shorts: 0, medias: 0 } };
};

const productos = [
  { id: "prod_cam_01", nombre: "Camiseta sola", precioBase: 25, componentes: { camisetas: 1, shorts: 0, medias: 0 } },
  { id: "prod_cam_short_01", nombre: "Camiseta + short", precioBase: 40, componentes: { camisetas: 1, shorts: 1, medias: 0 } },
  { id: "prod_kit_01", nombre: "Kit completo", precioBase: 45, componentes: { camisetas: 1, shorts: 1, medias: 1 } },
  { id: "prod_cam_arq_01", nombre: "Camiseta arquero", precioBase: 35, componentes: { camisetas: 1, shorts: 0, medias: 0 } },
  { id: "prod_conj_arq_01", nombre: "Conjunto arquero", precioBase: 60, componentes: { camisetas: 1, shorts: 1, medias: 1 } },
  { id: "prod_short_01", nombre: "Short solo", precioBase: 15, componentes: { camisetas: 0, shorts: 1, medias: 0 } },
  { id: "prod_medias_01", nombre: "Medias", precioBase: 5, componentes: { camisetas: 0, shorts: 0, medias: 1 } },
  { id: "prod_falda_01", nombre: "Falda deportiva", precioBase: 25, componentes: { camisetas: 1, shorts: 0, medias: 0 } },
  { id: "prod_banderola_01", nombre: "Banderola", precioBase: 25, componentes: { camisetas: 0, shorts: 0, medias: 0 } },
];

const tallas = [
  { id: "talla_6", codigo: "6", etiqueta: "Talla 6", recargo: 0, tipo: "Infantil" as const },
  { id: "talla_8", codigo: "8", etiqueta: "Talla 8", recargo: 0, tipo: "Infantil" as const },
  { id: "talla_10", codigo: "10", etiqueta: "Talla 10", recargo: 0, tipo: "Infantil" as const },
  { id: "talla_12", codigo: "12", etiqueta: "Talla 12", recargo: 0, tipo: "Infantil" as const },
  { id: "talla_14", codigo: "14", etiqueta: "Talla 14", recargo: 0, tipo: "Infantil" as const },
  { id: "talla_16", codigo: "16", etiqueta: "Talla 16", recargo: 0, tipo: "Infantil" as const },
  { id: "talla_S", codigo: "S", etiqueta: "Talla S", recargo: 0, tipo: "Adulto" as const },
  { id: "talla_M", codigo: "M", etiqueta: "Talla M", recargo: 0, tipo: "Adulto" as const },
  { id: "talla_L", codigo: "L", etiqueta: "Talla L", recargo: 0, tipo: "Adulto" as const },
  { id: "talla_XL", codigo: "XL", etiqueta: "Talla XL", recargo: 3, tipo: "Adulto" as const },
  { id: "talla_XXL", codigo: "XXL", etiqueta: "Talla XXL", recargo: 6, tipo: "Adulto" as const },
  { id: "talla_XXXL", codigo: "XXXL", etiqueta: "Talla XXXL", recargo: 10, tipo: "Adulto" as const },
];

const telas = [
  { id: "tela_dry_fit", nombre: "Dry Fit", recargo: 0 },
  { id: "tela_win_fresh", nombre: "Win Fresh", recargo: 0 },
  { id: "tela_marathon", nombre: "Marathon", recargo: 5 },
  { id: "tela_puma", nombre: "Puma", recargo: 5 },
  { id: "tela_palmeira", nombre: "Palmeira", recargo: 5 },
  { id: "tela_hexagonal", nombre: "Hexagonal", recargo: 5 },
  { id: "tela_labrada", nombre: "Labrada", recargo: 10 },
  { id: "tela_nova", nombre: "Nova sin forro", recargo: 0 },
];

const cuellos = [
  { id: "cuello_redondo", nombre: "Redondo", recargo: 0 },
  { id: "cuello_redondo_cruzado", nombre: "Redondo cruzado", recargo: 0 },
  { id: "cuello_v", nombre: "V", recargo: 0 },
  { id: "cuello_v_cruzado", nombre: "V cruzado", recargo: 0 },
  { id: "cuello_camisero", nombre: "Camisero", recargo: 10 },
];

const acabados = [
  { id: "acab_sublimado", nombre: "Sublimado", recargo: 0 },
  { id: "acab_ninguno", nombre: "Ninguno", recargo: 0 },
  { id: "acab_termosellado", nombre: "Termosellado", recargo: 5 },
  { id: "acab_bordado", nombre: "Bordado", recargo: 5 },
  { id: "acab_dtf", nombre: "DTF", recargo: 5 },
  { id: "acab_vinil", nombre: "Vinil", recargo: 5 },
  { id: "acab_parche", nombre: "Parche", recargo: 5 },
];

const cortes = [
  { id: "val_corte_recto", nombre: "Recto" },
  { id: "val_corte_entallado", nombre: "Entallado" },
  { id: "val_corte_princesa", nombre: "Princesa" },
];

const colores = [
  { id: "col_blanco_03", nombre: "Blanco hueso", codigoHex: "#F7F4F2" },
  { id: "col_azul_02", nombre: "Azul", codigoHex: "#2B4E7A" },
];

const parametros = {
  igv: 0.18,
  adelantoEstandar: 0.5,
  adelantoExcepcional: 0.4,
  pedidoMinimo: 12,
  validezProformaDias: 7,
};

const listas = {
  generos: ["Hombre", "Mujer", "Niño", "Niña", "Sin especificar"],
  cortes: ["Recto", "Entallado", "Princesa"],
  tiposPrenda: ["Venta", "Obsequio", "Muestra"],
  siNo: ["Sí", "No"],
  mangas: ["Corta", "Larga"],
  modalidadesEntrega: ["Recojo Surquillo", "Recojo Gamarra", "Motorizado Lima", "Agencia a provincia"],
};

const personalizacionesEspeciales: Record<string, string> = {
  pre_2001: "Nombre de esposa en cuello delantero",
  pre_2006: "JUAN R. nombre principal; KALESSI en cuello delantero; JOHNATAN manga izquierda; DIEGO manga derecha",
  pre_2015: "Nombres de los hijos en las mangas; nombre de la esposa en el cuello delantero",
  pre_2028: "Nombres de los hijos en las mangas; nombre de la esposa en el cuello delantero",
};

type FilaPrenda = [
  id: string,
  nombreEnPrenda: string,
  nombrePersona: string | null,
  productoId: string,
  tallaId: string,
  numero: string,
  colorId: string,
  genero: string,
  precio: number,
];

const filas: FilaPrenda[] = [
  ["pre_2001", "ANMIX BRENIS", "Luis Chapoñán Vera", "prod_kit_01", "talla_M", "7", "col_blanco_03", "HOMBRE", 45],
  ["pre_2002", "J. HUANCAS", null, "prod_kit_01", "talla_M", "7", "col_blanco_03", "HOMBRE", 45],
  ["pre_2003", "BANCES", null, "prod_kit_01", "talla_M", "17", "col_blanco_03", "HOMBRE", 45],
  ["pre_2004", "VENTURA", null, "prod_kit_01", "talla_M", "9", "col_blanco_03", "HOMBRE", 45],
  ["pre_2005", "JHEINER", null, "prod_kit_01", "talla_M", "12", "col_blanco_03", "HOMBRE", 45],
  ["pre_2006", "JUAN R.", null, "prod_kit_01", "talla_M", "12", "col_blanco_03", "HOMBRE", 45],
  ["pre_2007", "JORGE C.", null, "prod_kit_01", "talla_M", "7", "col_blanco_03", "HOMBRE", 45],
  ["pre_2008", "C. ACOSTA", null, "prod_kit_01", "talla_M", "10", "col_blanco_03", "HOMBRE", 45],
  ["pre_2009", "LADINES", null, "prod_kit_01", "talla_L", "3", "col_blanco_03", "HOMBRE", 45],
  ["pre_2010", "GUSTAVO R.", null, "prod_kit_01", "talla_L", "11", "col_blanco_03", "HOMBRE", 45],
  ["pre_2011", "CALDERON", null, "prod_kit_01", "talla_L", "14", "col_blanco_03", "HOMBRE", 45],
  ["pre_2012", "ALAN F.", null, "prod_kit_01", "talla_L", "8", "col_blanco_03", "HOMBRE", 45],
  ["pre_2013", "ALAN R.", null, "prod_kit_01", "talla_L", "7", "col_blanco_03", "HOMBRE", 45],
  ["pre_2014", "FLORES", null, "prod_kit_01", "talla_L", "30", "col_blanco_03", "HOMBRE", 45],
  ["pre_2015", "CLINT", null, "prod_kit_01", "talla_XL", "69", "col_blanco_03", "HOMBRE", 48],
  ["pre_2016", "HA.LI", null, "prod_kit_01", "talla_XL", "119", "col_blanco_03", "HOMBRE", 48],
  ["pre_2017", "THEO", null, "prod_cam_01", "talla_10", "69", "col_blanco_03", "NIÑO", 25],
  ["pre_2018", "THIAGO R.", null, "prod_cam_01", "talla_14", "8", "col_blanco_03", "NIÑO", 25],
  ["pre_2019", "AMPARO", null, "prod_cam_01", "talla_S", "4", "col_blanco_03", "MUJER", 25],
  ["pre_2020", "TOGUE", null, "prod_cam_01", "talla_S", "8", "col_blanco_03", "HOMBRE", 25],
  ["pre_2021", "MIRTHA", null, "prod_cam_01", "talla_S", "23", "col_blanco_03", "MUJER", 25],
  ["pre_2022", "ANA LI", null, "prod_cam_01", "talla_M", "11", "col_blanco_03", "MUJER", 25],
  ["pre_2023", "LOCONI", null, "prod_cam_01", "talla_M", "98", "col_blanco_03", "HOMBRE", 25],
  ["pre_2024", "HADA", null, "prod_cam_01", "talla_M", "8", "col_blanco_03", "MUJER", 25],
  ["pre_2025", "PATRICIA A.", null, "prod_cam_01", "talla_M", "10", "col_blanco_03", "MUJER", 25],
  ["pre_2026", "CYNTHIA", null, "prod_cam_01", "talla_L", "25", "col_blanco_03", "MUJER", 25],
  ["pre_2027", "TAPIA", null, "prod_kit_01", "talla_L", "23", "col_azul_02", "HOMBRE", 45],
  ["pre_2028", "CLINT", null, "prod_cam_01", "talla_XL", "69", "col_azul_02", "HOMBRE", 28],
];

const prendas: PrendaDbDto[] = filas.map(([id, nombreEnPrenda, nombrePersona, productoId, tallaId, numero, colorId, genero, precio]) => ({
  id,
  participanteId: participanteIdPara(nombreEnPrenda, nombrePersona),
  grupoId: "grp_PROMO2002",
  tipoProductoId: productoId,
  tallaId,
  numero,
  genero,
  tipoPrenda: "VENTA",
  colorId,
  nombreEnPrenda,
  esArquero: false,
  precioCalculado: precio,
}));

function participanteIdPara(nombreEnPrenda: string, nombrePersona: string | null): string {
  if (nombrePersona) return "part_luis_chaponna";
  const clave = nombreEnPrenda.toLowerCase().replace(/[^a-z]/g, "");
  return `part_${clave}`;
}

const nombrePersonaClint = "CLINT";
const participantesIds = new Set(prendas.map((p) => p.participanteId));
const participantes = Array.from(participantesIds).map((id) => ({
  id,
  grupoId: "grp_PROMO2002",
  nombrePersona:
    id === "part_luis_chaponna" ? "Luis Chapoñán Vera" : id === "part_clint" ? nombrePersonaClint : id.replace(/^part_/, "").toUpperCase(),
  estado: "CONFIRMADO" as const,
  enlaceToken: `tok_${id}_8492`,
  enlaceExpiraEn: "2026-09-17T23:59:59Z",
  enlaceRevocado: false,
  registradoEn: "2026-08-08T15:30:00Z",
  confirmadoEn: "2026-08-10T18:00:00Z",
}));

const excepcionesPrenda = [
  "pre_2019",
  "pre_2021",
  "pre_2022",
  "pre_2024",
  "pre_2025",
  "pre_2026",
].map((prendaId, i) => ({
  id: `exc_3${i + 1}01`,
  prendaId,
  atributoId: "attr_corte",
  valorAtributoId: "val_corte_entallado",
  motivo: "Corte damas Entallado según diseño aprobado",
}));

const personalizaciones = Object.entries(personalizacionesEspeciales).map(([prendaId, contenido], i) => ({
  id: `pers_4${i + 1}01`,
  prendaId,
  ubicacionId: "ubic_pecho",
  contenido,
}));

export const seedPedidoPromo2002: DbSimuladorDto = {
  pedidos: [
    {
      id: "ped_promo_2002",
      grupoId: "grp_PROMO2002",
      codigo: "SUB-000842",
      estado: "En Producción",
      tipoPrendaPrincipal: "Kit completo",
      identificacion: {
        numero: "SUB-000842",
        versionHoja: "4.0",
        fecha: "2026-08-07",
        fechaVersion: "2026-08-07",
        clienteGrupo: "PROMO 2002",
        rucDni: "",
        coordinadorCliente: "Coordinador de la promoción",
        telefono: "+51 966 826 524",
        vendedora: "",
        fechaEntrega: "2026-08-18",
        modalidadEntrega: "Agencia a provincia",
        ciudad: "Chiclayo",
      },
      disenoAprobado: {
        versionMockup: "v4",
        fechaAprobacion: "2026-08-07",
        aprobadoPor: "Coordinador del cliente",
        archivoMockup: "Aprobado por WhatsApp",
        temaPrincipal: "Win Fresh",
        manga: "Corta",
        cuelloHombresId: "cuello_redondo",
        cuelloDamasId: "cuello_redondo",
        corteHombresId: "val_corte_recto",
        corteDamasId: "val_corte_entallado",
        ribCuello: true,
        ribMangas: false,
        acabadoEscudosId: "acab_sublimado",
        shortTelaId: "tela_win_fresh",
      },
      colores: [
        { id: "col_blanco_03", nombre: "Blanco hueso", codigoHex: "#F7F4F2", referencia: "Pendiente de referencia física" },
        { id: "col_azul_02", nombre: "Azul", codigoHex: "#2B4E7A", referencia: "Pendiente de referencia física" },
      ],
      ubicacionesEstampado: [
        { id: "ubic_pecho", etiqueta: "Pecho / delantero", lleva: true, contenido: 'Texto "PROMO 2002", insignia del colegio bordada y sponsors correspondientes' },
        { id: "ubic_espalda", etiqueta: "Espalda", lleva: true, contenido: "Nombre, número y sponsor" },
        { id: "ubic_cuello_delantero", etiqueta: "Cuello delantero", lleva: false, contenido: null },
        { id: "ubic_cuello_posterior", etiqueta: "Cuello posterior", lleva: false, contenido: null },
        { id: "ubic_manga_izquierda", etiqueta: "Manga izquierda", lleva: true, contenido: 'Copa y texto "COPA 2026"' },
        { id: "ubic_manga_derecha", etiqueta: "Manga derecha", lleva: true, contenido: "Insignia del campeonato" },
        { id: "ubic_short_delantero", etiqueta: "Short delantero", lleva: true, contenido: "Insignia del colegio lado derecho, número lado izquierdo" },
        { id: "ubic_short_posterior", etiqueta: "Short posterior", lleva: true, contenido: "Sponsors correspondientes" },
        { id: "ubic_sponsor_1", etiqueta: "Sponsor 1 — texto y teléfono", lleva: true, contenido: null },
        { id: "ubic_sponsor_2", etiqueta: "Sponsor 2 — texto y teléfono", lleva: false, contenido: null },
      ],
      envioProvincia: {
        nombreCompleto: "",
        dni: "",
        celular: "",
        ciudadDestino: "Chiclayo",
        agencia: "",
        referencia: "",
        correo: "",
      },
      controlCambios: [],
      valoresGrupo: {
        corteId: "val_corte_recto",
        cuelloId: "cuello_redondo",
        telaId: "tela_win_fresh",
        escudo: true,
        acabadoEscudoId: "acab_sublimado",
      },
    },
  ],
  participantes,
  prendas,
  excepcionesPrenda,
  personalizaciones,
  resumenProduccion: {
    pedidoId: "ped_promo_2002",
    totalPrendas: prendas.length,
    desgloseTiposPrenda: {
      venta: prendas.filter((p) => p.tipoPrenda === "VENTA").length,
      obsequio: prendas.filter((p) => p.tipoPrenda === "OBSEQUIO").length,
      muestra: prendas.filter((p) => p.tipoPrenda === "MUESTRA").length,
    },
    piezasFisicas: {
      totalCamisetas: prendas.reduce((acc, p) => acc + productosPorId(p.tipoProductoId).componentes.camisetas, 0),
      totalShorts: prendas.reduce((acc, p) => acc + productosPorId(p.tipoProductoId).componentes.shorts, 0),
      totalMedias: prendas.reduce((acc, p) => acc + productosPorId(p.tipoProductoId).componentes.medias, 0),
    },
    importeTotalEstimado: redondear2(prendas.reduce((acc, p) => acc + p.precioCalculado, 0)),
  },
  catalogos: {
    productos,
    tallas,
    telas,
    cuellos,
    acabados,
    cortes,
    colores,
    parametros,
    listas,
  },
};