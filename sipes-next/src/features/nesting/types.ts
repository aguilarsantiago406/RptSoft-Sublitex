export interface AtributoTela {
  id: string;
  nombre: string;
  codigo?: string;
  etiqueta?: string;
}

export interface NestingParte {
  id: string;
  nestingId: string;
  pedidoId: string;
  numeroParte?: number;
  anchoCm: number;
  largoCm: number;
  esRib: boolean;
  creadoEn?: string;
}

export interface NestingArchivo {
  id: string;
  nestingId: string;
  nombre: string;
  largoM: number;
  ordenEnSerie: number;
  totalSerie: number;
  entregadoEn?: string | null;
  creadoEn?: string;
}

export interface NestingSesion {
  id: string;
  codigo: string;
  telaId: string;
  anchoImpresionM?: number;
  fecha?: string;
  creadoPorId?: string;
  tela?: AtributoTela | { id: string; etiqueta: string } | null;
  creadoEn?: string;
  partes?: NestingParte[];
  archivos?: NestingArchivo[];
  _count?: { partes: number } | null;
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
  entregadoEn?: string;
}

export interface DesgloseConsumoPorTela {
  telaId: string;
  telaNombre: string;
  metrosLineales: number;
}

export interface ConsumoTelaPedido {
  pedidoId: string;
  pedidoCodigo?: string;
  partes?: number;
  metrosTela: number;
  metrosRib: number;
  metrosLineales: number;
  anchoMaximoUsadoCm?: number | null;
  desperdicioLateralCm?: number | null;
  porcentajeAprovechamientoAncho?: number | null;
  desglosePorTela?: DesgloseConsumoPorTela[];
  precioPorMetro?: number | null;
  costoImpresion?: number | null;
  nota?: string;
}