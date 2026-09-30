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
  codigo?: string;
}

interface EtapaConfig {
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

const ETAPAS_CONFIG: Record<EstadoPedido, EtapaConfig> = {
  BORRADOR: {
    numero: 1,
    titulo: "Datos y fecha de entrega",
    detalle: "Asigná el cliente y pactá la fecha de entrega.",
    siguiente: "EN_CONFIGURACION",
    siguienteLabel: "Ir a Configuración",
    getChecks: (p) => [
      { id: "cli", label: "Cliente asignado", ok: Boolean(p.cliente?.nombre) },
      { id: "fec", label: "Fecha de entrega pactada", codigo: "R-A09", ok: Boolean(p.fechaCompromiso) },
    ],
  },
  EN_CONFIGURACION: {
    numero: 2,
    titulo: "Grupos y colores",
    detalle: "Creá al menos un grupo de prendas y la paleta de colores.",
    siguiente: "EN_RECOLECCION",
    siguienteLabel: "Abrir recolección de tallas",
    getChecks: (p) => [
      { id: "grp", label: "Al menos 1 grupo de prendas", codigo: "R-B02", ok: (p.grupos?.length ?? 0) > 0 },
      { id: "col", label: "Colores definidos", ok: (p.colores?.length ?? 0) > 0 },
    ],
  },
  EN_RECOLECCION: {
    numero: 3,
    titulo: "Tallas y participantes",
    detalle: "Cargá tallas, dorsales y nombres de las prendas.",
    siguiente: "EN_REVISION",
    siguienteLabel: "Pasar a Revisión",
    getChecks: (_, __, ___, total) => [
      { id: "pre", label: "Prendas o participantes registrados", ok: total > 0 },
    ],
  },
  EN_REVISION: {
    numero: 4,
    titulo: "Auditoría de calidad",
    detalle: "Cerrá los 3 bloques para liberar el pedido al taller.",
    siguiente: "EN_PRODUCCION",
    siguienteLabel: "Enviar a Producción",
    checksEnTarjetas: true,
    resumenFaltantes: (n) => `Falta cerrar ${n} de 3 bloques`,
    getChecks: (_p, _disenos, _envio, _total, _resumen, bloques) => {
      const g = evaluarBloquesReales(bloques || []);
      return [
        { id: "blk-diseno", label: "Diseño", ok: g.diseno.cerrado },
        { id: "blk-lista", label: "Lista de prendas", codigo: "R-H03", ok: g.lista.cerrado },
        { id: "blk-comercial", label: "Comercial", codigo: "R-H03", ok: g.comercial.cerrado },
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
    detalle: "Verificá la proforma comercial antes del cierre.",
    siguiente: "CERRADO",
    siguienteLabel: "Cerrar Pedido",
    getChecks: () => [
      { id: "liq", label: "Recepción confirmada y cobranza 100%", ok: true },
    ],
  },
  CERRADO: {
    numero: 7,
    titulo: "Completado",
    detalle: "El pedido cerró su ciclo.",
    getChecks: () => [],
  },
  CANCELADO: {
    numero: 0,
    titulo: "Cancelado",
    detalle: "Salió del flujo de producción.",
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

  const config = ETAPAS_CONFIG[pedido.estado] || ETAPAS_CONFIG.BORRADOR;
  const checks = config.getChecks(pedido, disenos, datosEnvio, totalPrendas, resumenProduccion, bloques);
  const faltantes = checks.filter((c) => !c.ok);
  const puedeAvanzar = faltantes.length === 0 && Boolean(config.siguiente);
  const resumenFaltantes = config.resumenFaltantes ?? ((n: number) => `Falta ${n} requisito${n === 1 ? "" : "s"}`);

  function irABloques() {
    document.getElementById("bloques")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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
          <span className={styles.etapaBadge}>
            Etapa {config.numero}
            {config.numero > 0 ? " de 7" : ""}
          </span>
          <h2 className={styles.guiaTitle}>{config.titulo}</h2>
        </div>
        <p className={styles.guiaSubtitle}>{config.detalle}</p>
      </div>

      <div className={styles.guiaContent}>
        <div className={styles.estadoRow}>
          {!puedeAvanzar && faltantes.length > 0 ? (
            <>
              <span className={styles.bloqueoIcon}>
                <CircleAlert size={16} />
              </span>
              <span className={styles.bloqueoTexto}>
                {resumenFaltantes(faltantes.length)}
                {config.checksEnTarjetas && (
                  <button type="button" className={styles.bloqueoLink} onClick={irABloques}>
                    Ver abajo
                  </button>
                )}
              </span>
            </>
          ) : (
            <>
              <span className={styles.listoIcon}>
                <CheckCircle2 size={16} />
              </span>
              <span className={styles.listoTexto}>
                {puedeAvanzar ? "Todo listo para avanzar" : "Etapa completada"}
              </span>
            </>
          )}
        </div>

        {!config.checksEnTarjetas && checks.length > 0 && (
          <ul className={styles.checkList}>
            {checks.map((item) => (
              <li
                key={item.id}
                className={item.ok ? styles.checkItemOk : styles.checkItemPending}
                title={item.codigo ? `Regla ${item.codigo}` : undefined}
              >
                {item.ok ? <CheckCircle2 size={14} /> : <CircleAlert size={14} />}
                <span>{item.label}</span>
                {item.codigo && <code className={styles.checkCodigo}>{item.codigo}</code>}
              </li>
            ))}
          </ul>
        )}

        {config.siguiente && (
          <div className={styles.actionsSection}>
            <button
              type="button"
              className={styles.advanceButton}
              onClick={handleAvanzarClick}
              disabled={!puedeAvanzar || isPending}
              title={puedeAvanzar ? config.siguienteLabel : resumenFaltantes(faltantes.length)}
            >
              {isPending ? "Avanzando…" : (
                <>
                  {config.siguienteLabel}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            {errorMsg && <span className={styles.advanceHelper}>{errorMsg}</span>}
          </div>
        )}
      </div>

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
              Los 3 bloques están cerrados. Al confirmar, la ficha técnica queda congelada para corte y confección.
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
