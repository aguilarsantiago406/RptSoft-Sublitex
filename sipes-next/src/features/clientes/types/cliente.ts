export type TipoCliente =
  | "COLEGIO"
  | "PROMOCION"
  | "CLUB"
  | "EMPRESA"
  | "PARTICULAR";

export interface Cliente {
  id: string;
  nombre: string;
  tipo: TipoCliente;
  telefono: string | null;
  ciudad: string | null;
  ghlContactId: string | null;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CreateClienteInput {
  nombre: string;
  tipo: TipoCliente;
  telefono?: string;
  ciudad?: string;
}

export interface UpdateClienteInput {
  nombre?: string;
  tipo?: TipoCliente;
  telefono?: string;
  ciudad?: string;
}

export interface PedidoResumenCliente {
  id: string;
  codigo: string | null;
  estado: string;
  fechaPedido: string;
  fechaCompromiso: string;
}

export interface ClienteDetalle extends Cliente {
  pedidos: PedidoResumenCliente[];
}

