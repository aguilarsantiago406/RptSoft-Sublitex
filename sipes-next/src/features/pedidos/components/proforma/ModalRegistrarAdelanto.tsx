"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, DollarSign, X, AlertCircle } from "lucide-react";
import { useIsClient } from "@/lib/useIsClient";
import { actionRegistrarAdelanto } from "../../actions/comercial.actions";
import styles from "./modalEmitirConfirmacion.module.css";

interface ModalRegistrarAdelantoProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: string;
  confirmacionId: string;
  version: number;
  totalSinIgv: number;
  adelantoActual: number;
}

export function ModalRegistrarAdelanto({
  isOpen,
  onClose,
  pedidoId,
  confirmacionId,
  version,
  totalSinIgv,
  adelantoActual,
}: ModalRegistrarAdelantoProps) {
  const isClient = useIsClient();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inicializar con el 50% si el actual es 0, o con el actual
  const sugerido50 = Math.round(totalSinIgv * 0.5 * 100) / 100;
  const [adelantoRecibido, setAdelantoRecibido] = useState<number>(
    adelantoActual > 0 ? adelantoActual : sugerido50
  );

  if (!isOpen || !isClient) return null;

  const saldoPendiente = Math.max(0, Math.round((totalSinIgv - adelantoRecibido) * 100) / 100);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (adelantoRecibido < 0 || adelantoRecibido > totalSinIgv) {
      setErrorMsg(`El adelanto debe estar entre S/ 0 y el total (S/ ${totalSinIgv.toFixed(2)})`);
      return;
    }

    startTransition(async () => {
      const res = await actionRegistrarAdelanto(pedidoId, confirmacionId, adelantoRecibido);

      if (!res.ok) {
        setErrorMsg(res.error || "No se pudo registrar el adelanto.");
        return;
      }

      onClose();
    });
  }

  return createPortal(
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <div className={styles.iconWrapper}>
              <DollarSign size={20} color="#15803d" />
            </div>
            <div>
              <h2 className={styles.title}>Registrar Adelanto Recibido</h2>
              <p className={styles.subtitle}>
                Confirmación v{version} · Registra el abono del cliente para habilitar corte y taller.
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isPending}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          {errorMsg && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="adelanto" className={styles.label}>
              Monto del adelanto depositado por el cliente (S/):
            </label>
            <input
              id="adelanto"
              type="number"
              step="0.01"
              min="0"
              max={totalSinIgv}
              className={styles.input}
              value={adelantoRecibido}
              onChange={(e) => setAdelantoRecibido(parseFloat(e.target.value) || 0)}
              required
              disabled={isPending}
              autoFocus
            />
            <span style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "4px" }}>
              Sugerido 50%: S/ {sugerido50.toFixed(2)} (Total de la orden: S/ {totalSinIgv.toFixed(2)})
            </span>
          </div>

          <div className={styles.previewCard}>
            <div className={styles.previewRowTotal}>
              <span>TOTAL DE LA ORDEN:</span>
              <span>S/ {totalSinIgv.toFixed(2)}</span>
            </div>
            <div className={styles.previewRow}>
              <span>Adelanto a registrar:</span>
              <span style={{ color: "#15803d", fontWeight: 700 }}>
                S/ {adelantoRecibido.toFixed(2)}
              </span>
            </div>
            <div className={styles.previewRowSaldo}>
              <span>NUEVO SALDO PENDIENTE:</span>
              <span style={{ color: "#b91c1c", fontWeight: 700 }}>
                S/ {saldoPendiente.toFixed(2)}
              </span>
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.confirmBtn}
              disabled={isPending}
            >
              <CheckCircle2 size={16} />
              {isPending ? "Guardando..." : "Guardar Adelanto"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
