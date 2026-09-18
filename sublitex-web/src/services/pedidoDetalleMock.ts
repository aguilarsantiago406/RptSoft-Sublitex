import type { PedidoDetalle } from "@/types/pedidos";

/**
 * ARCHIVO DE DATOS MOCK: Detalle de un pedido — contrato §3.3.
 * Solo encabezado comercial: cliente, colores y grupos.
 * La grilla de prendas NO vive acá: se consulta vía GET /api/grupos/:id/prendas.
 */
export const pedidoDetalleMock: PedidoDetalle = {
  id: "ped_001",
  codigo: "SUB-000842",
  estado: "EN_RECOLECCION",
  fechaPedido: "2026-09-01T10:00:00Z",
  fechaCompromiso: "2026-09-20T18:00:00Z",
  observaciones: "Entregar con estampado de escudo termosellado y nombres en mayúsculas.",
  cliente: {
    id: "cli_1",
    nombre: "Colegio San Agustín — Promo 2002",
    telefono: "+51 987 654 321",
    ciudad: "Lima",
  },
  colores: [
    { id: "c1", nombre: "Blanco hueso", codigoHex: "#F7F4F2" },
    { id: "c2", nombre: "Dorado", codigoHex: "#CC9933" },
    { id: "c3", nombre: "Negro", codigoHex: "#060604" },
  ],
  grupos: [
    {
      id: "grp_001",
      nombre: "Conjunto Blanco Titular",
      tipoProducto: {
        codigo: "KIT",
        nombre: "Kit completo",
        componentes: { camisetas: 1, shorts: 1, medias: 1 },
      },
      cantidadContratada: 10,
      politicaNumeracion: "LIBRE",
      configuracion: [
        { atributo: "CUELLO", valor: "REDONDO" },
        { atributo: "TELA", valor: "DRY_FIT" },
        { atributo: "CORTE", valor: "RECTO" },
        { atributo: "ACABADO", valor: "NINGUNO" },
      ],
    },
    {
      id: "grp_002",
      nombre: "Equipo suplente",
      tipoProducto: {
        codigo: "CAMISETA",
        nombre: "Camiseta",
        componentes: { camisetas: 1, shorts: 0, medias: 0 },
      },
      cantidadContratada: 5,
      politicaNumeracion: "LIBRE",
      configuracion: [
        { atributo: "CUELLO", valor: "CAMISERO" },
        { atributo: "TELA", valor: "PUMA" },
        { atributo: "CORTE", valor: "RECTO" },
        { atributo: "ACABADO", valor: "TERMOSELLADO" },
      ],
    },
  ],
};