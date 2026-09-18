import { describe, expect, it } from "vitest";
import { resumirGrupo } from "./resumenGrupo";
import type { CatalogoCompleto, PrendaItem } from "@/types/prendas";

// =============================================================================
// Fixtures fieles al catálogo real (RptSoft-Sublitex)
// =============================================================================

const catalogo: CatalogoCompleto = {
  productos: [
    { codigo: "CAMISETA", nombre: "Camiseta", orden: 1, componentes: { camisetas: 1, shorts: 0, medias: 0 } },
    { codigo: "KIT", nombre: "Kit completo", orden: 2, componentes: { camisetas: 1, shorts: 1, medias: 1 } },
  ],
  tallasPorProducto: [],
  atributos: [
    { codigo: "TALLA", nombre: "Talla", obligatorio: true, criticoProduccion: false, valores: [] },
    { codigo: "TELA", nombre: "Tela", obligatorio: true, criticoProduccion: true, valores: [] },
    { codigo: "CUELLO", nombre: "Cuello", obligatorio: true, criticoProduccion: true, valores: [] },
    { codigo: "COLOR", nombre: "Color", obligatorio: true, criticoProduccion: false, valores: [] },
    { codigo: "ACABADO", nombre: "Acabado", obligatorio: false, criticoProduccion: false, valores: [] },
    { codigo: "CORTE", nombre: "Corte", obligatorio: true, criticoProduccion: false, valores: [] },
  ],
  ubicaciones: [
    { codigo: "PECHO", etiqueta: "Pecho", orden: 1 },
    { codigo: "CUELLO_DELANTERO", etiqueta: "Cuello delantero", orden: 2 },
  ],
  generos: [],
  tiposPrenda: ["VENTA", "OBSEQUIO", "MUESTRA"],
};

function prendaCon(overrides: Partial<PrendaItem> = {}): PrendaItem {
  return {
    id: "p1",
    participanteId: "part_1",
    nombrePersona: "Juan Pérez",
    nombreEnPrenda: "JUAN",
    producto: "KIT",
    talla: "L",
    numero: "7",
    genero: "HOMBRE",
    tipoPrenda: "VENTA",
    esArquero: false,
    color: { id: "c1", nombre: "Blanco hueso", codigoHex: "#F7F4F2" },
    valores: [
      { atributo: "TALLA", valor: "L", origen: "HEREDADO" },
      { atributo: "TELA", valor: "DRY_FIT", origen: "HEREDADO" },
      { atributo: "CUELLO", valor: "REDONDO", origen: "HEREDADO" },
      { atributo: "CORTE", valor: "RECTO", origen: "HEREDADO" },
      { atributo: "ACABADO", valor: "NINGUNO", origen: "HEREDADO" },
    ],
    personalizaciones: [],
    ...overrides,
  };
}

// =============================================================================
// R-C07 — resumen de excepciones por atributo, con conteo y acceso al detalle
// =============================================================================

describe("R-C07 · resumen de excepciones por atributo", () => {
  it("agrupa excepciones por (atributo, valor) con prendaIds", () => {
    const prendas = [
      prendaCon({ id: "p12", numero: "2", valores: [
        { atributo: "CORTE", valor: "ENTALLADO", origen: "EXCEPCION" },
      ] }),
      prendaCon({ id: "p13", numero: "6", valores: [
        { atributo: "CORTE", valor: "ENTALLADO", origen: "EXCEPCION" },
      ] }),
    ];
    const res = resumirGrupo(prendas, catalogo, 10, "LIBRE");
    const corte = res.excepcionesPorAtributo.find((a) => a.atributo === "CORTE");
    expect(corte).toBeDefined();
    expect(corte?.total).toBe(2);
    expect(corte?.porValor).toEqual([
      { valor: "ENTALLADO", cantidad: 2, prendaIds: ["p12", "p13"] },
    ]);
  });

  it("sin excepciones devuelve lista vacía", () => {
    const res = resumirGrupo([prendaCon()], catalogo, 10, "LIBRE");
    expect(res.excepcionesPorAtributo).toEqual([]);
  });

  it("usa el nombre del catálogo para el atributo", () => {
    const res = resumirGrupo(
      [prendaCon({ valores: [{ atributo: "CORTE", valor: "ENTALLADO", origen: "EXCEPCION" }] })],
      catalogo, 10, "LIBRE"
    );
    expect(res.excepcionesPorAtributo[0].nombreAtributo).toBe("Corte");
  });
});

// =============================================================================
// R-G05 — dorsales repetidos: información, nunca alerta bloqueante
// =============================================================================

describe("R-G05 · dorsales repetidos", () => {
  it("detecta repeticiones reales sobre prendas distintas", () => {
    const prendas = [
      prendaCon({ id: "p01", numero: "69" }),
      prendaCon({ id: "p02", numero: "69" }),
      prendaCon({ id: "p03", numero: "7" }),
      prendaCon({ id: "p18", numero: "7" }),
    ];
    const res = resumirGrupo(prendas, catalogo, 10, "LIBRE");
    expect(res.numerosRepetidos).toHaveLength(2);
    const n69 = res.numerosRepetidos.find((r) => r.numero === "69");
    expect(n69?.cantidad).toBe(2);
    expect(n69?.prendaIds).toEqual(["p01", "p02"]);
  });

  it("la política LIBRE marca INFO (nunca bloqueante — R-G05)", () => {
    const res = resumirGrupo(
      [prendaCon({ id: "a", numero: "7" }), prendaCon({ id: "b", numero: "7" })],
      catalogo, 10, "LIBRE"
    );
    expect(res.numerosRepetidos[0].severidad).toBe("INFO");
  });

  it("política única/desconocida marca AVISO", () => {
    const res = resumirGrupo(
      [prendaCon({ id: "a", numero: "7" }), prendaCon({ id: "b", numero: "7" })],
      catalogo, 10, "SECUENCIAL"
    );
    expect(res.numerosRepetidos[0].severidad).toBe("AVISO");
  });

  it("excluye dorsales vacíos y S/N (R-K04: son estados válidos)", () => {
    const res = resumirGrupo(
      [
        prendaCon({ id: "a", numero: "" }),
        prendaCon({ id: "b", numero: "S/N" }),
        prendaCon({ id: "c", numero: "S/N" }),
      ],
      catalogo, 10, "LIBRE"
    );
    expect(res.numerosRepetidos).toEqual([]);
  });
});

