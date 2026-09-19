import { describe, expect, it } from "vitest";
import { construirDetallePedido } from "@/services/contrato";
import { adaptarDetallePedido } from "@/services/adaptador";
import { seedPedidoPromo2002 } from "@/mocks/seed/pedido-promo2002";

describe("adaptador del detalle PROMO 2002", () => {
  const detalle = adaptarDetallePedido(construirDetallePedido(seedPedidoPromo2002, "ped_promo_2002"));

  it("expone 28 prendas", () => {
    expect(detalle.prendas).toHaveLength(28);
  });

  it("las 6 damas con excepción muestran Corte Entallado como excepción", () => {
    const excepcionadas = detalle.prendas.filter((p) => ["pre_2019", "pre_2021", "pre_2022", "pre_2024", "pre_2025", "pre_2026"].includes(p.id));
    expect(excepcionadas).toHaveLength(6);
    for (const prenda of excepcionadas) {
      expect(prenda.corte).toEqual({ id: "val_corte_entallado", nombre: "Entallado", esExcepcion: true });
      expect(prenda.genero).toBe("Mujer");
    }
  });

  it("el resto hereda el Recto del grupo sin excepción", () => {
    const tipica = detalle.prendas.find((p) => p.id === "pre_2001");
    expect(tipica?.corte).toEqual({ id: "val_corte_recto", nombre: "Recto", esExcepcion: false });
  });

  it("CLINT participa con 2 prendas: kit XL blanco y camiseta XL azul", () => {
    const clint = detalle.prendas.filter((p) => p.nombrePersona === "CLINT");
    expect(clint).toHaveLength(2);
    expect(clint.map((p) => p.tipoProductoId).sort()).toEqual(["prod_cam_01", "prod_kit_01"]);
  });

  it("precios derivados: kit base 45 (+3 XL), camiseta 25 (+3 XL)", () => {
    const kit = detalle.prendas.find((p) => p.id === "pre_2015");
    expect(kit?.talla).toBe("XL");
    expect(kit?.precioUnitario).toBe(48);
    const camiseta = detalle.prendas.find((p) => p.id === "pre_2028");
    expect(camiseta?.talla).toBe("XL");
    expect(camiseta?.precioUnitario).toBe(28);
  });

  it("todos VENTA: el total de la proforma da S/1049 (R-K10)", () => {
    const total = detalle.prendas.reduce((acc, p) => acc + p.precioUnitario, 0);
    expect(total).toBe(1049);
  });

  it("BOM: 28 camisetas, 17 shorts, 17 medias (R-K03, kit incluye media)", () => {
    const bom = detalle.prendas.reduce(
      (acc, p) => ({ camisetas: acc.camisetas + p.camisetas, shorts: acc.shorts + p.shorts, medias: acc.medias + p.medias }),
      { camisetas: 0, shorts: 0, medias: 0 },
    );
    expect(bom).toEqual({ camisetas: 28, shorts: 17, medias: 17 });
  });

  it("todas las prendas están completas (qué falta vacío)", () => {
    for (const prenda of detalle.prendas) {
      expect(prenda.queFalta).toEqual([]);
    }
  });

  it("resuelve nombres del diseño aprobado", () => {
    expect(detalle.disenoAprobado.corteDamas).toBe("Entallado");
    expect(detalle.disenoAprobado.corteHombres).toBe("Recto");
    expect(detalle.disenoAprobado.acabadoEscudos).toBe("Sublimado");
    expect(detalle.disenoAprobado.ribCuelloLabel).toBe("Sí");
  });

  it("2 colores y 10 ubicaciones de estampado", () => {
    expect(detalle.colores).toHaveLength(2);
    expect(detalle.ubicacionesEstampado).toHaveLength(10);
  });
});