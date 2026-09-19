export type TipoPrendaDto = "VENTA" | "OBSEQUIO" | "MUESTRA";

export type EstadoParticipanteDto = "PENDIENTE" | "REGISTRADO" | "CONFIRMADO";

export interface PersonalizacionDto {
  id: string;
  prendaId: string;
  ubicacionId: string;
  contenido: string;
}

export interface ExcepcionDto {
  id: string;
  prendaId: string;
  atributoId: string;
  valorAtributoId: string;
  motivo: string;
}

export interface PrendaDto {
  id: string;
  participanteId: string;
  grupoId: string;
  tipoProductoId: string;
  tallaId: string | null;
  numero: string | null;
  genero: string | null;
  tipoPrenda: TipoPrendaDto;
  colorId: string | null;
  nombreEnPrenda: string;
  esArquero: boolean;
  precioCalculado: number;
  personalizaciones: PersonalizacionDto[];
  excepciones: ExcepcionDto[];
}

export type PrendaDbDto = Omit<PrendaDto, "personalizaciones" | "excepciones">;

export function consolidarPrenda(dbPrenda: PrendaDbDto, excepciones: ExcepcionDto[], personalizaciones: PersonalizacionDto[]): PrendaDto {
  return {
    ...dbPrenda,
    excepciones: excepciones.filter((e) => e.prendaId === dbPrenda.id),
    personalizaciones: personalizaciones.filter((p) => p.prendaId === dbPrenda.id),
  };
}

export interface ParticipanteDto {
  id: string;
  grupoId: string;
  nombrePersona: string;
  estado: EstadoParticipanteDto;
  enlaceToken: string | null;
  enlaceExpiraEn: string | null;
  enlaceRevocado: boolean;
  registradoEn: string | null;
  confirmadoEn: string | null;
}

export interface ResumenProduccionDto {
  pedidoId: string;
  totalPrendas: number;
  desgloseTiposPrenda: {
    venta: number;
    obsequio: number;
    muestra: number;
  };
  piezasFisicas: {
    totalCamisetas: number;
    totalShorts: number;
    totalMedias: number;
  };
  importeTotalEstimado: number;
}

export interface TipoProductoDto {
  id: string;
  nombre: string;
  precioBase: number;
  componentes: {
    camisetas: number;
    shorts: number;
    medias: number;
  };
}

export interface TallaDto {
  id: string;
  codigo: string;
  etiqueta: string;
  recargo: number;
  tipo: "Infantil" | "Adulto";
}

export interface TelaDto {
  id: string;
  nombre: string;
  recargo: number;
}

export interface CuelloDto {
  id: string;
  nombre: string;
  recargo: number;
}

export interface AcabadoDto {
  id: string;
  nombre: string;
  recargo: number;
}

export interface ColorDto {
  id: string;
  nombre: string;
  codigoHex: string | null;
}

export interface ParametrosComercialesDto {
  igv: number;
  adelantoEstandar: number;
  adelantoExcepcional: number;
  pedidoMinimo: number;
  validezProformaDias: number;
}

export interface ListasCerradasDto {
  generos: string[];
  cortes: string[];
  tiposPrenda: string[];
  siNo: string[];
  mangas: string[];
  modalidadesEntrega: string[];
}

export interface CatalogosDto {
  productos: TipoProductoDto[];
  tallas: TallaDto[];
  telas: TelaDto[];
  cuellos: CuelloDto[];
  acabados: AcabadoDto[];
  cortes: CorteCatalogoDto[];
  colores: ColorDto[];
  parametros: ParametrosComercialesDto;
  listas: ListasCerradasDto;
}

export interface CorteCatalogoDto {
  id: string;
  nombre: string;
}

export interface CambioDto {
  fecha: string;
  queCambio: string;
  quien: string;
  version: string;
}

export interface IdentificacionPedidoDto {
  numero: string;
  versionHoja: string;
  fecha: string;
  fechaVersion: string;
  clienteGrupo: string;
  rucDni: string;
  coordinadorCliente: string;
  telefono: string;
  vendedora: string;
  fechaEntrega: string;
  modalidadEntrega: string;
  ciudad: string;
}

export interface DisenoAprobadoDto {
  versionMockup: string;
  fechaAprobacion: string;
  aprobadoPor: string;
  archivoMockup: string;
  temaPrincipal: string;
  manga: string;
  cuelloHombresId: string;
  cuelloDamasId: string;
  corteHombresId: string;
  corteDamasId: string;
  ribCuello: boolean;
  ribMangas: boolean;
  acabadoEscudosId: string;
  shortTelaId: string;
}

export interface ColorPedidoDto {
  id: string;
  nombre: string;
  codigoHex: string | null;
  referencia: string;
}

export interface UbicacionEstampadoDto {
  id: string;
  etiqueta: string;
  lleva: boolean;
  contenido: string | null;
}

export interface EnvioProvinciaDto {
  nombreCompleto: string;
  dni: string;
  celular: string;
  ciudadDestino: string;
  agencia: string;
  referencia: string;
  correo: string;
}

export interface PedidoDto {
  id: string;
  grupoId: string;
  codigo: string;
  estado: PedidoEstadoDto;
  tipoPrendaPrincipal: string;
  identificacion: IdentificacionPedidoDto;
  disenoAprobado: DisenoAprobadoDto;
  colores: ColorPedidoDto[];
  ubicacionesEstampado: UbicacionEstampadoDto[];
  envioProvincia: EnvioProvinciaDto;
  controlCambios: CambioDto[];
  valoresGrupo: {
    corteId: string;
    cuelloId: string;
    telaId: string;
    escudo: boolean;
    acabadoEscudoId: string;
  };
}

export type PedidoEstadoDto = "Borrador" | "En Revisión" | "Confirmado" | "En Producción";

export interface PedidoListaDto {
  id: string;
  codigo: string;
  clienteGrupo: string;
  tipoPrendaPrincipal: string;
  fecha: string;
  estado: PedidoEstadoDto;
}

export interface PedidoDetalleDto {
  pedido: PedidoDto;
  participantes: ParticipanteDto[];
  prendas: PrendaDto[];
  catalogos: CatalogosDto;
  resumenProduccion: ResumenProduccionDto;
}

export interface FichaMinimaDto {
  tallaId: string | null;
  numero: string | null;
  genero: string | null;
  nombreEnPrenda: string;
}

export interface DbSimuladorDto {
  pedidos: PedidoDto[];
  participantes: ParticipanteDto[];
  prendas: PrendaDbDto[];
  excepcionesPrenda: ExcepcionDto[];
  personalizaciones: PersonalizacionDto[];
  catalogos: CatalogosDto;
  resumenProduccion: ResumenProduccionDto;
}

export function construirDetallePedido(db: DbSimuladorDto, pedidoId: string): PedidoDetalleDto {
  const pedido = db.pedidos.find((p) => p.id === pedidoId);
  if (!pedido) {
    throw new Error(`Pedido no encontrado: ${pedidoId}`);
  }
  return {
    pedido,
    participantes: db.participantes,
    prendas: db.prendas.map((p) => consolidarPrenda(p, db.excepcionesPrenda, db.personalizaciones)),
    catalogos: db.catalogos,
    resumenProduccion: db.resumenProduccion,
  };
}