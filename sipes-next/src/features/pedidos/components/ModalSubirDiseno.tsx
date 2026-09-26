"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { actionSubirYCrearDiseno, actionActualizarArtefactos } from "../actions/disenos.actions";
import styles from "./pedidos.module.css";

interface ModalSubirDisenoProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: string;
  disenoId?: string;
  versionNumero?: number;
}

export function ModalSubirDiseno({
  isOpen,
  onClose,
  pedidoId,
  disenoId,
  versionNumero,
}: ModalSubirDisenoProps) {
  const router = useRouter();
  const [mockupFile, setMockupFile] = useState<File | null>(null);
  const [vectorFile, setVectorFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const isReemplazo = Boolean(disenoId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isReemplazo && !mockupFile) {
      setError("Debes seleccionar la imagen del mockup.");
      return;
    }
    if (isReemplazo && !mockupFile && !vectorFile) {
      setError("Debes seleccionar al menos un archivo para actualizar.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      if (mockupFile) formData.append("mockup", mockupFile);
      if (vectorFile) formData.append("vector", vectorFile);

      const res = isReemplazo
        ? await actionActualizarArtefactos(disenoId!, pedidoId, formData)
        : await actionSubirYCrearDiseno(pedidoId, formData);

      if (!res.ok) {
        setError(res.error || "Error al procesar el archivo.");
        return;
      }

      onClose();
      router.refresh();
    });
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>
              {isReemplazo ? `Reemplazar Archivos (v${versionNumero})` : "Subir Mockup de Diseño"}
            </h3>
            <p className={styles.modalSubtitle}>
              {isReemplazo
                ? "Actualiza la imagen previa o el archivo vectorial del taller"
                : "Carga la propuesta gráfica para aprobación del cliente"}
            </p>
          </div>
          <button type="button" className={styles.modalCloseButton} onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {error && <div className={styles.modalErrorBanner} role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formField}>
            <label htmlFor="input-mockup">
              Imagen del Mockup (PNG, JPG, WebP) {!isReemplazo && "*"}
            </label>
            <input
              id="input-mockup"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              required={!isReemplazo}
              onChange={(e) => setMockupFile(e.target.files?.[0] || null)}
              className={styles.formInput}
            />
            <small style={{ color: "#64748b", fontSize: "0.76rem", marginTop: "2px" }}>
              Vista previa visual para el cliente y el equipo comercial.
            </small>
          </div>

          <div className={styles.formField}>
            <label htmlFor="input-vector">
              Archivo Vectorial / Taller (Opcional - .AI, .CDR, .PDF)
            </label>
            <input
              id="input-vector"
              type="file"
              accept=".ai,.cdr,.pdf,.tif"
              onChange={(e) => setVectorFile(e.target.files?.[0] || null)}
              className={styles.formInput}
            />
            <small style={{ color: "#64748b", fontSize: "0.76rem", marginTop: "2px" }}>
              Archivo maestro para producción, corte y sublimación.
            </small>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.modalCancelButton} onClick={onClose} disabled={isPending}>
              Cancelar
            </button>
            <button type="submit" className={styles.modalSubmitButton} disabled={isPending}>
              {isPending ? "Subiendo a Storage..." : isReemplazo ? "Guardar Cambios" : "Subir y Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
