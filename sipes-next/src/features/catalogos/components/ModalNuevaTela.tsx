"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { X, Layers, AlertCircle } from "lucide-react";
import { useIsClient } from "@/lib/useIsClient";
import { actionCrearTela } from "../actions/catalogos.actions";
import styles from "./catalogos.module.css";

interface ModalNuevaTelaProps {
  isOpen: boolean;
  onClose: () => void;
  atributoId: string;
}

export function ModalNuevaTela({ isOpen, onClose, atributoId }: ModalNuevaTelaProps) {
  const isClient = useIsClient();
  const [codigo, setCodigo] = useState("");
  const [etiqueta, setEtiqueta] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !isClient) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const codLimpio = codigo.trim().toUpperCase().replace(/\s+/g, "_");
    const etiLimpia = etiqueta.trim();

    if (!codLimpio) {
      setError("El código de la tela es obligatorio (ej. MICROFIBRA, WIN_FRESH).");
      return;
    }
    if (!etiLimpia) {
      setError("El nombre comercial o etiqueta de la tela es obligatorio.");
      return;
    }
    if (!atributoId) {
      setError("No se identificó el catálogo de telas en la base de datos.");
      return;
    }

    startTransition(async () => {
      const res = await actionCrearTela({
        atributoId,
        codigo: codLimpio,
        etiqueta: etiLimpia,
      });

      if (!res.ok) {
        setError(res.error || "No se pudo registrar la nueva tela.");
        return;
      }

      setCodigo("");
      setEtiqueta("");
      onClose();
    });
  }

  return createPortal(
    <div className={styles.modalBackdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCardWide} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Layers size={22} color="var(--sky-dark)" />
            <div>
              <h2 className={styles.modalTitle}>Nueva Tela / Material Textil</h2>
              <p className={styles.modalSubtitle}>
                Incorporación de tejido oficial al catálogo de confección.
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.modalCloseButton}
            onClick={onClose}
            disabled={isPending}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className={styles.modalErrorBanner} role="alert">
            <AlertCircle size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formField}>
            <label htmlFor="codigo-tela">Código Técnico *</label>
            <input
              id="codigo-tela"
              type="text"
              className={styles.formInput}
              value={codigo}
              onChange={(e) => {
                setCodigo(e.target.value.toUpperCase());
                if (error) setError(null);
              }}
              placeholder="Ej. MICROFIBRA_PRO, WIN_FRESH"
              disabled={isPending}
              required
            />
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
              Identificador único para taller y patrones textiles.
            </span>
          </div>

          <div className={styles.formField}>
            <label htmlFor="etiqueta-tela">Nombre Comercial (Etiqueta) *</label>
            <input
              id="etiqueta-tela"
              type="text"
              className={styles.formInput}
              value={etiqueta}
              onChange={(e) => {
                setEtiqueta(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ej. Microfibra Dry Fit Ultra"
              disabled={isPending}
              required
            />
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
              Nombre legible visible en las listas desplegables y proformas.
            </span>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.modalCancelButton}
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.modalSubmitButton}
              disabled={isPending}
            >
              {isPending ? "Guardando..." : "Registrar Tela"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
