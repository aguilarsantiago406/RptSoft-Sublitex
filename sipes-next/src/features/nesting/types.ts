// src/features/nesting/types.ts

export interface AtributoTela {
  id: string;
  nombre: string;
  codigo?: string;
}

export interface NestingParte {
  id: string;
  nestingId: string;
  pedidoId: string;
  anchoCm: number;
  largoCm: number;
  esRib: boolean;
  creadoEn: string;
}

export interface NestingArchivo {
  id: string;
  nestingId: string;
  nombre: string;
  largoM: number;
  ordenEnSerie: number;
  totalSerie: number;
  creadoEn: string;
}

export interface NestingSesion {
  id: string;
  codigo: string;
  telaId: string;
  tela?: AtributoTela;
  creadoEn: string;
  partes?: NestingParte[];
  archivos?: NestingArchivo[];
}

export interface CrearNestingPayload {
  codigo: string;
  telaId: string;
}

export interface AsignarPartePayload {
  pedidoId: string;
  anchoCm: number;
  largoCm: number;
  esRib?: boolean;
}

export interface RegistrarArchivoPayload {
  nombre: string;
  largoM: number;
  ordenEnSerie: number;
  totalSerie: number;
}

export interface ConsumoTelaPedido {
  pedidoId: string;
  metrosTela: number;
  metrosRib: number;
  metrosLineales: number;
  desperdicioLateralCm: number;
  porcentajeAprovechamientoAncho: number;
  costoImpresion: number;
}