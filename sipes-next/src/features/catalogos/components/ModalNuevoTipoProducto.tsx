"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { X, Shirt, AlertCircle } from "lucide-react";
import { useIsClient } from "@/lib/useIsClient";
import { actionCrearTipoProducto } from "../actions/catalogos.actions";
import styles from "./catalogos.module.css";

interface ModalNuevoTipoProductoProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModalNuevoTipoProducto({ isOpen, onClose }: ModalNuevoTipoProductoProps) {
  const isClient = useIsClient();
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [camisetas, setCamisetas] = useState(1);
  const [shorts, setShorts] = useState(0);
  const [medias, setMedias] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !isClient) return null;

  const totalPiezas = camisetas + shorts + medias;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const codLimpio = codigo.trim().toUpperCase().replace(/\s+/g, "_");
    const nomLimpio = nombre.trim();

    if (!codLimpio) {
      setError("El código de producto es obligatorio (ej. CHALECO, CASACA).");
      return;
    }
    if (!nomLimpio) {
      setError("El nombre descriptivo es obligatorio.");
      return;
    }
    if (totalPiezas <= 0) {
      setError("Debe asignar al menos una pieza física (camiseta, short o medias) para la confección.");
      return;
    }

    startTransition(async () => {
      const res = await actionCrearTipoProducto({
        codigo: codLimpio,
        nombre: nomLimpio,
        camisetas,
        shorts,
        medias,
      });

      if (!res.ok) {
        setError(res.error || "No se pudo registrar el tipo de prenda.");
        return;
      }

      setCodigo("");
      setNombre("");
      setCamisetas(1);
      setShorts(0);
      setMedias(0);
      onClose();
    });
  }

  return createPortal(
    <div className={styles.modalBackdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCardWide} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Shirt size={22} color="var(--sky-dark)" />
            <div>
              <h2 className={styles.modalTitle}>Nuevo Tipo de Prenda / Producto</h2>
              <p className={styles.modalSubtitle}>
                Catálogo base y configuración de piezas físicas para taller de confección.
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
          <div className={styles.twoColsLayout}>
            <div className={styles.formField}>
              <label htmlFor="codigo-producto">Código Técnico *</label>
              <input
                id="codigo-producto"
                type="text"
                className={styles.formInput}
                value={codigo}
                onChange={(e) => {
                  setCodigo(e.target.value.toUpperCase());
                  if (error) setError(null);
                }}
                placeholder="Ej. CASACA, CHALECO"
                disabled={isPending}
                required
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="nombre-producto">Nombre Comercial *</label>
              <input
                id="nombre-producto"
                type="text"
                className={styles.formInput}
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Ej. Casaca Impermeable"
                disabled={isPending}
                required
              />
            </div>
          </div>

          {/* PIEZAS FÍSICAS */}
          <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 400, color: "#1e293b", marginBottom: "4px" }}>
              Desglose de Piezas Físicas por Unidad
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "12px", lineHeight: "1.3" }}>
              Indica cuántas piezas reales se envían a corte y confección por cada prenda contratada. Total actual: {totalPiezas} piezas.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              <div className={styles.formField}>
                <label htmlFor="camisetas-count" style={{ fontSize: "0.7rem" }}>Camisetas</label>
                <input
                  id="camisetas-count"
                  type="number"
                  min="0"
                  max="10"
                  className={styles.formInput}
                  value={camisetas}
                  onChange={(e) => setCamisetas(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={isPending}
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="shorts-count" style={{ fontSize: "0.7rem" }}>Shorts</label>
                <input
                  id="shorts-count"
                  type="number"
                  min="0"
                  max="10"
                  className={styles.formInput}
                  value={shorts}
                  onChange={(e) => setShorts(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={isPending}
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="medias-count" style={{ fontSize: "0.7rem" }}>Pares Medias</label>
                <input
                  id="medias-count"
                  type="number"
                  min="0"
                  max="10"
                  className={styles.formInput}
                  value={medias}
                  onChange={(e) => setMedias(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={isPending}
                />
              </div>
            </div>
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
              {isPending ? "Guardando..." : "Crear Tipo de Prenda"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
