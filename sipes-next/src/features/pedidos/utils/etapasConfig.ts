import type { PedidoDetalle, EstadoPedido } from "../types/pedido";
import type { ResumenProduccionItem } from "../api/comercial.api";
import type { BloquePedidoItem } from "../types/bloque";
import { evaluarBloquesReales } from "./bloques.utils";

export interface CheckSubItem {
  label: string;
  ok: boolean;
}

export interface CheckItem {
  id: string;
  label: string;
  ok: boolean;
  detalle?: string;
  subitems?: CheckSubItem[];
}

export interface EtapaConfig {
  numero: number;
  nombreFase: string;
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
    nombreFase: "Borrador",
    titulo: "Apertura y compromiso de entrega",
    detalle: "Registrá el cliente y acordá la fecha de entrega para iniciar la orden.",
    siguiente: "EN_CONFIGURACION",
    siguienteLabel: "Ir a Configuración",
    getChecks: (p) => [
      { id: "cli", label: "Cliente asignado", ok: Boolean(p.cliente?.nombre), detalle: Boolean(p.cliente?.nombre) ? "Cliente asignado" : "Asigná el cliente al pedido" },
      { id: "fec", label: "Fecha de entrega", ok: Boolean(p.fechaCompromiso), detalle: p.fechaCompromiso ? new Date(p.fechaCompromiso).toLocaleDateString() : "Fecha pendiente de definir" },
    ],
  },
  EN_CONFIGURACION: {
    numero: 2,
    nombreFase: "Configuración",
    titulo: "Estructuración técnica del pedido",
    detalle: "Definí grupos, colores y aprobá el diseño oficial antes de pasar a recolección.",
    siguiente: "EN_RECOLECCION",
    siguienteLabel: "Abrir recolección de tallas",
    getChecks: (p, disenos, datosEnvio) => {
      const tieneDatos = Boolean(p.cliente?.nombre && p.fechaCompromiso);
      const tieneEnvio = Boolean(datosEnvio && (datosEnvio.ciudad || datosEnvio.agencia || datosEnvio.direccion));
      const cantGrupos = p.grupos?.length ?? 0;
      const cantColores = p.colores?.length ?? 0;
      const disenoAprobado = (disenos ?? []).some((d) => d.estado === "APROBADO");
      return [
        {
          id: "datos",
          label: "Datos y envío",
          ok: tieneDatos && tieneEnvio,
          subitems: [
            { label: "Datos del pedido", ok: tieneDatos },
            { label: "Datos de envío", ok: tieneEnvio },
          ],
        },
        {
          id: "grp",
          label: "Grupo de prendas",
          ok: cantGrupos > 0,
          detalle: cantGrupos > 0 ? `${cantGrupos} grupo(s) configurado(s)` : "Crea un grupo y completa su configuración",
        },
        {
          id: "col",
          label: "Colores del pedido",
          ok: cantColores > 0,
          detalle: cantColores > 0 ? `${cantColores} color(es) registrado(s)` : "Registrá los colores oficiales del pedido",
        },
        {
          id: "dis-apr",
          label: "Diseño aprobado",
          ok: disenoAprobado,
          detalle: disenoAprobado ? "Diseño oficial aprobado" : "Aprobá el diseño final de la orden",
        },
      ];
    },
  },
  EN_RECOLECCION: {
    numero: 3,
    nombreFase: "Recolección",
    titulo: "Consolidación de participantes y tallas",
    detalle: "Cargá los participantes y sus especificaciones hasta cubrir el contrato.",
    siguiente: "EN_REVISION",
    siguienteLabel: "Pasar a Revisión",
    getChecks: (_p, disenos, _envio, _total, resumen) => {
      const contratadas = resumen?.totales?.cantidadContratada ?? 0;
      const registradas = resumen?.totales?.prendasRegistradas ?? 0;
      const completas = contratadas > 0 && registradas >= contratadas;
      const disenoAprobado = (disenos ?? []).some((d) => d.estado === "APROBADO");
      return [
        { id: "pre", label: "Carga de prendas", ok: completas, detalle: `${registradas} de ${contratadas > 0 ? contratadas : "?"} prendas registradas` },
        { id: "dis-vig", label: "Diseño oficial vigente", ok: disenoAprobado, detalle: disenoAprobado ? "Arte final aprobado activo" : "Sin diseño aprobado vigente" },
      ];
    },
  },
  EN_REVISION: {
    numero: 4,
    nombreFase: "Revisión",
    titulo: "Auditoría de calidad y cierre de bloques",
    detalle: "Cerrá los 3 bloques operativos (diseño, lista y comercial) para liberar a corte.",
    siguiente: "EN_PRODUCCION",
    siguienteLabel: "Enviar a Producción",
    resumenFaltantes: (n) => `Falta cerrar ${n} de 3 bloques`,
    getChecks: (_p, _disenos, _envio, _total, _resumen, bloques) => {
      const g = evaluarBloquesReales(bloques || []);
      return [
        { id: "blk-diseno", label: "Bloque de Diseño", ok: g.diseno.cerrado, detalle: g.diseno.cerrado ? "Diseño y especificaciones validadas" : "Revisión de diseño pendiente" },
        { id: "blk-lista", label: "Bloque Lista de prendas", ok: g.lista.cerrado, detalle: g.lista.cerrado ? "Participantes y tallas auditados" : "Control de medidas y listas pendiente" },
        { id: "blk-comercial", label: "Bloque Comercial", ok: g.comercial.cerrado, detalle: g.comercial.cerrado ? "Adelanto 50% y entrega confirmados" : "Pendiente adelanto 50% o datos de entrega" },
      ];
    },
  },
  EN_PRODUCCION: {
    numero: 5,
    nombreFase: "Producción",
    titulo: "Fabricación en taller",
    detalle: "Corte, sublimación y armado con ficha técnica congelada.",
    siguiente: "ENTREGADO",
    siguienteLabel: "Marcar como Entregado",
    getChecks: () => [
      { id: "pro", label: "Control de producción", ok: true, detalle: "Lote fabricado y verificado en empaque" },
    ],
  },
  ENTREGADO: {
    numero: 6,
    nombreFase: "Entrega",
    titulo: "Despacho y liquidación",
    detalle: "Confirmá la entrega de prendas y la liquidación comercial completa.",
    siguiente: "CERRADO",
    siguienteLabel: "Cerrar Pedido",
    getChecks: () => [
      { id: "liq", label: "Liquidación y conformidad", ok: true, detalle: "Recepción de prendas confirmada y cobranza 100%" },
    ],
  },
  CERRADO: {
    numero: 7,
    nombreFase: "Cierre",
    titulo: "Pedido completado",
    detalle: "El pedido cerró su ciclo operativo y administrativo.",
    getChecks: () => [],
  },
  CANCELADO: {
    numero: 0,
    nombreFase: "Cancelado",
    titulo: "Pedido cancelado",
    detalle: "Salió del flujo de producción.",
    getChecks: () => [],
  },
};
