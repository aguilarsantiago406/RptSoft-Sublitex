"use client";

import { useTransition, useState } from "react";
import { CheckCircle2, CircleAlert, ArrowRight } from "lucide-react";
import type { PedidoDetalle, EstadoPedido } from "../types/pedido";
import type { ResumenProduccionItem } from "../api/comercial.api";
import type { BloquePedidoItem } from "../types/bloque";
import { actionActualizarEstadoPedido } from "../actions/pedidos.actions";
import { ModalConfirmacion } from "@/components/ui/ModalConfirmacion";
import { evaluarBloquesReales } from "../utils/bloques.utils";
import styles from "./pedidoGuiaEtapa.module.css";

interface CheckItem {
  id: string;
  label: string;
  ok: boolean;
}

interface EtapaConfig {
  numero: number;
  titulo: string;
  objetivo: string;
  siguiente?: EstadoPedido;
  siguienteLabel?: string;
  getChecks: (
    pedido: PedidoDetalle,
    disenos: Array<{ id: string; estado: string }>,
    datosEnvio: { ciudad?: string | null; direccion?: string | null; agencia?: string | null } | null,
    totalPrendas: number,
    resumenProduccion?: ResumenProduccionItem | null,
    bloques?: BloquePedidoItem[]
  ) => CheckItem[];
}

const ETAPAS_CONFIG: Record<EstadoPedido, EtapaConfig> = {
  BORRADOR: {
    numero: 1,
    titulo: "Borrador · Identificación y Compromiso",
    objetivo: "Pactá la fecha de entrega obligatoria y asegurate de tener al cliente registrado.",
    siguiente: "EN_CONFIGURACION",
    siguienteLabel: "Avanzar a Configuración",
    getChecks: (p) => [
      { id: "cli", label: "Cliente asignado", ok: Boolean(p.cliente?.nombre) },
      { id: "fec", label: "Fecha compromiso de entrega acordada", ok: Boolean(p.fechaCompromiso) },
    ],
  },
  EN_CONFIGURACION: {
    numero: 2,
    titulo: "Configuración · Estructura de Prendas y Colores",
    objetivo: "Creá los grupos de prendas (telas, cortes, cantidades) y definí la paleta de colores.",
    siguiente: "EN_RECOLECCION",
    siguienteLabel: "Abrir Recolección de Tallas",
    getChecks: (p) => [
      { id: "grp", label: "Estructura de prendas base y tela definida", ok: (p.grupos?.length ?? 0) > 0 },
      { id: "col", label: "Colores del pedido definidos", ok: (p.colores?.length ?? 0) > 0 },
    ],
  },
  EN_RECOLECCION: {
    numero: 3,
    titulo: "Recolección · Carga de Tallas y Participantes",
    objetivo: "Compartí los enlaces de registro o cargá las tallas, números y nombres de las prendas.",
    siguiente: "EN_REVISION",
    siguienteLabel: "Pasar a Revisión",
    getChecks: (_, __, ___, total) => [
      { id: "pre", label: "Prendas o participantes registrados", ok: total > 0 },
    ],
  },
  EN_REVISION: {
    numero: 4,
    titulo: "Revisión · Control de Calidad y Bloques",
    objetivo: "Los 3 bloques de control (Diseño, Lista y Comercial) deben estar validados y cerrados antes de autorizar el corte.",
    siguiente: "EN_PRODUCCION",
    siguienteLabel: "Enviar a Producción (Taller)",
    getChecks: (_p, _disenos, _envio, _total, _resumen, bloques) => {
      const g = evaluarBloquesReales(bloques || []);
      return [
        {
          id: "blk-diseno",
          label: `Diseño: ${g.diseno.cerrado ? "Cerrado (Arte y colores aprobados)" : "Abierto (Pendiente aprobación)"}`,
          ok: g.diseno.cerrado,
        },
        {
          id: "blk-lista",
          label: `Lista: ${g.lista.cerrado ? "Cerrada (Tallas y dorsales completos)" : "Abierta (Pendiente confirmación)"}`,
          ok: g.lista.cerrado,
        },
        {
          id: "blk-comercial",
          label: `Comercial: ${g.comercial.cerrado ? "Cerrado (Proforma conciliada)" : "Abierto (Pendiente emisión)"}`,
          ok: g.comercial.cerrado,
        },
      ];
    },
  },
  EN_PRODUCCION: {
    numero: 5,
    titulo: "Producción · Confección en Taller",
    objetivo: "La orden se encuentra en corte, sublimación y armado. La ficha técnica está congelada.",
    siguiente: "ENTREGADO",
    siguienteLabel: "Marcar como Entregado",
    getChecks: () => [
      { id: "pro", label: "Lote fabricado y verificado en empaque", ok: true },
    ],
  },
  ENTREGADO: {
    numero: 6,
    titulo: "Entregado · Despacho y Liquidación",
    objetivo: "El cliente recibió el pedido. Verificá la proforma comercial antes del cierre final.",
    siguiente: "CERRADO",
    siguienteLabel: "Cerrar Pedido",
    getChecks: () => [
      { id: "liq", label: "Recepción confirmada y cobranza 100%", ok: true },
    ],
  },
  CERRADO: {
    numero: 7,
    titulo: "Cerrado · Pedido Completado y Archivado",
    objetivo: "Este pedido concluyó exitosamente su ciclo operativo y comercial.",
    getChecks: () => [],
  },
  CANCELADO: {
    numero: 0,
    titulo: "Cancelado",
    objetivo: "Este pedido fue cancelado y no admite modificaciones.",
    getChecks: () => [],
  },
};

