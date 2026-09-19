import { describe, expect, it } from "vitest";
import { calcularBom, desglosarProductos } from "@/domain/bom";

describe("bom (R-K03)", () => {
  it("multiplica componentes por prenda, no cuenta filas", () => {
    const bom = calcularBom([
      { tipoProductoId: "prod_kit_01", nombre: "Kit completo", componentes: { camisetas: 1, shorts: 1, medias: 1 } },
      { tipoProductoId: "prod_kit_01", nombre: "Kit completo", componentes: { camisetas: 1, shorts: 1, medias: 1 } },
      { tipoProductoId: "prod_cam_01", nombre: "Camiseta sola", componentes: { camisetas: 1, shorts: 0, medias: 0 } },
    ]);
    expect(bom.totalPrendas).toBe(3);
    expect(bom.piezas).toEqual({ camisetas: 3, shorts: 2, medias: 2 });
  });

  it("pedido sin prendas devuelve ceros", () => {
    expect(calcularBom([])).toEqual({ totalPrendas: 0, piezas: { camisetas: 0, shorts: 0, medias: 0 } });
  });

  it("agrupa desglose por tipo de producto", () => {
    const desglose = desglosarProductos([
      { tipoProductoId: "prod_cam_01", nombre: "Camiseta sola", componentes: { camisetas: 1, shorts: 0, medias: 0 } },
      { tipoProductoId: "prod_kit_01", nombre: "Kit completo", componentes: { camisetas: 1, shorts: 1, medias: 1 } },
      { tipoProductoId: "prod_cam_01", nombre: "Camiseta sola", componentes: { camisetas: 1, shorts: 0, medias: 0 } },
    ]);
    expect(desglose).toHaveLength(2);
    const camisetas = desglose.find((d) => d.tipoProductoId === "prod_cam_01");
    expect(camisetas?.cantidad).toBe(2);
    expect(camisetas?.componentes).toEqual({ camisetas: 2, shorts: 0, medias: 0 });
  });
});