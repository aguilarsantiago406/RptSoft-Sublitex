"use client";

import { useState, useTransition } from "react";
import type { TipoProductoCatalogoItem } from "../api/pedidos.api";
import { actionCrearGrupo } from "../actions/grupos.actions";
import styles from "./pedidos.module.css";

interface ModalGrupoFormProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: string;
  tiposProducto: TipoProductoCatalogoItem[];
}

export function ModalGrupoForm({
  isOpen,
  onClose,
  pedidoId,
  tiposProducto,
}: ModalGrupoFormProps) {
  const [nombre, setNombre] = useState("");
  const [tipoProductoId, setTipoProductoId] = useState(tiposProducto[0]?.id ?? "");
  const [cantidadContratada, setCantidadContratada] = useState<number>(20);
  const [politicaNumeracion, setPoliticaNumeracion] = useState<"LIBRE" | "UNICA">("LIBRE");
  const [observaciones, setObservaciones] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleReset() {
    setNombre("");
    setTipoProductoId(tiposProducto[0]?.id ?? "");
    setCantidadContratada(20);
    setPoliticaNumeracion("LIBRE");
    setObservaciones("");
    setError(null);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El nombre del grupo es obligatorio.");
      return;
    }
    if (!tipoProductoId) {
      setError("Debes seleccionar un tipo de producto.");
      return;
    }
    if (cantidadContratada < 1) {
      setError("La cantidad contratada debe ser al menos 1.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await actionCrearGrupo(pedidoId, {
        nombre: nombre.trim(),
        tipoProductoId,
        cantidadContratada,
        politicaNumeracion,
        observaciones: observaciones.trim() || undefined,
      });

      if (!res.ok) {
        setError(res.error || "No se pudo crear el grupo.");
        return;
      }

      handleReset();
    });
  }

  const selectedTipo = tiposProducto.find((t) => t.id === tipoProductoId);

  return (
    <div className={styles.modalBackdrop} onClick={handleReset}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Agregar Grupo Contratado</h3>
            <p className={styles.modalSubtitle}>
              Pacto comercial de prendas a fabricar (Regla R-B02)
            </p>
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
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formField}>
            <label htmlFor="grupo-nombre">Nombre del grupo *</label>
            <input
              id="grupo-nombre"
              type="text"
              required
              placeholder="Ej: Camperas Promo 2026 / Conjunto Titular"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={styles.formInput}
              autoFocus
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="grupo-tipo">Tipo de producto *</label>
            <select
              id="grupo-tipo"
              value={tipoProductoId}
              onChange={(e) => setTipoProductoId(e.target.value)}
              className={styles.formInput}
              required
            >
              {tiposProducto.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre} ({tipo.codigo})
                </option>
              ))}
            </select>
            {selectedTipo && (
              <small className={styles.formHint}>
                Piezas físicas: {selectedTipo.componentes.camisetas} camiseta(s) ·{" "}
                {selectedTipo.componentes.shorts} short(s) ·{" "}
                {selectedTipo.componentes.medias} par(es) de medias
              </small>
            )}
          </div>

          <div className={styles.twoColsLayout} style={{ gap: "12px" }}>
            <div className={styles.formField}>
              <label htmlFor="grupo-cantidad">Cantidad contratada *</label>
              <input
                id="grupo-cantidad"
                type="number"
                min={1}
                required
                value={cantidadContratada}
                onChange={(e) => setCantidadContratada(parseInt(e.target.value, 10) || 1)}
                className={styles.formInput}
              />
              <small className={styles.formHint}>Total pactado con el cliente</small>
            </div>

            <div className={styles.formField}>
              <label htmlFor="grupo-politica">Numeración</label>
              <select
                id="grupo-politica"
                value={politicaNumeracion}
                onChange={(e) => setPoliticaNumeracion(e.target.value as "LIBRE" | "UNICA")}
                className={styles.formInput}
              >
                <option value="LIBRE">Libre (permite repetir)</option>
                <option value="UNICA">Única (sin duplicados)</option>
              </select>
              <small className={styles.formHint}>
                {politicaNumeracion === "UNICA"
                  ? "Para clubes o equipos"
                  : "Estándar para promos"}
              </small>
            </div>
          </div>

          <div className={styles.formField}>
            <label htmlFor="grupo-obs">Observaciones (Opcional)</label>
            <input
              id="grupo-obs"
              type="text"
              placeholder="Ej: Bordado en manga izquierda, cuello V"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
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
              {isPending ? "Creando..." : "Crear Grupo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
