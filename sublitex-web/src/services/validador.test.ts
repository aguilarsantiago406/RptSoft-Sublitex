import { describe, expect, it } from "vitest";
import { construirDetallePedido } from "@/services/contrato";
import { seedPedidoPromo2002 } from "@/mocks/seed/pedido-promo2002";
import {
  esCatalogosDto,
  esFichaMinima,
  esPedidoDetalleDto,
  esPrendaDto,
  esResumenProduccionDto,
  RespuestaInvalidaError,
  validarRespuesta,
} from "@/services/validador";

const detalleValido = construirDetallePedido(seedPedidoPromo2002, "ped_promo_2002");

describe("validador de respuestas (contrato BK2 v2.1)", () => {
  it("acepta el detalle correcto del simulador", () => {
    expect(esPedidoDetalleDto(detalleValido)).toBe(true);
  });

  it("rechaza un DTO corrupto (prenda sin tipoProductoId)", () => {
    const corrupto = JSON.parse(JSON.stringify(detalleValido));
    delete corrupto.prendas[0].tipoProductoId;
    expect(esPedidoDetalleDto(corrupto)).toBe(false);
  });

  it("rechaza tipoPrenda fuera del enum", () => {
    const corrupto = JSON.parse(JSON.stringify(detalleValido));
    corrupto.prendas[0].tipoPrenda = "GRATIS";
    expect(esPedidoDetalleDto(corrupto)).toBe(false);
  });

  it("rechaza estado de pedido desconocido", () => {
    const corrupto = JSON.parse(JSON.stringify(detalleValido));
    corrupto.pedido.estado = "PAGADO";
    expect(esPedidoDetalleDto(corrupto)).toBe(false);
  });

  it("rechaza precio no numérico", () => {
    const corrupto = JSON.parse(JSON.stringify(detalleValido));
    corrupto.prendas[5].precioCalculado = "55.00";
    expect(esPedidoDetalleDto(corrupto)).toBe(false);
  });

  it("rechaza catálogos sin parametros", () => {
    const corrupto = JSON.parse(JSON.stringify(seedPedidoPromo2002.catalogos));
    delete corrupto.parametros;
    expect(esCatalogosDto(corrupto)).toBe(false);
  });

  it("resumen de producción válido", () => {
    expect(esResumenProduccionDto(detalleValido.resumenProduccion)).toBe(true);
    expect(esResumenProduccionDto({ ...detalleValido.resumenProduccion, totalPrendas: "3" })).toBe(false);
  });

  it("ficha mínima válida e inválida", () => {
    expect(esFichaMinima({ tallaId: "talla_M", numero: "7", genero: "HOMBRE", nombreEnPrenda: "MENDOZA" })).toBe(true);
    expect(esFichaMinima({ tallaId: 5, numero: null, genero: null, nombreEnPrenda: "X" })).toBe(false);
    expect(esFichaMinima({ tallaId: null, numero: "S/N", genero: null, nombreEnPrenda: "ANA" })).toBe(true);
  });

  it("prenda aislada válida", () => {
    expect(esPrendaDto(detalleValido.prendas[0])).toBe(true);
    expect(esPrendaDto(detalleValido.prendas[0].personalizaciones)).toBe(false);
  });

  it("validarRespuesta lanza RespuestaInvalidaError cuando falla el guard", () => {
    expect(() => validarRespuesta("GET /api/pedidos/x", esPedidoDetalleDto, { hola: 1 })).toThrow(RespuestaInvalidaError);
    expect(() => validarRespuesta("GET /api/pedidos/x", esPedidoDetalleDto, { hola: 1 })).toThrow(/pedidos\/x/);
  });
});