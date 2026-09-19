import type {
  CatalogosDto,
  ColorPedidoDto,
  EnvioProvinciaDto,
  PedidoEstadoDto,
  PedidoDto,
  ResumenProduccionDto,
  TipoPrendaDto,
  UbicacionEstampadoDto,
} from "@/services/contrato";

export interface ValorEfectivo {
  id: string;
  nombre: string;
  esExcepcion: boolean;
}

export interface PrendaPresentacion {
  id: string;
  participanteId: string;
  nombreEnPrenda: string;
  nombrePersona: string;
  tipoProductoId: string;
  productoNombre: string;
  tallaId: string | null;
  talla: string | null;
  numero: string | null;
  colorId: string | null;
  color: string | null;
  colorHex: string | null;
  genero: string | null;
  corte: ValorEfectivo | null;
  cuello: ValorEfectivo | null;
  tela: ValorEfectivo | null;
  escudo: ValorEfectivo | null;
  acabadoEscudo: ValorEfectivo | null;
  esArquero: boolean;
  tipo: TipoPrendaDto;
  personalizacionEspecial: string;
  precioBase: number;
  recargoTalla: number;
  recargoTela: number;
  recargoCuello: number;
  recargoAcabado: number;
  precioUnitario: number;
  camisetas: number;
  shorts: number;
  medias: number;
  queFalta: string[];
}

export interface PedidoListaPresentacion {
  id: string;
  codigo: string;
  clienteGrupo: string;
  tipoPrendaPrincipal: string;
  fecha: string;
  estado: PedidoEstadoDto;
}

export interface PedidoDetallePresentacion {
  id: string;
  codigo: string;
  grupoId: string;
  estado: PedidoEstadoDto;
  identificacion: PedidoDto["identificacion"];
  disenoAprobado: {
    versionMockup: string;
    fechaAprobacion: string;
    aprobadoPor: string;
    archivoMockup: string;
    temaPrincipal: string;
    manga: string;
    ribCuelloLabel: string;
    ribMangasLabel: string;
    cuelloHombres: string;
    cuelloDamas: string;
    corteHombres: string;
    corteDamas: string;
    acabadoEscudos: string;
    shortTela: string;
  };
  colores: ColorPedidoDto[];
  ubicacionesEstampado: UbicacionEstampadoDto[];
  envioProvincia: EnvioProvinciaDto;
  controlCambios: PedidoDto["controlCambios"];
  prendas: PrendaPresentacion[];
  catalogos: CatalogosDto;
  resumen: ResumenProduccionDto;
}

export interface MuestrarioColor {
  nombre: string;
  codigoHex: string | null;
  referencia: string | null;
}