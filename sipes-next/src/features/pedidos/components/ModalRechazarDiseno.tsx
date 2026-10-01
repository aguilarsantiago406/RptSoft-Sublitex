"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useIsClient } from "@/lib/useIsClient";
import { actionRechazarDiseno } from "../actions/disenos.actions";
import styles from "./pedidos.module.css";

interface ModalRechazarDisenoProps {
  isOpen: boolean;
  onClose: () => void;
  disenoId: string;
  pedidoId: string;
}

export function ModalRechazarDiseno({
  isOpen,
  onClose,
  disenoId,
  pedidoId,
}: ModalRechazarDisenoProps) {
  const isClient = useIsClient();
  const router = useRouter();
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !isClient) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!motivo.trim()) {
      setError("Debes indicar el motivo del rechazo u observación.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await actionRechazarDiseno(disenoId, pedidoId, motivo.trim());
      if (!res.ok) {
        setError(res.error || "No se pudo registrar el rechazo.");
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return createPortal(
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Rechazar Diseño / Observación Técnica</h3>
            <p className={styles.modalSubtitle}>Indica con precisión los ajustes que el diseñador debe corregir en la siguiente versión</p>
          </div>
          <button type="button" className={styles.modalCloseButton} onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {error && <div className={styles.modalErrorBanner} role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formField}>
            <label htmlFor="rechazo-motivo">Motivo de rechazo / Observación técnica *</label>
            <textarea
              id="rechazo-motivo"
              rows={4}
              required
              placeholder="Ej: El cuello debe ser V, no redondo. Alinear el escudo central 3 cm más arriba y verificar que los nombres en espalda sean en tipografía blanca con borde negro."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className={styles.formInput}
              autoFocus
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.modalCancelButton} onClick={onClose} disabled={isPending}>
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.modalSubmitButton}
              style={{ background: "#e11d48", borderColor: "#e11d48" }}
              disabled={isPending}
            >
              {isPending ? "Registrando..." : "Confirmar Rechazo"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
