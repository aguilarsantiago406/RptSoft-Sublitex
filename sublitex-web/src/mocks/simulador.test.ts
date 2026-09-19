import { describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { persistenciaJson, Simulador, SimuladorConflicto, esDorsalRepetido, dorsalBloqueado } from "@/mocks/simulador";
import { seedPedidoPromo2002 } from "@/mocks/seed/pedido-promo2002";

function simuladorConPersistencia() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "sipes-sim-"));
  const ruta = path.join(dir, "simulador.json");
  const simulador = new Simulador(persistenciaJson(ruta));
  return { simulador, ruta, dir };
}

describe("simulador local", () => {
  it("si no existe el archivo, siembra el seed PROMO 2002", () => {
    const { simulador } = simuladorConPersistencia();
    expect(simulador.listarPedidos()).toHaveLength(1);
    expect(simulador.listarPedidos()[0].codigo).toBe("SUB-000842");
    expect(simulador.obtenerDetalle("ped_promo_2002").prendas).toHaveLength(28);
  });

  it("persiste y conserva la ficha editada tras recargar (misma forma del contrato)", () => {
    const { simulador, ruta, dir } = simuladorConPersistencia();
    const guardada = simulador.guardarFichaMinima("pre_2001", {
      tallaId: "talla_L",
      numero: "10",
      genero: "HOMBRE",
      nombreEnPrenda: "MENDOZA JR",
    });
    expect(guardada.nombreEnPrenda).toBe("MENDOZA JR");
    expect(existsSync(ruta)).toBe(true);

    const recargado = new Simulador(persistenciaJson(ruta));
    const prenda = recargado.obtenerDetalle("ped_promo_2002").prendas.find((p) => p.id === "pre_2001");
    expect(prenda?.numero).toBe("10");
    expect(prenda?.nombreEnPrenda).toBe("MENDOZA JR");
    rmSync(dir, { recursive: true, force: true });
  });

  it("rechaza una ficha mínima inválida con 400", () => {
    const { simulador } = simuladorConPersistencia();
    expect(() => simulador.guardarFichaMinima("pre_2001", { tallaId: null, numero: null, genero: null } as never)).toThrow(SimuladorConflicto);
  });

  it("PROMO 2002 (política LIBRE) permite dorsales repetidos (R-K04)", () => {
    const { simulador } = simuladorConPersistencia();
    const otras = simulador.obtenerDetalle("ped_promo_2002").prendas.filter((p) => p.id !== "pre_2001");
    const dorsalDeOtra = otras[0]?.numero ?? "7";
    expect(() =>
      simulador.guardarFichaMinima("pre_2001", { tallaId: "talla_L", numero: dorsalDeOtra, genero: "HOMBRE", nombreEnPrenda: "MENDOZA" }),
    ).not.toThrow();
  });

  it("con política UNICA un dorsal repetido se detecta como conflicto", () => {
    const { simulador } = simuladorConPersistencia();
    const conflicto = seedPedidoPromo2002;
    const otraPrenda = conflicto.prendas.find((p) => p.id !== "pre_2001");
    const politicaUnica = { grp_PROMO2002: "UNICA" as const };
    expect(esDorsalRepetido(conflicto, "pre_2001", otraPrenda?.numero ?? "7", politicaUnica)).toBe(true);
    expect(esDorsalRepetido(conflicto, "pre_2001", "7", politicaUnica)).toBe(
      conflicto.prendas.some((p) => p.id !== "pre_2001" && p.grupoId === "grp_PROMO2002" && p.numero === "7"),
    );
    expect(() => simulador.guardarFichaMinima("pre_2001", { tallaId: null, numero: null, genero: null } as never)).toThrow(SimuladorConflicto);
  });

  it("dorsal vacío o S/N queda fuera de la unicidad", () => {
    expect(dorsalBloqueado(null)).toBe(false);
    expect(dorsalBloqueado("")).toBe(false);
    expect(dorsalBloqueado("S/N")).toBe(false);
    expect(dorsalBloqueado("s/n")).toBe(false);
    expect(dorsalBloqueado("7")).toBe(true);
  });
});