"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/lib/useIsClient";
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

const SUGERENCIAS_POR_TIPO: Record<string, string[]> = {
  PRODUCTO: [
    "Kit completo",
    "Camiseta sola",
    "Camiseta",
    "Camiseta + short",
    "Conjunto deportivo",
    "Camiseta arquero",
    "Conjunto arquero",
    "Short solo",
    "Short",
    "Medias",
    "Falda deportiva",
    "Falda",
    "Banderola",
  ],
  RECARGO_TALLA: ["XL", "XXL", "XXXL", "6", "8", "10", "12", "14", "16", "S", "M", "L"],
  RECARGO_TELA: [
    "Marathon",
    "Puma",
    "Palmeira",
    "Hexagonal",
    "Labrada",
    "Dry Fit",
    "Win Fresh",
    "Nova sin forro",
  ],
  RECARGO_CUELLO: ["Camisero", "V cruzado", "Redondo cruzado", "V", "Redondo"],
  RECARGO_ACABADO: ["Termosellado", "Bordado", "DTF", "Vinil", "Parche", "Sublimado"],
  ADICIONAL: ["Bolsillo", "Cierre", "Diseño especial", "Flete provincia"],
  COSTO_INTERNO: [
    "Impresión metro lineal",
    "Confección camiseta",
    "Confección short",
    "Tela por metro lineal",
  ],
};

export function ModalTarifaForm({ isOpen, onClose, initial }: ModalTarifaFormProps) {
  const isClient = useIsClient();
  const hoyStr = fechaLocalInput(new Date().toISOString());

  const [tipo, setTipo] = useState<string>(initial?.tipo ?? "PRODUCTO");
  const [concepto, setConcepto] = useState(initial?.concepto ?? "");
  const [valor, setValor] = useState(initial ? String(initial.valor) : "");
  const [vigenteDesde, setVigenteDesde] = useState(initial?.vigenteDesde ? fechaLocalInput(initial.vigenteDesde) : hoyStr);
  const [vigenteHasta, setVigenteHasta] = useState(fechaLocalInput(initial?.vigenteHasta));
  const [nota, setNota] = useState(initial?.nota ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !isClient) return null;

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

  return createPortal(
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
              list="tarifa-conceptos-sugeridos"
              placeholder="Ej: Kit completo, XL, Puma, Camisero, Termosellado"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className={styles.formInput}
              autoFocus
            />
            <datalist id="tarifa-conceptos-sugeridos">
              {(SUGERENCIAS_POR_TIPO[tipo] ?? []).map((sug) => (
                <option key={sug} value={sug} />
              ))}
            </datalist>
          </div>

          <div className={styles.twoColsLayout} style={{ gap: "12px" }}>
            <div className={styles.formField}>
              <label htmlFor="tarifa-valor">Valor (S/) *</label>
              <input
                id="tarifa-valor"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="Ej: 45.00 (0 para base sin recargo)"
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
    </div>,
    document.body
  );
}