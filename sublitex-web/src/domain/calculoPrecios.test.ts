import { describe, expect, it } from "vitest";
import { calcularPrecio, tarifaActiva, valorDe } from "./calculoPrecios";
import { calcularPiezas, totalPiezas } from "./calculoPiezas";
import { calcularTotales } from "./calculoTotales";
import { validarPrenda } from "./validacionPrenda";
import type {
  CatalogoCompleto,
  PrendaItem,
  ResultadoPrecio,
  Tarifa,
} from "@/types/prendas";

// =============================================================================
// Fixtures fieles al contrato real (RptSoft-Sublitex)
// =============================================================================

const tarifas: Tarifa[] = [
  // tarifas PRODUCTO (concepto = código del catálogo) — R-K10
  { id: "t01", tipo: "PRODUCTO", concepto: "CAMISETA", valor: 25, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t05", tipo: "PRODUCTO", concepto: "KIT", valor: 45, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  // vencida: vigenteHasta != null → NO aplica (R-K10: solo vigenteHasta === null)
  { id: "t99", tipo: "PRODUCTO", concepto: "CAMISETA", valor: 99, vigenteDesde: "2025-01-01", vigenteHasta: "2025-12-31", activo: true },
  // inactiva → NO aplica
  { id: "t98", tipo: "PRODUCTO", concepto: "KIT", valor: 35, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: false },
  // recargos
  { id: "t10", tipo: "RECARGO_TALLA", concepto: "XXL", valor: 10, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t20", tipo: "RECARGO_TELA", concepto: "DRY_FIT", valor: 0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t30", tipo: "RECARGO_CUELLO", concepto: "CAMISERO", valor: 0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t40", tipo: "RECARGO_ACABADO", concepto: "BORDADO", valor: 3, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
];

const catalogo: CatalogoCompleto = {
  productos: [
    { codigo: "CAMISETA", nombre: "Camiseta", orden: 1, componentes: { camisetas: 1, shorts: 0, medias: 0 } },
    { codigo: "CAMISETA_SHORT", nombre: "Camiseta + short", orden: 2, componentes: { camisetas: 1, shorts: 1, medias: 0 } },
    { codigo: "KIT", nombre: "Kit completo", orden: 3, componentes: { camisetas: 1, shorts: 1, medias: 1 } },
  ],
  tallasPorProducto: [],
  atributos: [
    { codigo: "TALLA", nombre: "Talla", obligatorio: true, criticoProduccion: false, valores: [] },
    { codigo: "TELA", nombre: "Tela", obligatorio: true, criticoProduccion: true, valores: [] },
    { codigo: "CUELLO", nombre: "Cuello", obligatorio: true, criticoProduccion: true, valores: [] },
    { codigo: "COLOR", nombre: "Color", obligatorio: true, criticoProduccion: false, valores: [] },
    { codigo: "ACABADO", nombre: "Acabado", obligatorio: false, criticoProduccion: false, valores: [] },
  ],
  ubicaciones: [],
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
    color: null,
    valores: [
      { atributo: "TALLA", valor: "L", origen: "HEREDADO" },
      { atributo: "TELA", valor: "DRY_FIT", origen: "HEREDADO" },
      { atributo: "CUELLO", valor: "CAMISERO", origen: "HEREDADO" },
      { atributo: "ACABADO", valor: "BORDADO", origen: "HEREDADO" },
    ],
    personalizaciones: [],
    ...overrides,
  };
}

// =============================================================================
// tarifaActiva — R-K10: solo tarifas activas y vigentes, nunca hardcodeado
// =============================================================================

describe("tarifaActiva", () => {
  it("devuelve la tarifa PRODUCTO vigente y activa (R-K10)", () => {
    expect(tarifaActiva(tarifas, "PRODUCTO", "CAMISETA")).toBe(25);
  });

  it("ignora vencidas (vigenteHasta != null) e inactivas", () => {
    // t99 venció y t98 está inactiva → queda t05 = 45
    expect(tarifaActiva(tarifas, "PRODUCTO", "KIT")).toBe(45);
  });

  it("devuelve 0 si la tarifa no existe (nunca un precio inventado)", () => {
    expect(tarifaActiva(tarifas, "PRODUCTO", "INEXISTENTE")).toBe(0);
  });
});

// =============================================================================
// calcularPrecio — R-K10 (usa tarifas) + R-K02 (OBSEQUIO/MUESTRA → 0)
// =============================================================================

describe("calcularPrecio", () => {
  it("suma base + recargos por talla/tela/cuello/acabado (R-K10)", () => {
    const res: ResultadoPrecio = calcularPrecio(
      prendaCon(), // KIT = 45, talla L (sin recargo), tela DRY_FIT (0), cuello CAMISERO (0), acabado BORDADO (3)
      tarifas
    );
    expect(res.precioBase).toBe(45);
    expect(res.recTalla).toBe(0);
    expect(res.recTela).toBe(0);
    expect(res.recCuello).toBe(0);
    expect(res.recAcabado).toBe(3);
    expect(res.precioUnitario).toBe(48);
  });

  it("OBSEQUIO y MUESTRA no pagan precio unitario (R-K02)", () => {
    const obsequio = calcularPrecio(prendaCon({ tipoPrenda: "OBSEQUIO" }), tarifas);
    const muestra = calcularPrecio(prendaCon({ tipoPrenda: "MUESTRA" }), tarifas);
    expect(obsequio.precioUnitario).toBe(0);
    expect(muestra.precioUnitario).toBe(0);
  });

  it("valorDe resuelve el atributo de la grilla", () => {
    expect(valorDe(prendaCon(), "TELA")).toBe("DRY_FIT");
    expect(valorDe(prendaCon(), "INEXISTENTE")).toBeNull();
  });
});

// =============================================================================
// calcularPiezas / totalPiezas — R-K03 (BOM del catálogo, nunca hardcodeado)
// =============================================================================

describe("calcularPiezas / totalPiezas", () => {
  it("lee el BOM del catálogo (KIT → 1 camiseta, 1 short, 1 media)", () => {
    expect(calcularPiezas("KIT", catalogo)).toEqual({
      camisetas: 1,
      shorts: 1,
      medias: 1,
    });
  });

  it("producto no declarado → ceros, nunca error (R-K03)", () => {
    expect(calcularPiezas("INEXISTENTE", catalogo)).toEqual({
      camisetas: 0,
      shorts: 0,
      medias: 0,
    });
  });

  it("totalPiezas suma el BOM de una lista (R-K03)", () => {
    expect(
      totalPiezas(["KIT", "CAMISETA_SHORT"], catalogo)
    ).toEqual({
      camisetas: 2,
      shorts: 2,
      medias: 1,
    });
  });
});

// =============================================================================
// validarPrenda — R-B06: data-driven sobre el catálogo (atributos obligatorios)
// =============================================================================

describe("validarPrenda", () => {
  it("prenda completa con todos los obligatorios → sin faltantes", () => {
    const prenda = prendaCon({
      color: { id: "c1", nombre: "Rojo", codigoHex: "#FF0000" },
    });
    expect(validarPrenda(prenda, catalogo)).toEqual([]);
  });

  it("marca los atributos obligatorios del catálogo que faltan", () => {
    const prenda = prendaCon({
      producto: "",
      talla: "",
      color: null,
      valores: [], // TELA y CUELLO son obligatorios en el catálogo
    });
    const faltantes = validarPrenda(prenda, catalogo);
    expect(faltantes).toContain("tela");
    expect(faltantes).toContain("cuello");
    expect(faltantes).toContain("color");
  });
});

// =============================================================================
// calcularTotales — R-E07/R-E08: una sola pasada, nada contado a mano
// =============================================================================

describe("calcularTotales", () => {
  it("suma el importe y las piezas de todas las prendas", () => {
    const tot = calcularTotales(
      [prendaCon({ id: "a" }), prendaCon({ id: "b", producto: "CAMISETA" })],
      tarifas,
      catalogo
    );
    // a = KIT 48; b = CAMISETA (25) + talla L 0 + tela 0 + cuello 0 + acabado BORDADO 3 = 28
    expect(tot.importeTotal).toBe(48 + 28);
    // piezas: KIT(1/1/1) + CAMISETA(1/0/0)
    expect(tot.camisetas).toBe(2);
    expect(tot.shorts).toBe(1);
    expect(tot.medias).toBe(1);
  });
});
