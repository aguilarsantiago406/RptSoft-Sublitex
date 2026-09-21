import { api } from "./apiClient";
import type {
  EstadoPedido,
  PedidoDetalle,
  PedidoResumen,
  ValorConfiguracion,
} from "@/types/pedidos";
import type { ColorPedido } from "@/types/prendas";

// -----------------------------------------------------------------------------
// Forma cruda que devuelve el backend real
// -----------------------------------------------------------------------------

interface ClienteApi {
  id: string;
  nombre: string;
  telefono?: string | null;
  ciudad?: string | null;
}

interface GrupoApi {
  id: string;
  nombre: string;
  cantidadContratada: number;
  politicaNumeracion: string;
  tipoProducto: {
    codigo: string;
    nombre: string;
    componentes: { camisetas: number; shorts: number; medias: number };
  };
  configuracion: ValorConfiguracion[];
}

interface ColorApi {
  id: string;
  nombre: string;
  codigoHex: string;
}

interface PedidoApi {
  id: string;
  codigo: string;
  estado: string;
  fechaPedido: string;
  fechaCompromiso: string | null;
  observaciones?: string | null;
  totalPrendas?: number;
  cliente: ClienteApi;
  colores?: ColorApi[];
  grupos?: GrupoApi[];
}

/** Lista de pedidos para la tabla de /pedidos — contrato §3.1. */
export async function obtenerPedidos(): Promise<PedidoResumen[]> {
  const data = await api<PedidoApi[]>("/api/pedidos");

  return data.map((p) => ({
    id: p.id,
    codigo: p.codigo,
    cliente: { id: p.cliente.id, nombre: p.cliente.nombre },
    estado: p.estado as EstadoPedido,
    totalPrendas: p.totalPrendas,
    fechaCompromiso: p.fechaCompromiso,
    fechaPedido: p.fechaPedido,
  }));
}

/** Detalle comercial de un pedido (sin prendas) — contrato §3.3. */
export async function obtenerPedidoDetalle(id: string): Promise<PedidoDetalle> {
  const p = await api<PedidoApi>(`/api/pedidos/${id}`);

  return {
    id: p.id,
    codigo: p.codigo,
    cliente: {
      id: p.cliente.id,
      nombre: p.cliente.nombre,
      telefono: p.cliente.telefono ?? undefined,
      ciudad: p.cliente.ciudad ?? undefined,
    },
    estado: p.estado as EstadoPedido,
    fechaPedido: p.fechaPedido,
    fechaCompromiso: p.fechaCompromiso,
    observaciones: p.observaciones ?? undefined,
    colores: (p.colores ?? []).map((c) => ({
      id: c.id,
      nombre: c.nombre,
      codigoHex: c.codigoHex,
    })),
    grupos: (p.grupos ?? []).map((g) => ({
      id: g.id,
      nombre: g.nombre,
      tipoProducto: {
        codigo: g.tipoProducto.codigo,
        nombre: g.tipoProducto.nombre,
        componentes: g.tipoProducto.componentes,
      },
      cantidadContratada: g.cantidadContratada,
      politicaNumeracion: g.politicaNumeracion,
      configuracion: g.configuracion ?? [],
    })),
  };
}

/** Índice id → color para resolver el colorId de las prendas de la grilla. */
export function mapColoresPorId(
  colores: ColorPedido[]
): Map<string, ColorPedido> {
  return new Map(colores.map((c) => [c.id, c]));
}
