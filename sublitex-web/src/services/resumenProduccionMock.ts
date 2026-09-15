import type { DesgloseTalla, ResumenProduccion } from "@/types/pedidos";
import type { CatalogoCompleto } from "@/types/prendas";
import { calcularPiezas, totalPiezas } from "@/domain/calculoPiezas";
import { catalogoMock } from "@/services/catalogoMock";
import { grupoPrendasMock } from "@/services/grupoPrendasMock";

/**
 * ARCHIVO DE DATOS MOCK: resumen de producción — GET /api/pedidos/:id/resumen-produccion.
 * Las piezas se CALCULAN sumando el BOM (R-K03) de cada prenda del grupo
 * (calcularPiezas), nunca se escriben a mano.
 *
 * El desglose por talla agrupa las prendas por talla y suma el BOM
 * individual para cada una (§6 — Resumen de Producción para Taller).
 */
export function obtenerResumenProduccion(
  pedidoId: string
): ResumenProduccion | null {
  if (pedidoId !== "ped_001") return null;

  const { grupo, prendas } = grupoPrendasMock;
  const piezas = totalPiezas(
    prendas.map((p) => p.producto),
    catalogoMock
  );

  const porTalla = computarPorTalla(prendas, catalogoMock);

  return {
    pedidoId,
    grupoId: grupo.id,
    grupoNombre: grupo.nombre,
    totalPrendas: prendas.length,
    camisetas: piezas.camisetas,
    shorts: piezas.shorts,
    medias: piezas.medias,
    porTalla,
  };
}

function computarPorTalla(
  prendas: { talla: string; producto: string }[],
  catalogo: CatalogoCompleto
): DesgloseTalla[] {
  const agrupado = new Map<string, { prendas: number; camisetas: number; shorts: number; medias: number }>();

  for (const prenda of prendas) {
    const talla = prenda.talla;
    const piezas = calcularPiezas(prenda.producto, catalogo);
    const actual = agrupado.get(talla) ?? {
      prendas: 0,
      camisetas: 0,
      shorts: 0,
      medias: 0,
    };
    actual.prendas += 1;
    actual.camisetas += piezas.camisetas;
    actual.shorts += piezas.shorts;
    actual.medias += piezas.medias;
    agrupado.set(talla, actual);
  }

  return Array.from(agrupado.entries())
    .map(([talla, totales]) => ({ talla, ...totales }))
    .sort((a, b) => a.talla.localeCompare(b.talla, "es", { numeric: true }));
}