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
