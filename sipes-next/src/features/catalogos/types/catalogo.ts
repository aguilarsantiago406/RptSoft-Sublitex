export interface TipoProductoCatalogo {
  id: string;
  codigo: string;
  nombre: string;
  componentes: {
    camisetas: number;
    shorts: number;
    medias: number;
  };
}

export interface TallaCatalogo {
  id: string;
  tipoProductoId: string;
  codigo: string;
  etiqueta: string;
  orden?: number;
  tipoProducto?: {
    id: string;
    codigo: string;
    nombre: string;
  };
}

export interface ValorAtributoCatalogo {
  id: string;
  atributoId: string;
  codigo: string;
  etiqueta: string;
  orden: number;
}

export interface AtributoCatalogo {
  id: string;
  codigo: string;
  nombre: string;
  obligatorio: boolean;
  criticoProduccion: boolean;
  orden: number;
  valores: ValorAtributoCatalogo[];
}

export interface UbicacionPersonalizacionCatalogo {
  id: string;
  codigo: string;
  etiqueta: string;
  orden: number;
}

export interface TarifaCatalogo {
  id: string;
  tipo: "PRECIO_BASE" | "RECARGO_TALLA" | "ENVIO";
  concepto: string;
  valor: number | string;
  activo: boolean;
  fechaInicio: string;
  fechaFin: string | null;
}
