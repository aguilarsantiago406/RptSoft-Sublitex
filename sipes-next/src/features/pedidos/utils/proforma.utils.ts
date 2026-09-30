import type { TarifaItem } from "../api/comercial.api";
import type { PedidoDetalle } from "../types/pedido";

export interface PrendaProformaItem {
  id: string;
  tallaCodigo: string;
  participanteNombre?: string;
  nombreEnPrenda?: string | null;
  numero?: string | null;
  productoNombre?: string;
  colorNombre?: string;
  genero?: string;
  corte?: string;
  cuello?: string;
  personalizacionesTexto?: string;
  tipoPrenda?: "VENTA" | "OBSEQUIO" | "MUESTRA";
}

export interface ItemCotizadoProforma {
  grupoId: string;
  nombre: string;
  tipoProductoNombre: string;
  cantidad: number;
  precioUnitario: number;
  tarifaEncontrada: boolean;
  subtotal: number;
}

export interface DetalleRecargoTalla {
  talla: string;
  cantidad: number;
  tarifaUnitario: number;
  subtotal: number;
}

export interface CalculoProformaResultado {
  itemsCotizados: ItemCotizadoProforma[];
  tieneTarifasFaltantes: boolean;
  baseProductos: number;
  recargoTallas: {
    total: number;
    detalle: DetalleRecargoTalla[];
  };
  totalSinIgv: number;
  adelanto50: number;
  saldo50: number;
}

export function buscarTarifaVigente(
  tipo: "PRODUCTO" | "RECARGO_TALLA" | "RECARGO_TELA" | "RECARGO_CUELLO",
  concepto: string,
  tarifas: TarifaItem[]
): { valor: number; encontrada: boolean } {
  const norm = concepto.trim().toLowerCase();
  if (!norm) return { valor: 0, encontrada: false };

  let match = tarifas.find((t) => {
    if (t.tipo && t.tipo !== tipo) return false;
    const c = t.concepto.trim().toLowerCase();
    return c === norm;
  });

  if (!match) {
    match = tarifas.find((t) => {
      if (t.tipo && t.tipo !== tipo) return false;
      const c = t.concepto.trim().toLowerCase();
      return c.includes(norm) || norm.includes(c);
    });
  }

  if (!match && tipo === "PRODUCTO") {
    const palabras = norm.split(/\s+/).filter((p) => p.length >= 4);
    match = tarifas.find((t) => {
      if (t.tipo && t.tipo !== tipo) return false;
      const c = t.concepto.trim().toLowerCase();
      return palabras.some((p) => c.includes(p));
    });
  }

  if (match) {
    return { valor: Number(match.valor), encontrada: true };
  }

  return { valor: 0, encontrada: false };
}

export function calcularProformaCompleta(
  pedido: PedidoDetalle,
  tarifas: TarifaItem[],
  prendas: PrendaProformaItem[] = []
): CalculoProformaResultado {
  let tieneTarifasFaltantes = false;

  // 1. Cotización comercial: SIEMPRE sobre la cantidad contratada del grupo
  const itemsCotizados: ItemCotizadoProforma[] = pedido.grupos.map((g) => {
    const nombreProd = g.tipoProducto?.nombre || g.nombre;
    let res = buscarTarifaVigente("PRODUCTO", nombreProd, tarifas);
    if (!res.encontrada && g.nombre && g.nombre !== nombreProd) {
      const resAlt = buscarTarifaVigente("PRODUCTO", g.nombre, tarifas);
      if (resAlt.encontrada) res = resAlt;
    }
    if (!res.encontrada) tieneTarifasFaltantes = true;

    const cantidad = g.cantidadContratada;
    const subtotal = cantidad * res.valor;

    return {
      grupoId: g.id,
      nombre: g.nombre,
      tipoProductoNombre: nombreProd,
      cantidad,
      precioUnitario: res.valor,
      tarifaEncontrada: res.encontrada,
      subtotal,
    };
  });

  const baseProductos = itemsCotizados.reduce((acc, it) => acc + it.subtotal, 0);

  // 2. Recargos automáticos por tallas especiales (si ya hay prendas con tallas asignadas)
  const conteoTallas: Record<string, number> = {};
  for (const p of prendas) {
    if (p.tallaCodigo) {
      conteoTallas[p.tallaCodigo] = (conteoTallas[p.tallaCodigo] || 0) + 1;
    }
  }

  const detalleRecargoTallas: DetalleRecargoTalla[] = [];
  let totalRecargoTallas = 0;

  for (const [talla, cantidad] of Object.entries(conteoTallas)) {
    const { valor, encontrada } = buscarTarifaVigente("RECARGO_TALLA", talla, tarifas);
    if (encontrada && valor > 0) {
      const subtotal = cantidad * valor;
      totalRecargoTallas += subtotal;
      detalleRecargoTallas.push({
        talla,
        cantidad,
        tarifaUnitario: valor,
        subtotal,
      });
    }
  }

  const totalSinIgv = Math.round((baseProductos + totalRecargoTallas) * 100) / 100;
  const adelanto50 = Math.round(totalSinIgv * 0.5 * 100) / 100;
  const saldo50 = Math.max(0, Math.round((totalSinIgv - adelanto50) * 100) / 100);

  return {
    itemsCotizados,
    tieneTarifasFaltantes,
    baseProductos,
    recargoTallas: {
      total: totalRecargoTallas,
      detalle: detalleRecargoTallas,
    },
    totalSinIgv,
    adelanto50,
    saldo50,
  };
}
