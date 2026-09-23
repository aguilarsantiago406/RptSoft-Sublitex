"use client";

import { useState, useTransition } from "react";
import { actionAgregarColorPedido } from "../actions/pedidos.actions";
import styles from "./pedidos.module.css";

interface ModalColorFormProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: string;
}

export function ModalColorForm({ isOpen, onClose, pedidoId }: ModalColorFormProps) {
  const [nombre, setNombre] = useState("");
  const [codigoHex, setCodigoHex] = useState("#001489");
  const [referenciaFisica, setReferenciaFisica] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleReset() {
    setNombre("");
    setCodigoHex("#001489");
    setReferenciaFisica("");
    setError(null);
    onClose();
  }

  function handleHexTextChange(val: string) {
    let clean = val.trim();
    if (!clean.startsWith("#") && clean.length > 0) {
      clean = `#${clean}`;
    }
    setCodigoHex(clean.toUpperCase());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El nombre del color es obligatorio.");
      return;
    }

    const hexRegex = /^#([0-9A-F]{6})$/i;
    if (!hexRegex.test(codigoHex)) {
      setError("El código HEX debe tener exactamente 6 caracteres hexadecimales (ej: #001489).");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await actionAgregarColorPedido(pedidoId, {
        nombre,
        codigoHex,
        referenciaFisica: referenciaFisica || undefined,
      });

      if (!res.ok) {
        setError(res.error || "No se pudo agregar el color.");
        return;
      }

      handleReset();
    });
  }

  return (
    <div className={styles.modalBackdrop} onClick={handleReset}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Agregar Color Oficial</h3>
            <p className={styles.modalSubtitle}>Código HEX obligatorio para producción (Regla R-K05)</p>
          </div>
          <button
            type="button"
            className={styles.modalCloseButton}
            onClick={handleReset}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className={styles.modalErrorBanner} role="alert">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formField}>
            <label htmlFor="color-nombre">Nombre del color *</label>
            <input
              id="color-nombre"
              type="text"
              required
              placeholder="Ej: Azul Marino Oficial"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={styles.formInput}
              autoFocus
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="color-hex">Color y Código HEX *</label>
            <div className={styles.hexPickerRow}>
              <input
                type="color"
                value={codigoHex.length === 7 ? codigoHex : "#001489"}
                onChange={(e) => setCodigoHex(e.target.value.toUpperCase())}
                className={styles.colorNativePicker}
                title="Seleccionar color visual"
              />
              <input
                id="color-hex"
                type="text"
                required
                maxLength={7}
                placeholder="#001489"
                value={codigoHex}
                onChange={(e) => handleHexTextChange(e.target.value)}
                className={`${styles.formInput} ${styles.hexTextInput}`}
              />
              <span
                className={styles.colorLiveSample}
                style={{ backgroundColor: codigoHex }}
                title="Muestra en vivo"
              />
            </div>
            <small className={styles.formHint}>Formato estricto: #RRGGBB (6 caracteres)</small>
          </div>

          <div className={styles.formField}>
            <label htmlFor="color-ref">Referencia Física / Pantone (Opcional)</label>
            <input
              id="color-ref"
              type="text"
              placeholder="Ej: Pantone 287C / Muestra física tela"
              value={referenciaFisica}
              onChange={(e) => setReferenciaFisica(e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.modalCancelButton}
              onClick={handleReset}
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.modalSubmitButton}
              disabled={isPending}
            >
              {isPending ? "Guardando..." : "Guardar Color"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