// =============================================================================
// R-B02 — discrepancia contra la cantidad contratada
// =============================================================================

describe("R-B02 · discrepancia contra cantidad contratada", () => {
  it("registrado menor → FALTAN con diferencia negativa", () => {
    const res = resumirGrupo([prendaCon(), prendaCon({ id: "b" })], catalogo, 12, "LIBRE");
    expect(res.discrepancia).toEqual({
      contratado: 12,
      registrado: 2,
      diferencia: -10,
      estado: "FALTAN",
    });
  });

  it("iguales → COINCIDE", () => {
    const res = resumirGrupo(
      [prendaCon(), prendaCon({ id: "b" }), prendaCon({ id: "c" })],
      catalogo, 3, "LIBRE"
    );
    expect(res.discrepancia.estado).toBe("COINCIDE");
    expect(res.discrepancia.diferencia).toBe(0);
  });

  it("registrado mayor → SOBRAN con diferencia positiva", () => {
    const res = resumirGrupo(
      [prendaCon(), prendaCon({ id: "b" }), prendaCon({ id: "c" })],
      catalogo, 1, "LIBRE"
    );
    expect(res.discrepancia.estado).toBe("SOBRAN");
    expect(res.discrepancia.diferencia).toBe(2);
  });
});

// =============================================================================
// R-E03 — ficha mínima: nombre en prenda + número + talla
// =============================================================================

describe("R-E03 · prendas incompletas (ficha mínima)", () => {
  it("marca la prenda sin talla ni dorsal con sus faltantes", () => {
    const res = resumirGrupo(
      [prendaCon({ id: "p30", talla: "", numero: "" })],
      catalogo, 10, "LIBRE"
    );
    expect(res.prendasIncompletas).toHaveLength(1);
    expect(res.prendasIncompletas[0].prendaId).toBe("p30");
    expect(res.prendasIncompletas[0].faltantes).toContain("talla");
    expect(res.prendasIncompletas[0].faltantes).toContain("dorsal");
  });

  it("prenda completa no aparece", () => {
    const res = resumirGrupo([prendaCon()], catalogo, 10, "LIBRE");
    expect(res.prendasIncompletas).toEqual([]);
  });
});

// =============================================================================
// R-K03 — producción por producto con BOM del catálogo
// =============================================================================

describe("R-K03 · producción por producto", () => {
  it("agrupa por producto y multiplica el BOM declarado", () => {
    const prendas = [
      prendaCon({ id: "a", producto: "KIT" }),
      prendaCon({ id: "b", producto: "KIT" }),
      prendaCon({ id: "c", producto: "CAMISETA" }),
    ];
    const res = resumirGrupo(prendas, catalogo, 10, "LIBRE");
    const kit = res.produccionPorProducto.find((pp) => pp.productoCodigo === "KIT");
    const camiseta = res.produccionPorProducto.find((pp) => pp.productoCodigo === "CAMISETA");
    expect(kit?.cantidad).toBe(2);
    expect(kit?.piezas).toEqual({ camisetas: 2, shorts: 2, medias: 2 });
    expect(camiseta?.cantidad).toBe(1);
    expect(camiseta?.piezas).toEqual({ camisetas: 1, shorts: 0, medias: 0 });
  });

  it("producto inexistente en catálogo → piezas cero, nunca error (R-K03)", () => {
    const res = resumirGrupo([prendaCon({ producto: "INEXISTENTE" })], catalogo, 10, "LIBRE");
    expect(res.produccionPorProducto).toHaveLength(1);
    expect(res.produccionPorProducto[0].piezas).toEqual({ camisetas: 0, shorts: 0, medias: 0 });
  });
});

// =============================================================================
// R-F03 — personalización con ubicación fuera del catálogo = inválida
// =============================================================================

describe("R-F03 · personalizaciones inválidas", () => {
  it("ubicación fuera del catálogo cerrado → inválida", () => {
    const res = resumirGrupo(
      [
        prendaCon({
          id: "p03",
          personalizaciones: [{ ubicacion: "HOMBRO", contenido: "Nombre hijo" }],
        }),
      ],
      catalogo, 10, "LIBRE"
    );
    expect(res.personalizacionesInvalidas).toHaveLength(1);
    expect(res.personalizacionesInvalidas[0].ubicacion).toBe("HOMBRO");
    expect(res.personalizacionesInvalidas[0].contenido).toBe("Nombre hijo");
  });

  it("ubicaciones válidas no se marcan", () => {
    const res = resumirGrupo(
      [
        prendaCon({
          personalizaciones: [{ ubicacion: "CUELLO_DELANTERO", contenido: "CLINT" }],
        }),
      ],
      catalogo, 10, "LIBRE"
    );
    expect(res.personalizacionesInvalidas).toEqual([]);
  });
});