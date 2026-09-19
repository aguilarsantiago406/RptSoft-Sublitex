import { describe, expect, it } from "vitest";
import { ETIQUETAS_FALTANTES, estaCompleta, queFalta } from "@/domain/validacion";

describe("validacion ficha mínima", () => {
  it("prenda completa pasa sin faltantes", () => {
    expect(
      queFalta({ genero: "Hombre", corte: "Recto", talla: "M", numero: "7", color: "Blanco hueso" }),
    ).toEqual([]);
    expect(estaCompleta({ genero: "Hombre", corte: "Recto", talla: "M", numero: "7", color: "Blanco hueso" })).toBe(true);
  });

  it("lista los campos que faltan en orden estable", () => {
    const faltantes = queFalta({ genero: null, corte: "Recto", talla: null, numero: "", color: null });
    expect(faltantes).toEqual([
      ETIQUETAS_FALTANTES.genero,
      ETIQUETAS_FALTANTES.talla,
      ETIQUETAS_FALTANTES.numero,
      ETIQUETAS_FALTANTES.color,
    ]);
  });

  it("S/N en el número es válido (R-K04)", () => {
    expect(estaCompleta({ genero: "Hombre", corte: "Recto", talla: "M", numero: "S/N", color: "Blanco hueso" })).toBe(true);
  });
});