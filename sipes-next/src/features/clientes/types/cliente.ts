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
