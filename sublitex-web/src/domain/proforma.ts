import { desglosarRecargos, esSinCosto, redondear2, type EntradaPrecio, type RecargosPrecio } from "@/domain/precios";

export interface PrendaParaProforma extends EntradaPrecio {
  tipoProductoId: string;
  nombreProducto: string;
}

export interface LineaDetalle {
  descripcion: string;
  detalle: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface LineaRecargo {
  concepto: string;
  importe: number;
}

export interface ResultadoProforma {
  lineas: LineaDetalle[];
  recargos: LineaRecargo[];
  cantidadSinCosto: number;
  totalSinIgv: number;
  adelantoSugerido: number;
  percentAdelanto: number;
}

const NOMBRES_RECARGO: Record<keyof RecargosPrecio, string> = {
  talla: "Recargo por tallas especiales",
  tela: "Recargo por tela",
  cuello: "Recargo por cuello",
  acabado: "Recargo por acabados",
};

export function calcularProforma(prendas: PrendaParaProforma[], adelantoEstandar = 0.5): ResultadoProforma {
  const porProducto = new Map<string, LineaDetalle>();
  const recargos: RecargosPrecio = { talla: 0, tela: 0, cuello: 0, acabado: 0 };

  for (const prenda of prendas) {
    const recargosPrenda = desglosarRecargos(prenda);
    for (const clave of Object.keys(recargos) as (keyof RecargosPrecio)[]) {
      recargos[clave] = redondear2(recargos[clave] + recargosPrenda[clave]);
    }

    if (esSinCosto(prenda.tipoPrecio)) {
      continue;
    }

    const linea = porProducto.get(prenda.tipoProductoId) ?? {
      descripcion: prenda.nombreProducto,
      detalle: "Sublimado — diseño aprobado",
      cantidad: 0,
      precioUnitario: prenda.precioBase,
      subtotal: 0,
    };
    linea.cantidad += 1;
    linea.subtotal = redondear2(linea.cantidad * linea.precioUnitario);
    porProducto.set(prenda.tipoProductoId, linea);
  }

  const lineas = Array.from(porProducto.values()).sort((a, b) => a.descripcion.localeCompare(b.descripcion, "es"));
  const subtotales = lineas.reduce((acc, l) => acc + l.subtotal, 0);

  const lineasRecargo: LineaRecargo[] = Object.entries(NOMBRES_RECARGO)
    .map(([clave, concepto]) => ({ concepto, importe: recargos[clave as keyof RecargosPrecio] }))
    .filter((l) => l.importe > 0);

  const totalSinIgv = redondear2(subtotales + lineasRecargo.reduce((a, l) => a + l.importe, 0));
  return {
    lineas,
    recargos: lineasRecargo,
    cantidadSinCosto: prendas.filter((p) => esSinCosto(p.tipoPrecio)).length,
    totalSinIgv,
    adelantoSugerido: redondear2(totalSinIgv * adelantoEstandar),
    percentAdelanto: adelantoEstandar,
  };
}

export function calcularSaldo(totalSinIgv: number, adelantoRecibido: number): number {
  return redondear2(totalSinIgv - adelantoRecibido);
}