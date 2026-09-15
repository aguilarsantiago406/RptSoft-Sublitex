"use client";

import React, { useState } from "react";
import {
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  FUENTES,
  useApariencia,
} from "@/contexts/apariencia";
import styles from "./PanelApariencia.module.css";

export function PanelApariencia() {
  const { preferencias, setTema, setFontSize, setFuente } = useApariencia();
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      {/* Botón flotante */}
      <button
        className={styles.fab}
        onClick={() => setAbierto((v) => !v)}
        aria-label="Personalizar apariencia"
        title="Personalizar apariencia"
      >
        {abierto ? "✕" : "Apariencia"}
      </button>

      {abierto && (
        <div className={styles.panel} role="dialog" aria-label="Personalización de apariencia">
          <div className={styles.panelHeader}>
            <strong>Apariencia</strong>
            <span className={styles.panelHint}>Opciones de visualización</span>
          </div>

          {/* Tema */}
          <label className={styles.campo}>
            <span className={styles.campoLabel}>Tema</span>
            <div className={styles.segmentos}>
              <button
                className={`${styles.segmento} ${
                  preferencias.tema === "claro" ? styles.segmentoActivo : ""
                }`}
                onClick={() => setTema("claro")}
              >
                ☀ Claro
              </button>
              <button
                className={`${styles.segmento} ${
                  preferencias.tema === "oscuro" ? styles.segmentoActivo : ""
                }`}
                onClick={() => setTema("oscuro")}
              >
                🌙 Oscuro
              </button>
            </div>
          </label>

          {/* Tamaño de letra */}
          <label className={styles.campo}>
            <span className={styles.campoLabel}>
              Tamaño de letra
              <span className={styles.campoValor}>{preferencias.fontSize}px</span>
            </span>
            <input
              type="range"
              min={FONT_SIZE_MIN}
              max={FONT_SIZE_MAX}
              step={1}
              value={preferencias.fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className={styles.range}
            />
          </label>

          {/* Fuente */}
          <label className={styles.campo}>
            <span className={styles.campoLabel}>Tipografía</span>
            <select
              value={preferencias.fuente}
              onChange={(e) => setFuente(e.target.value)}
              className={styles.select}
            >
              {FUENTES.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.nombre}
                </option>
              ))}
            </select>
          </label>

          <p className={styles.hint}>
            Tus preferencias se guardan en este navegador.
          </p>
        </div>
      )}
    </>
  );
}