interface PedidoGuiaEtapaProps {
  pedido: PedidoDetalle;
  disenos?: Array<{ id: string; estado: string }>;
  datosEnvio?: { ciudad?: string | null; direccion?: string | null; agencia?: string | null } | null;
  totalPrendas: number;
  resumenProduccion?: ResumenProduccionItem | null;
  bloques?: BloquePedidoItem[];
}

export function PedidoGuiaEtapa({
  pedido,
  disenos = [],
  datosEnvio = null,
  totalPrendas,
  resumenProduccion = null,
  bloques = [],
}: PedidoGuiaEtapaProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [colapsado, setColapsado] = useState(false);

  const config = ETAPAS_CONFIG[pedido.estado] || ETAPAS_CONFIG.BORRADOR;
  const checks = config.getChecks(pedido, disenos, datosEnvio, totalPrendas, resumenProduccion, bloques);
  const faltantes = checks.filter((c) => !c.ok);
  const puedeAvanzar = faltantes.length === 0 && Boolean(config.siguiente);

  function ejecutarAvanzar() {
    if (!puedeAvanzar || !config.siguiente) return;
    setErrorMsg(null);
    startTransition(async () => {
      const res = await actionActualizarEstadoPedido(pedido.id, config.siguiente!);
      setIsConfirmModalOpen(false);
      if (!res.ok) {
        setErrorMsg(res.error || "No se pudo actualizar el estado del pedido.");
      }
    });
  }

  function handleAvanzarClick() {
    if (!puedeAvanzar || !config.siguiente) return;
    if (config.siguiente === "EN_PRODUCCION") {
      setIsConfirmModalOpen(true);
      return;
    }
    ejecutarAvanzar();
  }

  if (pedido.estado === "CERRADO" || pedido.estado === "CANCELADO") {
    return null;
  }

  return (
    <div className={styles.guiaContainer}>
      <div className={styles.guiaHeader}>
        <div className={styles.guiaTitleRow}>
          <span className={styles.etapaBadge}>Etapa {config.numero}</span>
          <h2 className={styles.guiaTitle}>{config.titulo}</h2>
          {checks.length > 0 && (
            <span className={styles.progresoBadge}>
              {checks.filter((c) => c.ok).length}/{checks.length} requisitos listos
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {config.siguiente && (
            <button
              type="button"
              className={styles.advanceButton}
              onClick={handleAvanzarClick}
              disabled={!puedeAvanzar || isPending}
              title={puedeAvanzar ? config.siguienteLabel : "Completa los requisitos pendientes"}
            >
              {isPending ? "Avanzando…" : (
                <>
                  {config.siguienteLabel}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          )}

          {checks.length > 0 && (
            <button
              type="button"
              onClick={() => setColapsado(!colapsado)}
              className={styles.toggleCollapseBtn}
              aria-label={colapsado ? "Expandir requisitos" : "Colapsar requisitos"}
            >
              {colapsado ? "Ver requisitos ▾" : "Ocultar ▴"}
            </button>
          )}
        </div>
      </div>

      {!colapsado && checks.length > 0 && (
        <div className={styles.guiaContent}>
          <div className={styles.checklistSection}>
            <div className={styles.checkItems}>
              {checks.map((item) => (
                <span
                  key={item.id}
                  className={`${styles.checkItem} ${item.ok ? styles.checkItemOk : styles.checkItemPending}`}
                >
                  {item.ok ? <CheckCircle2 size={15} /> : <CircleAlert size={15} />}
                  {item.label}
                </span>
              ))}
            </div>
          </div>
          {!puedeAvanzar && faltantes.length > 0 && (
            <span className={styles.advanceHelper}>
              Faltan {faltantes.length} requisito(s) obligatorio(s)
            </span>
          )}
          {errorMsg && <span className={styles.advanceHelper}>{errorMsg}</span>}
        </div>
      )}

      <ModalConfirmacion
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={ejecutarAvanzar}
        title="¿Enviar orden a Producción?"
        description={
          <div>
            <p>
              Estás a punto de enviar el pedido <strong>{pedido.codigo}</strong> al taller.
            </p>
            <p style={{ marginTop: "10px", fontSize: "0.85rem", color: "#64748b" }}>
              Los 3 bloques operativos (Diseño, Lista de Prendas y Comercial) han sido validados. Al confirmar, la ficha técnica se congelará para corte y confección.
            </p>
          </div>
        }
        confirmText="Confirmar Envío a Taller"
        cancelText="Volver a Revisar"
        variant="success"
        isPending={isPending}
      />
    </div>
  );
}
