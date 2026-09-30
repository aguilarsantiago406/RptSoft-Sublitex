"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { useIsClient } from "@/lib/useIsClient";
import type { TipoBloque } from "../types/bloque";
import styles from "./modalReabrirBloque.module.css";

interface ModalReabrirBloqueProps {
  isOpen: boolean;
  tipo: TipoBloque | null;
  onClose: () => void;
  onConfirm: (motivo: string) => Promise<void>;
  isPending?: boolean;
}

const NOMBRES_BLOQUE: Record<TipoBloque, string> = {
  DISENO: "Diseño",
  LISTA: "Lista de Prendas",
  COMERCIAL: "Comercial",
};

export function ModalReabrirBloque({
  isOpen,
  tipo,
  onClose,
  onConfirm,
  isPending = false,
}: ModalReabrirBloqueProps) {
  const isClient = useIsClient();
  const [motivo, setMotivo] = useState("");
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  if (!isOpen || !isClient || !tipo) return null;

  function handleClose() {
    setMotivo("");
    setErrorLocal(null);
    onClose();
  }

  const esValido = motivo.trim().length >= 5;

  async function handleConfirm() {
    if (!esValido) {
      setErrorLocal("El motivo debe tener al menos 5 caracteres.");
      return;
    }
    setErrorLocal(null);
    await onConfirm(motivo.trim());
    setMotivo("");
  }

  return createPortal(
    <div className={styles.overlay} onClick={handleClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <div className={styles.iconWrapper}>
              <AlertTriangle size={20} color="#b45309" />
            </div>
            <div>
              <h2 className={styles.title}>Reabrir Bloque {NOMBRES_BLOQUE[tipo]}</h2>
              <p className={styles.subtitle}>
                Esta acción creará una nueva versión auditable en la base de datos.
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            disabled={isPending}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          <label htmlFor="motivo-reapertura" className={styles.label}>
            Motivo obligatorio de la reapertura: <span className={styles.required}>*</span>
          </label>
          <textarea
            id="motivo-reapertura"
            className={styles.textarea}
            rows={3}
            value={motivo}
            onChange={(e) => {
              setMotivo(e.target.value);
              if (errorLocal) setErrorLocal(null);
            }}
            placeholder="Ej. Cliente solicita rectificar talla en grupo de camisetas..."
            disabled={isPending}
          />
          <span className={styles.hint}>Mínimo 5 caracteres para auditoría formal.</span>
          {errorLocal && <div className={styles.errorText}>{errorLocal}</div>}
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
            type="button"
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={!esValido || isPending}
          >
            {isPending ? "Reabriendo..." : "Confirmar Reapertura"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
