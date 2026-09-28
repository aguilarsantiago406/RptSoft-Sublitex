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

export type TipoTarifa =
  | "PRODUCTO"
  | "RECARGO_TALLA"
  | "RECARGO_TELA"
  | "RECARGO_CUELLO"
  | "RECARGO_ACABADO"
  | "ADICIONAL"
  | "COSTO_INTERNO";

export interface TarifaCatalogo {
  id: string;
  tipo: TipoTarifa;
  concepto: string;
  valor: number | string;
  vigenteDesde: string;
  vigenteHasta?: string | null;
  activo: boolean;
  nota?: string | null;
}

export const TIPOS_TARIFA: { value: TipoTarifa; label: string }[] = [
  { value: "PRODUCTO", label: "Producto (kit)" },
  { value: "RECARGO_TALLA", label: "Recargo por talla" },
  { value: "RECARGO_TELA", label: "Recargo por tela" },
  { value: "RECARGO_CUELLO", label: "Recargo por cuello" },
  { value: "RECARGO_ACABADO", label: "Recargo por acabado" },
  { value: "ADICIONAL", label: "Adicional" },
  { value: "COSTO_INTERNO", label: "Costo interno" },
];

export const ETIQUETA_TIPO_TARIFA: Record<TipoTarifa, string> = {
  PRODUCTO: "Producto",
  RECARGO_TALLA: "Recargo talla",
  RECARGO_TELA: "Recargo tela",
  RECARGO_CUELLO: "Recargo cuello",
  RECARGO_ACABADO: "Recargo acabado",
  ADICIONAL: "Adicional",
  COSTO_INTERNO: "Costo interno",
};
