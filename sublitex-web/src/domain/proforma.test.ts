import { describe, expect, it } from "vitest";
import { calcularProforma, calcularSaldo } from "@/domain/proforma";

function camiseta(recargoTalla = 0, tipoPrecio: "VENTA" | "OBSEQUIO" | "MUESTRA" = "VENTA") {
  return {
    tipoProductoId: "prod_cam_01",
    nombreProducto: "Camiseta sola",
    precioBase: 25,
    recargos: { talla: recargoTalla, tela: 0, cuello: 0, acabado: 0 },
    tipoPrecio,
  };
}

function kit(recargoTalla = 0) {
  return {
    tipoProductoId: "prod_kit_01",
    nombreProducto: "Kit completo",
    precioBase: 45,
    recargos: { talla: recargoTalla, tela: 0, cuello: 0, acabado: 0 },
    tipoPrecio: "VENTA" as const,
  };
}

describe("proforma PROMO 2002 (fiel a la hoja real)", () => {
  it("11 camisetas S/25, 17 kits S/45, recargo 3 tallas XL S/9 -> total S/1049, adelanto 50% S/524.5", () => {
    const prendas = [
      ...Array.from({ length: 10 }, () => camiseta()),
      camiseta(3),
      ...Array.from({ length: 15 }, () => kit()),
      kit(3),
      kit(3),
    ];
    const proforma = calcularProforma(prendas, 0.5);

    expect(proforma.lineas).toEqual([
      { descripcion: "Camiseta sola", detalle: "Sublimado — diseño aprobado", cantidad: 11, precioUnitario: 25, subtotal: 275 },
      { descripcion: "Kit completo", detalle: "Sublimado — diseño aprobado", cantidad: 17, precioUnitario: 45, subtotal: 765 },
    ]);
    expect(proforma.recargos).toEqual([{ concepto: "Recargo por tallas especiales", importe: 9 }]);
    expect(proforma.totalSinIgv).toBe(1049);
    expect(proforma.adelantoSugerido).toBe(524.5);
    expect(calcularSaldo(proforma.totalSinIgv, 0)).toBe(1049);
  });

  it("recargos de tela, cuello y acabado suman conceptos por separado", () => {
    const proforma = calcularProforma(
      [
        {
          tipoProductoId: "prod_cam_01",
          nombreProducto: "Camiseta sola",
          precioBase: 25,
          recargos: { talla: 0, tela: 5, cuello: 10, acabado: 5 },
          tipoPrecio: "VENTA" as const,
        },
      ],
      0.5,
    );
    expect(proforma.recargos).toEqual([
      { concepto: "Recargo por tela", importe: 5 },
      { concepto: "Recargo por cuello", importe: 10 },
      { concepto: "Recargo por acabados", importe: 5 },
    ]);
    expect(proforma.totalSinIgv).toBe(45);
    expect(proforma.adelantoSugerido).toBe(22.5);
  });

  it("obsequios y muestras cuentan pero no suman", () => {
    const proforma = calcularProforma([camiseta(0, "OBSEQUIO"), camiseta(0, "MUESTRA")], 0.5);
    expect(proforma.cantidadSinCosto).toBe(2);
    expect(proforma.lineas).toEqual([]);
    expect(proforma.totalSinIgv).toBe(0);
  });

  it("saldo negativo cuando el adelanto supera el total", () => {
    expect(calcularSaldo(100, 120)).toBe(-20);
  });
});