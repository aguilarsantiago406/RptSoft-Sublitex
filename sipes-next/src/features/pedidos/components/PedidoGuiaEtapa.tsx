"use client";

import { useTransition, useState } from "react";
import { CheckCircle2, CircleAlert, ArrowRight } from "lucide-react";
import type { PedidoDetalle } from "../types/pedido";
import type { ResumenProduccionItem } from "../api/comercial.api";
import type { BloquePedidoItem } from "../types/bloque";
import { actionActualizarEstadoPedido } from "../actions/pedidos.actions";
import { ModalConfirmacion } from "@/components/ui/ModalConfirmacion";
import { ETAPAS_CONFIG } from "../utils/etapasConfig";
import styles from "./pedidoGuiaEtapa.module.css";

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
        <h2 className={styles.guiaTitle}>{config.titulo}</h2>

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
                  <span>{config.siguienteLabel}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
            {errorMsg && <span className={styles.advanceHelper}>{errorMsg}</span>}
          </div>
        )}
      </div>

      <div className={styles.guiaContent}>
        <div className={styles.estadoRow}>
          {!puedeAvanzar && faltantes.length > 0 ? (
            <>
              <span className={styles.bloqueoIcon}>
                <CircleAlert size={15} />
              </span>
              <span className={styles.bloqueoTexto}>
                {resumenFaltantes(faltantes.length)} para continuar
              </span>
            </>
          ) : (
            <>
              <span className={styles.listoIcon}>
                <CheckCircle2 size={15} />
              </span>
              <span className={styles.listoTexto}>
                {puedeAvanzar ? "Requisitos completados · Listo para avanzar" : "Etapa completada"}
              </span>
            </>
          )}
        </div>

        {checks.length > 0 && (
          <div className={styles.requirementsGrid}>
            {checks.map((item) => (
              <div
                key={item.id}
                className={item.ok ? styles.requirementCardOk : styles.requirementCardPending}
              >
                <div className={styles.requirementHeader}>
                  <div className={styles.requirementIndicator}>
                    {item.ok ? (
                      <CheckCircle2 size={15} className={styles.iconOk} />
                    ) : (
                      <CircleAlert size={15} className={styles.iconPending} />
                    )}
                    <span className={styles.requirementLabel}>{item.label}</span>
                  </div>
                  <span className={item.ok ? styles.tagCumplido : styles.tagPendiente}>
                    {item.ok ? "Cumplido" : "Pendiente"}
                  </span>
                </div>
                {item.subitems && item.subitems.length > 0 ? (
                  <div className={styles.subitemList}>
                    {item.subitems.map((sub, idx) => (
                      <div key={idx} className={sub.ok ? styles.subitemOk : styles.subitemPending}>
                        {sub.ok ? (
                          <CheckCircle2 size={13} className={styles.iconOk} />
                        ) : (
                          <CircleAlert size={13} className={styles.iconPending} />
                        )}
                        <span>{sub.label}</span>
                      </div>
                    ))}
                  </div>
                ) : item.detalle ? (
                  <p className={styles.requirementDetalle}>{item.detalle}</p>
                ) : null}
              </div>
            ))}
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
              Estás a punto de enviar el pedido {pedido.codigo} al taller.
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
