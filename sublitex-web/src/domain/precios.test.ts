import { describe, expect, it } from "vitest";
import { calcCountSinCosto, calcularPrecioUnitario, desglosarRecargos, esSinCosto, redondear2, recargoTotal } from "@/domain/precios";

describe("precios (R-K10)", () => {
  it("suma base + todos los recargos para una prenda VENTA", () => {
    const precio = calcularPrecioUnitario({
      precioBase: 45,
      recargos: { talla: 3, tela: 0, cuello: 0, acabado: 5 },
      tipoPrecio: "VENTA",
    });
    expect(precio).toBe(53);
  });

  it("OBSEQUIO y MUESTRA siempre valen 0 aunque haya recargos (R-K02)", () => {
    const entrada = { precioBase: 45, recargos: { talla: 3, tela: 5, cuello: 0, acabado: 5 }, tipoPrecio: "VENTA" as const };
    expect(calcularPrecioUnitario({ ...entrada, tipoPrecio: "OBSEQUIO" })).toBe(0);
    expect(calcularPrecioUnitario({ ...entrada, tipoPrecio: "MUESTRA" })).toBe(0);
    expect(esSinCosto("OBSEQUIO")).toBe(true);
    expect(esSinCosto("MUESTRA")).toBe(true);
    expect(esSinCosto("VENTA")).toBe(false);
    expect(calcCountSinCosto(["VENTA", "OBSEQUIO", "MUESTRA", "VENTA"])).toBe(2);
  });

  it("sin recargos el precio es el base", () => {
    expect(
      calcularPrecioUnitario({
        precioBase: 25,
        recargos: { talla: 0, tela: 0, cuello: 0, acabado: 0 },
        tipoPrecio: "VENTA",
      }),
    ).toBe(25);
  });

  it("obsequio/muestra no aportan recargos a la proforma", () => {
    const nulos = desglosarRecargos({ precioBase: 1, recargos: { talla: 3, tela: 0, cuello: 0, acabado: 0 }, tipoPrecio: "OBSEQUIO" });
    expect(nulos).toEqual({ talla: 0, tela: 0, cuello: 0, acabado: 0 });
  });

  it("redondea a 2 decimales", () => {
    expect(redondear2(0.1 + 0.2)).toBe(0.3);
    expect(recargoTotal({ talla: 3, tela: 2.5, cuello: 1, acabado: 1.5 })).toBe(8);
  });
});