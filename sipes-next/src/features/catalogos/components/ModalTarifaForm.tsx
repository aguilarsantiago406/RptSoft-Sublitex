"use client";

import { useEffect, useState, useTransition } from "react";
import type { TarifaCatalogo } from "../types/catalogo";
import { TIPOS_TARIFA } from "../types/catalogo";
import {
  actionActualizarTarifa,
  actionCrearTarifa,
  type TarifaForm,
} from "../actions/tarifas.actions";
import styles from "./catalogos.module.css";

interface ModalTarifaFormProps {
  isOpen: boolean;
  onClose: () => void;
  initial?: TarifaCatalogo | null;
}

function fechaLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function ModalTarifaForm({ isOpen, onClose, initial }: ModalTarifaFormProps) {
  const [tipo, setTipo] = useState<string>("PRODUCTO");
  const [concepto, setConcepto] = useState("");
  const [valor, setValor] = useState("");
  const [vigenteDesde, setVigenteDesde] = useState("");
  const [vigenteHasta, setVigenteHasta] = useState("");
  const [nota, setNota] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) return;
    setTipo(initial?.tipo ?? "PRODUCTO");
    setConcepto(initial?.concepto ?? "");
    setValor(initial ? String(initial.valor) : "");
    setVigenteDesde(fechaLocalInput(initial?.vigenteDesde));
    setVigenteHasta(fechaLocalInput(initial?.vigenteHasta));
    setNota(initial?.nota ?? "");
    setError(null);
  }, [isOpen, initial]);

  if (!isOpen) return null;

  function handleReset() {
    setError(null);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data: TarifaForm = {
      tipo: tipo as TarifaForm["tipo"],
      concepto,
      valor,
      vigenteDesde,
      ...(vigenteHasta ? { vigenteHasta } : {}),
      ...(nota.trim() ? { nota } : {}),
    };

    setError(null);
    startTransition(async () => {
      const res = initial
        ? await actionActualizarTarifa(initial.id, data)
        : await actionCrearTarifa(data);

      if (!res.ok) {
        setError(res.error || "No se pudo guardar la tarifa.");
        return;
      }

      handleReset();
    });
  }

  return (
    <div className={styles.modalBackdrop} onClick={handleReset}>
      <div className={styles.modalCardWide} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>
              {initial ? "Editar tarifa" : "Nueva tarifa"}
            </h3>
            <p className={styles.modalSubtitle}>
              Catálogo oficial de costos y recargos de confección (R-K10)
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
            <label htmlFor="tarifa-tipo">Tipo *</label>
            <select
              id="tarifa-tipo"
              required
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={styles.formInput}
            >
              {TIPOS_TARIFA.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="tarifa-concepto">Concepto *</label>
            <input
              id="tarifa-concepto"
              type="text"
              required
              placeholder="Ej: Kit completo, XL, Puma, Camisero, Termosellado"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className={styles.formInput}
              autoFocus
            />
          </div>

          <div className={styles.twoColsLayout} style={{ gap: "12px" }}>
            <div className={styles.formField}>
              <label htmlFor="tarifa-valor">Valor (S/) *</label>
              <input
                id="tarifa-valor"
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="Ej: 150.00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="tarifa-nota">Nota (Opcional)</label>
              <input
                id="tarifa-nota"
                type="text"
                placeholder="Ej: Tarifa base para kit completo"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.twoColsLayout} style={{ gap: "12px" }}>
            <div className={styles.formField}>
              <label htmlFor="tarifa-desde">Vigencia desde *</label>
              <input
                id="tarifa-desde"
                type="date"
                required
                value={vigenteDesde}
                onChange={(e) => setVigenteDesde(e.target.value)}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="tarifa-hasta">Vigencia hasta (Opcional)</label>
              <input
                id="tarifa-hasta"
                type="date"
                value={vigenteHasta}
                onChange={(e) => setVigenteHasta(e.target.value)}
                className={styles.formInput}
              />
            </div>
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
            <button type="submit" className={styles.modalSubmitButton} disabled={isPending}>
              {isPending ? "Guardando…" : initial ? "Guardar cambios" : "Crear tarifa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}