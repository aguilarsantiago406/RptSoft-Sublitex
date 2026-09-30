import type { PedidoDetalle, EstadoPedido } from "../types/pedido";
import type { ResumenProduccionItem } from "../api/comercial.api";
import type { BloquePedidoItem } from "../types/bloque";
import { evaluarBloquesReales } from "./bloques.utils";

export interface CheckItem {
  id: string;
  label: string;
  ok: boolean;
}

export interface EtapaConfig {
  numero: number;
  titulo: string;
  detalle: string;
  siguiente?: EstadoPedido;
  siguienteLabel?: string;
  checksEnTarjetas?: boolean;
  resumenFaltantes?: (faltantes: number) => string;
  getChecks: (
    pedido: PedidoDetalle,
    disenos: Array<{ id: string; estado: string }>,
    datosEnvio: { ciudad?: string | null; direccion?: string | null; agencia?: string | null } | null,
    totalPrendas: number,
    resumenProduccion?: ResumenProduccionItem | null,
    bloques?: BloquePedidoItem[]
  ) => CheckItem[];
}

export const ETAPAS_CONFIG: Record<EstadoPedido, EtapaConfig> = {
  BORRADOR: {
    numero: 1,
    titulo: "Datos y fecha de entrega",
    detalle: "Asigná el cliente y pactá la fecha de entrega para iniciar configuración.",
    siguiente: "EN_CONFIGURACION",
    siguienteLabel: "Ir a Configuración",
    getChecks: (p) => [
      { id: "cli", label: "Cliente asignado", ok: Boolean(p.cliente?.nombre) },
      { id: "fec", label: "Fecha de entrega pactada", ok: Boolean(p.fechaCompromiso) },
    ],
  },
  EN_CONFIGURACION: {
    numero: 2,
    titulo: "Grupos y colores",
    detalle: "Creá los grupos de prendas y la paleta de colores. Al cargar participantes avanza a recolección.",
    siguiente: "EN_RECOLECCION",
    siguienteLabel: "Abrir recolección de tallas",
    getChecks: (p) => [
      { id: "grp", label: "Al menos 1 grupo de prendas", ok: (p.grupos?.length ?? 0) > 0 },
      { id: "col", label: "Colores definidos", ok: (p.colores?.length ?? 0) > 0 },
    ],
  },
  EN_RECOLECCION: {
    numero: 3,
    titulo: "Tallas, participantes y diseño",
    detalle: "Completá la totalidad de prendas contratadas y subí al menos una propuesta de diseño.",
    siguiente: "EN_REVISION",
    siguienteLabel: "Pasar a Revisión",
    getChecks: (_p, disenos, _envio, _total, resumen) => {
      const contratadas = resumen?.totales?.cantidadContratada ?? 0;
      const registradas = resumen?.totales?.prendasRegistradas ?? 0;
      const completas = contratadas > 0 && registradas >= contratadas;
      const hayDiseno = (disenos?.length ?? 0) > 0;
      return [
        {
          id: "pre",
          label: `Prendas completas (${registradas}/${contratadas > 0 ? contratadas : "?"})`,
          ok: completas,
        },
        {
          id: "dis",
          label: "Propuesta de diseño subida",
          ok: hayDiseno,
        },
      ];
    },
  },
  EN_REVISION: {
    numero: 4,
    titulo: "Auditoría de calidad y cierre de bloques",
    detalle: "Cerrá los 3 bloques operativos (diseño, lista y comercial) para liberar a corte.",
    siguiente: "EN_PRODUCCION",
    siguienteLabel: "Enviar a Producción",
    resumenFaltantes: (n) => `Falta cerrar ${n} de 3 bloques`,
    getChecks: (_p, _disenos, _envio, _total, _resumen, bloques) => {
      const g = evaluarBloquesReales(bloques || []);
      return [
        { id: "blk-diseno", label: "Bloque Diseño", ok: g.diseno.cerrado },
        { id: "blk-lista", label: "Bloque Lista de prendas", ok: g.lista.cerrado },
        { id: "blk-comercial", label: "Bloque Comercial (50% anticipo + envío)", ok: g.comercial.cerrado },
      ];
    },
  },
  EN_PRODUCCION: {
    numero: 5,
    titulo: "Taller",
    detalle: "Corte, sublimación y armado. La ficha técnica queda congelada.",
    siguiente: "ENTREGADO",
    siguienteLabel: "Marcar como Entregado",
    getChecks: () => [
      { id: "pro", label: "Lote fabricado y verificado en empaque", ok: true },
    ],
  },
  ENTREGADO: {
    numero: 6,
    titulo: "Entrega",
    detalle: "Verificá la proforma comercial antes del cierre final.",
    siguiente: "CERRADO",
    siguienteLabel: "Cerrar Pedido",
    getChecks: () => [
      { id: "liq", label: "Recepción confirmada y cobranza 100%", ok: true },
    ],
  },
  CERRADO: {
    numero: 7,
    titulo: "Completado",
    detalle: "El pedido cerró su ciclo operativo.",
    getChecks: () => [],
  },
  CANCELADO: {
    numero: 0,
    titulo: "Cancelado",
    detalle: "Salió del flujo de producción.",
    getChecks: () => [],
  },
};
