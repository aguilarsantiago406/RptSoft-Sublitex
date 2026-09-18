import type { PedidoResumen } from "@/types/pedidos";

/**
 * ARCHIVO DE DATOS MOCK: lista de pedidos — contrato §3.1.
 * Liviano: solo lo necesario para pintar la tabla principal.
 */
export const pedidosListaMock: PedidoResumen[] = [
  {
    id: "ped_001",
    codigo: "SUB-000842",
    cliente: { id: "cli_1", nombre: "Colegio San Agustín — Promo 2002" },
    estado: "EN_RECOLECCION",
    totalPrendas: 10,
    fechaCompromiso: "2026-09-20T18:00:00Z",
    fechaPedido: "2026-09-01T10:00:00Z",
  },
  {
    id: "ped_002",
    codigo: "SUB-000843",
    cliente: { id: "cli_2", nombre: "Club Deportivo Los Cóndores" },
    estado: "EN_PRODUCCION",
    totalPrendas: 45,
    fechaCompromiso: "2026-09-15T18:00:00Z",
    fechaPedido: "2026-08-25T10:00:00Z",
  },
  {
    id: "ped_003",
    codigo: "SUB-000844",
    cliente: { id: "cli_3", nombre: "Empresa Textil Ramos S.A.C." },
    estado: "BORRADOR",
    totalPrendas: 0,
    fechaCompromiso: null,
    fechaPedido: "2026-09-10T09:00:00Z",
  },
  {
    id: "ped_004",
    codigo: "SUB-000845",
    cliente: { id: "cli_4", nombre: "Colegio Nacional Primavera — Promo 2003" },
    estado: "EN_CONFIGURACION",
    totalPrendas: 12,
    fechaCompromiso: "2026-10-01T18:00:00Z",
    fechaPedido: "2026-09-08T10:00:00Z",
  },
  {
    id: "ped_005",
    codigo: "SUB-000846",
    cliente: { id: "cli_5", nombre: "Club Atlético Junior" },
    estado: "ENTREGADO",
    totalPrendas: 60,
    fechaCompromiso: "2026-09-05T12:00:00Z",
    fechaPedido: "2026-08-10T10:00:00Z",
  },
  {
    id: "ped_006",
    codigo: "SUB-000847",
    cliente: { id: "cli_6", nombre: "Particular — Jorge Medina" },
    estado: "CANCELADO",
    totalPrendas: 5,
    fechaCompromiso: null,
    fechaPedido: "2026-08-20T09:00:00Z",
  },
];