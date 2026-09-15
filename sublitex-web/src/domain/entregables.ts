import type { GrupoDetalle } from "@/types/pedidos";

/**
 * Desglose de entregables por grupo — §1 (Frente 1).
 * Cada grupo declara en su tipo de producto los componentes físicos del BOM;
 * aquí se multiplican por la cantidad contratada del grupo.
 */
export interface EntregableGrupo {
  grupoId: string;
  grupoNombre: string;
  cantidadContratada: number;
  camisetas: number;
  shorts: number;
  medias: number;
}

export interface ResumenEntregables {
  grupos: EntregableGrupo[];
  totalPrendas: number;
  totalCamisetas: number;
  totalShorts: number;
  totalMedias: number;
}

export function calcularEntregables(grupos: GrupoDetalle[]): ResumenEntregables {
  const filas = grupos.map((g) => ({
    grupoId: g.id,
    grupoNombre: g.nombre,
    cantidadContratada: g.cantidadContratada,
    camisetas: g.cantidadContratada * g.tipoProducto.componentes.camisetas,
    shorts: g.cantidadContratada * g.tipoProducto.componentes.shorts,
    medias: g.cantidadContratada * g.tipoProducto.componentes.medias,
  }));

  return {
    grupos: filas,
    totalPrendas: filas.reduce((a, g) => a + g.cantidadContratada, 0),
    totalCamisetas: filas.reduce((a, g) => a + g.camisetas, 0),
    totalShorts: filas.reduce((a, g) => a + g.shorts, 0),
    totalMedias: filas.reduce((a, g) => a + g.medias, 0),
  };
}