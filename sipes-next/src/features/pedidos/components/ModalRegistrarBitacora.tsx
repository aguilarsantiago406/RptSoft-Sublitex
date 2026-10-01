"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { ClipboardList, X } from "lucide-react";
import { useIsClient } from "@/lib/useIsClient";
import { actionRegistrarBitacora } from "../actions/bitacora.actions";
import styles from "./pedidos.module.css";

interface ModalRegistrarBitacoraProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: string;
}

export function ModalRegistrarBitacora({
  isOpen,
  onClose,
  pedidoId,
}: ModalRegistrarBitacoraProps) {
  const isClient = useIsClient();
  const [descripcionCambio, setDescripcionCambio] = useState("");
  const [solicitadoPor, setSolicitadoPor] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !isClient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcionCambio.trim()) {
      setErrorMsg("La descripción del cambio es obligatoria.");
      return;
    }
    if (!solicitadoPor.trim()) {
      setErrorMsg("Indica quién solicitó el cambio (ej. Cliente, Coordinador).");
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      const res = await actionRegistrarBitacora(pedidoId, {
        descripcionCambio: descripcionCambio.trim(),
        solicitadoPor: solicitadoPor.trim(),
      });
      if (res.ok) {
        onClose();
      } else {
        setErrorMsg(res.error || "Error al registrar la modificación.");
      }
    });
  };

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} style={{ maxWidth: "540px" }}>
        <div className={styles.modalHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ClipboardList size={18} color="#0f172a" />
            <h2 className={styles.modalTitle} style={{ margin: 0 }}>
              Registrar Modificación en Bitácora
            </h2>
          </div>
          <button
            type="button"
            className={styles.modalCloseButton}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className={styles.modalErrorBanner} role="alert">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formField}>
            <label htmlFor="bitacora-desc">Descripción detallada del cambio *</label>
            <textarea
              id="bitacora-desc"
              rows={3}
              required
              placeholder="Ej: El cliente solicitó por WhatsApp cambiar el polo de Carlos de talla M a L..."
              value={descripcionCambio}
              onChange={(e) => setDescripcionCambio(e.target.value)}
              className={styles.formInput}
              style={{ fontFamily: "inherit", resize: "vertical" }}
              autoFocus
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="bitacora-solicitado">Solicitado por *</label>
            <input
              id="bitacora-solicitado"
              type="text"
              required
              placeholder="Ej: Cliente (WhatsApp), Coordinador de colegio, Vendedora..."
              value={solicitadoPor}
              onChange={(e) => setSolicitadoPor(e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              padding: "10px 12px",
              borderRadius: "6px",
              fontSize: "0.78rem",
              color: "#92400e",
              lineHeight: 1.4,
            }}
          >
            ℹ️ Toda modificación post-cierre debe registrarse aquí. Posteriormente, el Coordinador Operativo o Administrador marcará si ya fue avisada a taller de confección.
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.buttonGhost}
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.buttonPrimary}
              disabled={isPending}
            >
              {isPending ? "Guardando..." : "Guardar en Bitácora"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
