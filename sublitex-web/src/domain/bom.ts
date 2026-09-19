export interface ComponentesFisicos {
  camisetas: number;
  shorts: number;
  medias: number;
}

export interface PrendaParaBom {
  tipoProductoId: string;
  nombre: string;
  componentes: ComponentesFisicos;
}

export interface ResumenBom {
  totalPrendas: number;
  piezas: ComponentesFisicos;
}

export function calcularBom(prendas: PrendaParaBom[]): ResumenBom {
  const piezas: ComponentesFisicos = { camisetas: 0, shorts: 0, medias: 0 };
  for (const prenda of prendas) {
    piezas.camisetas += prenda.componentes.camisetas;
    piezas.shorts += prenda.componentes.shorts;
    piezas.medias += prenda.componentes.medias;
  }
  return { totalPrendas: prendas.length, piezas };
}

export interface DesgloseProducto {
  tipoProductoId: string;
  nombre: string;
  cantidad: number;
  componentes: ComponentesFisicos;
}

export function desglosarProductos(prendas: PrendaParaBom[]): DesgloseProducto[] {
  const porProducto = new Map<string, DesgloseProducto>();
  for (const prenda of prendas) {
    const actual = porProducto.get(prenda.tipoProductoId) ?? {
      tipoProductoId: prenda.tipoProductoId,
      nombre: prenda.nombre,
      cantidad: 0,
      componentes: { camisetas: 0, shorts: 0, medias: 0 },
    };
    actual.cantidad += 1;
    actual.componentes.camisetas += prenda.componentes.camisetas;
    actual.componentes.shorts += prenda.componentes.shorts;
    actual.componentes.medias += prenda.componentes.medias;
    porProducto.set(prenda.tipoProductoId, actual);
  }
  return Array.from(porProducto.values());
}