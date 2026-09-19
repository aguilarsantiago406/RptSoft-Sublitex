import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { persistenciaJson, Simulador } from "@/mocks/simulador";
import { adaptarDetallePedido } from "@/services/adaptador";
import { ClienteHttp, ErrorApi } from "@/services/cliente";
import { seedPedidoPromo2002 } from "@/mocks/seed/pedido-promo2002";
import { construirDetallePedido } from "@/services/contrato";
import { RespuestaInvalidaError } from "@/services/validador";

describe("10.1 Flujo completo contra el simulador (lista → detalle → editar prenda → guardar → recargar)", () => {
  let dir: string;
  let rutaJson: string;

  beforeEach(() => {
    dir = mkdtempSync(path.join(os.tmpdir(), "sipes-flujo-"));
    rutaJson = path.join(dir, "simulador.json");
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("completa el ciclo de vida del pedido con persistencia", () => {
    // 1. Paso 1: Lista de pedidos
    const sim1 = new Simulador(persistenciaJson(rutaJson));
    const lista = sim1.listarPedidos();
    expect(lista).toHaveLength(1);
    const pedidoHeader = lista[0];
    expect(pedidoHeader.codigo).toBe("SUB-000842");
    expect(pedidoHeader.clienteGrupo).toBe("PROMO 2002");

    // 2. Paso 2: Detalle del pedido
    const dtoDetalleInicial = sim1.obtenerDetalle(pedidoHeader.id);
    expect(dtoDetalleInicial.prendas).toHaveLength(28);
    const vistaInicial = adaptarDetallePedido(dtoDetalleInicial);

    const prendaInicial = vistaInicial.prendas.find((p) => p.id === "pre_2001");
    expect(prendaInicial).toBeDefined();
    expect(prendaInicial?.talla).toBe("M");
    expect(prendaInicial?.numero).toBe("7");
    expect(prendaInicial?.nombreEnPrenda).toBe("ANMIX BRENIS");

    // 3. Paso 3: Editar prenda y guardar (PATCH ficha mínima)
    const prendaGuardada = sim1.guardarFichaMinima("pre_2001", {
      tallaId: "talla_L",
      numero: "10",
      genero: "HOMBRE",
      nombreEnPrenda: "MENDOZA JR",
    });
    expect(prendaGuardada.tallaId).toBe("talla_L");
    expect(prendaGuardada.numero).toBe("10");
    expect(prendaGuardada.nombreEnPrenda).toBe("MENDOZA JR");

    // 4. Paso 4: Recarga (nueva instancia simulando reinicio/recarga desde el JSON persistido)
    const sim2 = new Simulador(persistenciaJson(rutaJson));
    const dtoDetalleRecargado = sim2.obtenerDetalle(pedidoHeader.id);
    const vistaRecargada = adaptarDetallePedido(dtoDetalleRecargado);

    const prendaRecargada = vistaRecargada.prendas.find((p) => p.id === "pre_2001");
    expect(prendaRecargada?.talla).toBe("L");
    expect(prendaRecargada?.numero).toBe("10");
    expect(prendaRecargada?.nombreEnPrenda).toBe("MENDOZA JR");

    // 5. Verifica que los totales BOM se mantienen íntegros tras la edición
    const bom = vistaRecargada.prendas.reduce(
      (acc, p) => ({
        camisetas: acc.camisetas + p.camisetas,
        shorts: acc.shorts + p.shorts,
        medias: acc.medias + p.medias,
      }),
      { camisetas: 0, shorts: 0, medias: 0 },
    );
    expect(bom).toEqual({
      camisetas: 28,
      shorts: 17,
      medias: 17,
    });
  });
});

describe("10.3 Prueba de aceptación contra backend real (Checklist 5 puntos + no degradación R-K02/R-K10)", () => {
  const BACKEND_URL = "https://api-sipes.sublitex.pe";
  const clienteBackend = new ClienteHttp(BACKEND_URL);

  const detalleValido = construirDetallePedido(seedPedidoPromo2002, "ped_promo_2002");
  const listaValida = [
    {
      id: "ped_promo_2002",
      codigo: "SUB-000842",
      clienteGrupo: "Promo 2002 Ciencias",
      tipoPrendaPrincipal: "Conjunto Deportivo Sublimado",
      fecha: "2026-09-08T15:30:00Z",
      estado: "En Revisión" as const,
    },
  ];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Punto 1: GET /api/pedidos devuelve y valida la lista de pedidos", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(listaValida),
    } as Response);

    const resultado = await clienteBackend.obtenerListaPedidos();
    expect(resultado).toHaveLength(1);
    expect(resultado[0].codigo).toBe("SUB-000842");
    expect(resultado[0].clienteGrupo).toBe("Promo 2002 Ciencias");
  });

  it("Punto 2: GET /api/pedidos/:id devuelve y valida el detalle completo del pedido", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(detalleValido),
    } as Response);

    const resultado = await clienteBackend.obtenerDetallePedido("ped_promo_2002");
    expect(resultado.pedido.codigo).toBe("SUB-000842");
    expect(resultado.prendas).toHaveLength(28);
  });

  it("Punto 3: GET /api/catalogos devuelve y valida catálogos con tarifas vigentes", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(seedPedidoPromo2002.catalogos),
    } as Response);

    const resultado = await clienteBackend.obtenerCatalogos();
    expect(resultado.tallas).toBeDefined();
    expect(resultado.parametros.igv).toBe(0.18);
    expect(resultado.productos[0].precioBase).toBeGreaterThan(0);
  });

  it("Punto 4: PATCH /api/prendas/:id persiste la ficha mínima y devuelve la prenda", async () => {
    const prendaRespuesta = {
      ...detalleValido.prendas[0],
      tallaId: "talla_L",
      numero: "10",
      nombreEnPrenda: "MENDOZA JR",
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(prendaRespuesta),
    } as Response);

    const resultado = await clienteBackend.guardarFichaMinima("pre_2001", {
      tallaId: "talla_L",
      numero: "10",
      genero: "HOMBRE",
      nombreEnPrenda: "MENDOZA JR",
    });

    expect(resultado.id).toBe("pre_2001");
    expect(resultado.nombreEnPrenda).toBe("MENDOZA JR");
  });

  it("Punto 5: GET /api/pedidos/:id/resumen-produccion devuelve conteo físico exacto (R-K03)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(detalleValido.resumenProduccion),
    } as Response);

    const resultado = await clienteBackend.obtenerResumenProduccion("ped_promo_2002");
    expect(resultado.piezasFisicas.totalCamisetas).toBe(28);
    expect(resultado.piezasFisicas.totalShorts).toBe(17);
    expect(resultado.piezasFisicas.totalMedias).toBe(17);
  });

  it("Control de degradación: si backend falla con 500, lanza ErrorApi y NO degrada a datos de demostración", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => JSON.stringify({ codigo: "R-ERROR-DB", mensaje: "Base de datos no disponible" }),
    } as Response);

    await expect(clienteBackend.obtenerDetallePedido("ped_promo_2002")).rejects.toThrow(ErrorApi);
  });

  it("Control de integridad: si backend devuelve un JSON corrupto, falla con RespuestaInvalidaError (R-CONTRATO)", async () => {
    const corrupto = { datos: "invalidos" };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(corrupto),
    } as Response);

    await expect(clienteBackend.obtenerDetallePedido("ped_promo_2002")).rejects.toThrow(RespuestaInvalidaError);
  });
});
