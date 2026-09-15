// =============================================================================
// ERRORES DE LA API — contrato §1.3
// Toda respuesta de error del backend tiene esta forma exacta:
//   { error: { codigo: "R-...", mensaje: "...", detalle: "..." } }
// =============================================================================

export interface ErrorDetalle {
  /** código estable del error, formato "R-..." */
  codigo: string;
  mensaje: string;
  /** detalle opcional libre (puede ser un listado de validaciones) */
  detalle?: unknown;
}

export interface ErrorAPI {
  error: ErrorDetalle;
}