"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/lib/useIsClient";
import { actionAgregarColorPedido, actionActualizarColorPedido } from "../actions/pedidos.actions";
import styles from "./pedidos.module.css";

interface ColorItemData {
  id: string;
  nombre: string;
  codigoHex: string;
  referenciaFisica?: string | null;
  cmykC?: number | null;
  cmykM?: number | null;
  cmykY?: number | null;
  cmykK?: number | null;
}

interface ModalColorFormProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: string;
  initialColor?: ColorItemData | null;
}

function hexToCmyk(hex: string): { c: number; m: number; y: number; k: number } {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const k = 1 - Math.max(r, g, b);
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }
  const c = Math.round(((1 - r - k) / (1 - k)) * 100);
  const m = Math.round(((1 - g - k) / (1 - k)) * 100);
  const y = Math.round(((1 - b - k) / (1 - k)) * 100);
  const kPercent = Math.round(k * 100);

  return { c, m, y, k: kPercent };
}

export function ModalColorForm({ isOpen, onClose, pedidoId, initialColor }: ModalColorFormProps) {
  const isClient = useIsClient();
  const [nombre, setNombre] = useState(initialColor?.nombre ?? "");
  const [codigoHex, setCodigoHex] = useState(initialColor?.codigoHex ?? "#001489");
  const [referenciaFisica, setReferenciaFisica] = useState(initialColor?.referenciaFisica ?? "");
  const [cmykC, setCmykC] = useState<number | "">(initialColor?.cmykC ?? "");
  const [cmykM, setCmykM] = useState<number | "">(initialColor?.cmykM ?? "");
  const [cmykY, setCmykY] = useState<number | "">(initialColor?.cmykY ?? "");
  const [cmykK, setCmykK] = useState<number | "">(initialColor?.cmykK ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !isClient) return null;

  function handleReset() {
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

  function handleAutoCalcularCmyk() {
    const hexRegex = /^#([0-9A-F]{6})$/i;
    if (hexRegex.test(codigoHex)) {
      const calc = hexToCmyk(codigoHex);
      setCmykC(calc.c);
      setCmykM(calc.m);
      setCmykY(calc.y);
      setCmykK(calc.k);
    }
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

    const parseNum = (v: number | "") => (typeof v === "number" && !isNaN(v) ? Math.max(0, Math.min(100, Math.round(v))) : null);

    const payload = {
      nombre,
      codigoHex,
      referenciaFisica: referenciaFisica.trim() || undefined,
      cmykC: parseNum(cmykC),
      cmykM: parseNum(cmykM),
      cmykY: parseNum(cmykY),
      cmykK: parseNum(cmykK),
    };

    setError(null);
    startTransition(async () => {
      const res = initialColor
        ? await actionActualizarColorPedido(pedidoId, initialColor.id, payload)
        : await actionAgregarColorPedido(pedidoId, payload as any);

      if (!res.ok) {
        setError(res.error || "No se pudo guardar el color.");
        return;
      }

      handleReset();
    });
  }

  return createPortal(
    <div className={styles.modalBackdrop} onClick={handleReset}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>
              {initialColor ? "Editar Color y Calibración CMYK" : "Agregar Color Oficial"}
            </h3>
            <p className={styles.modalSubtitle}>Valores para calibración de plotter y tintas en taller</p>
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
            <label htmlFor="color-nombre">Nombre del color *</label>
            <input
              id="color-nombre"
              type="text"
              placeholder="Ej: Azul Marino Oficial / Dorado Sol"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className={styles.formInput}
              autoFocus
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="color-hex">Código HEX (Muestra en pantalla) *</label>
            <div className={styles.hexInputRow}>
              <input
                id="color-hex-picker"
                type="color"
                value={codigoHex.length === 7 ? codigoHex : "#001489"}
                onChange={(e) => setCodigoHex(e.target.value.toUpperCase())}
                className={styles.colorPickerInput}
                title="Seleccionar color visual"
              />
              <input
                id="color-hex"
                type="text"
                placeholder="#001489"
                value={codigoHex}
                onChange={(e) => handleHexTextChange(e.target.value)}
                maxLength={7}
                required
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

          {/* CMYK PARA CALIBRACIÓN DE TALLER (0 - 100) */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "12px", marginTop: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#1e293b", textTransform: "uppercase" }}>
                Calibración CMYK (Taller 0-100%)
              </label>
              <button
                type="button"
                onClick={handleAutoCalcularCmyk}
                style={{
                  background: "#e2e8f0",
                  border: "none",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  fontSize: "11px",
                  color: "#334155",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                title="Generar aproximación automática desde el código HEX"
              >
                ⚡ Auto-calcular desde HEX
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              <div>
                <label htmlFor="cmyk-c" style={{ fontSize: "11px", fontWeight: 700, color: "#0284c7", display: "block" }}>
                  C (Cian %)
                </label>
                <input
                  id="cmyk-c"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  value={cmykC}
                  onChange={(e) => setCmykC(e.target.value === "" ? "" : parseInt(e.target.value))}
                  className={styles.formInput}
                  style={{ textAlign: "center", padding: "6px 4px", fontSize: "13px", fontWeight: "bold" }}
                />
              </div>

              <div>
                <label htmlFor="cmyk-m" style={{ fontSize: "11px", fontWeight: 700, color: "#db2777", display: "block" }}>
                  M (Magenta %)
                </label>
                <input
                  id="cmyk-m"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  value={cmykM}
                  onChange={(e) => setCmykM(e.target.value === "" ? "" : parseInt(e.target.value))}
                  className={styles.formInput}
                  style={{ textAlign: "center", padding: "6px 4px", fontSize: "13px", fontWeight: "bold" }}
                />
              </div>

              <div>
                <label htmlFor="cmyk-y" style={{ fontSize: "11px", fontWeight: 700, color: "#d97706", display: "block" }}>
                  Y (Amarillo %)
                </label>
                <input
                  id="cmyk-y"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  value={cmykY}
                  onChange={(e) => setCmykY(e.target.value === "" ? "" : parseInt(e.target.value))}
                  className={styles.formInput}
                  style={{ textAlign: "center", padding: "6px 4px", fontSize: "13px", fontWeight: "bold" }}
                />
              </div>

              <div>
                <label htmlFor="cmyk-k" style={{ fontSize: "11px", fontWeight: 700, color: "#0f172a", display: "block" }}>
                  K (Negro %)
                </label>
                <input
                  id="cmyk-k"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  value={cmykK}
                  onChange={(e) => setCmykK(e.target.value === "" ? "" : parseInt(e.target.value))}
                  className={styles.formInput}
                  style={{ textAlign: "center", padding: "6px 4px", fontSize: "13px", fontWeight: "bold" }}
                />
              </div>
            </div>
            <small style={{ fontSize: "10.5px", color: "#64748b", marginTop: "6px", display: "block" }}>
              Porcentajes exactos de tinta para calibración del plotter y rip de impresión.
            </small>
          </div>

          <div className={styles.formField}>
            <label htmlFor="color-ref">Referencia Física / Código Pantone (Opcional)</label>
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
              {isPending ? "Guardando..." : initialColor ? "Guardar Cambios" : "Guardar Color"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
