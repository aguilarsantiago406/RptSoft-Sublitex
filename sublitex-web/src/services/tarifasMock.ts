import type { Tarifa } from "@/types/prendas";

/**
 * TARIFARIO VIGENTE (GET /api/tarifas — contrato §2.2)
 * Una sola tarifa vigente por {tipo, concepto} — R-K10.
 * Ningún precio se escribe a mano en el front: el cálculo lee de esta lista.
 */
export const tarifasVigentesMock: Tarifa[] = [
  // Productos (concepto = codigo del catálogo de §2.1)
  { id: "t01", tipo: "PRODUCTO", concepto: "CAMISETA", valor: 25.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t02", tipo: "PRODUCTO", concepto: "CAMISETA_SHORT", valor: 40.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t03", tipo: "PRODUCTO", concepto: "KIT", valor: 45.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t04", tipo: "PRODUCTO", concepto: "ARQUERO", valor: 35.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t05", tipo: "PRODUCTO", concepto: "SHORT", valor: 15.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t06", tipo: "PRODUCTO", concepto: "MEDIAS", valor: 5.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t07", tipo: "PRODUCTO", concepto: "FALDA", valor: 25.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t08", tipo: "PRODUCTO", concepto: "CONJUNTO_ARQUERO", valor: 60.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t09", tipo: "PRODUCTO", concepto: "BANDEROLA", valor: 25.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },

  // Recargos por talla
  { id: "t10", tipo: "RECARGO_TALLA", concepto: "6", valor: 0.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t11", tipo: "RECARGO_TALLA", concepto: "8", valor: 0.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t12", tipo: "RECARGO_TALLA", concepto: "10", valor: 0.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t13", tipo: "RECARGO_TALLA", concepto: "12", valor: 0.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t14", tipo: "RECARGO_TALLA", concepto: "14", valor: 0.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t15", tipo: "RECARGO_TALLA", concepto: "16", valor: 0.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t16", tipo: "RECARGO_TALLA", concepto: "S", valor: 0.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t17", tipo: "RECARGO_TALLA", concepto: "M", valor: 0.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t18", tipo: "RECARGO_TALLA", concepto: "L", valor: 0.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t19", tipo: "RECARGO_TALLA", concepto: "XL", valor: 3.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t20", tipo: "RECARGO_TALLA", concepto: "XXL", valor: 6.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t21", tipo: "RECARGO_TALLA", concepto: "XXXL", valor: 10.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },

  // Recargos por tela
  { id: "t22", tipo: "RECARGO_TELA", concepto: "DRY_FIT", valor: 0.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t23", tipo: "RECARGO_TELA", concepto: "WIN_FRESH", valor: 0.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t24", tipo: "RECARGO_TELA", concepto: "MARATHON", valor: 5.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t25", tipo: "RECARGO_TELA", concepto: "PUMA", valor: 5.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t26", tipo: "RECARGO_TELA", concepto: "PALMEIRA", valor: 5.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t27", tipo: "RECARGO_TELA", concepto: "HEXAGONAL", valor: 5.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t28", tipo: "RECARGO_TELA", concepto: "LABRADA", valor: 10.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t29", tipo: "RECARGO_TELA", concepto: "NOVA_SIN_FORRO", valor: 0.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },

  // Recargos por cuello
  { id: "t30", tipo: "RECARGO_CUELLO", concepto: "REDONDO", valor: 0.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t31", tipo: "RECARGO_CUELLO", concepto: "REDONDO_CRUZADO", valor: 0.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t32", tipo: "RECARGO_CUELLO", concepto: "V", valor: 0.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t33", tipo: "RECARGO_CUELLO", concepto: "V_CRUZADO", valor: 0.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t34", tipo: "RECARGO_CUELLO", concepto: "CAMISERO", valor: 10.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },

  // Recargos por acabado
  { id: "t35", tipo: "RECARGO_ACABADO", concepto: "NINGUNO", valor: 0.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t36", tipo: "RECARGO_ACABADO", concepto: "SUBLIMADO", valor: 0.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t37", tipo: "RECARGO_ACABADO", concepto: "TERMOSELLADO", valor: 5.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t38", tipo: "RECARGO_ACABADO", concepto: "BORDADO", valor: 5.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t39", tipo: "RECARGO_ACABADO", concepto: "DTF", valor: 5.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t40", tipo: "RECARGO_ACABADO", concepto: "VINIL", valor: 5.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
  { id: "t41", tipo: "RECARGO_ACABADO", concepto: "PARCHE", valor: 10.0, vigenteDesde: "2026-01-01", vigenteHasta: null, activo: true },
];