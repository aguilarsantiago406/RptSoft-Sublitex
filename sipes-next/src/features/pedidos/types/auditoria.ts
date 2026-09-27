export interface RegistroCambioItem {
  id: string;
  pedidoId: string;
  entidad: string;
  entidadId: string;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string | null;
  origen: "USUARIO" | "PARTICIPANTE" | "SISTEMA" | "GHL";
  autorUsuarioId: string | null;
  autorParticipanteId: string | null;
  autorRol: string | null;
  prendasAfectadas: number | null;
  creadoEn: string;
  participanteNombre?: string | null;
  grupoNombre?: string | null;
  valorAnteriorLegible?: string | null;
  valorNuevoLegible?: string | null;
  autorUsuario?: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
  } | null;
}

export interface CambioDetalle {
  id: string;
  campo: string;
  campoLabel: string;
  valorAnterior: string | null;
  valorNuevo: string | null;
}

export interface TarjetaAuditoriaItem {
  id: string;
  entidad: string;
  entidadId: string;
  titulo: string;
  subtitulo: string;
  origen: "USUARIO" | "PARTICIPANTE" | "SISTEMA" | "GHL";
  autorNombre: string;
  creadoEn: string;
  cambios: CambioDetalle[];
}
