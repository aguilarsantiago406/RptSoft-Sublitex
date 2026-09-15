"use client";

import React from "react";
import styles from "./TablaPrendas.module.css";

interface CeldaEditableProps {
  atributo: string;
  valor: string;
  opciones: { codigo: string; etiqueta: string }[];
  esExcepcion: boolean;
  disabled: boolean;
  onCambio: (atributo: string, valor: string) => void;
}

export function CeldaEditable({
  atributo,
  valor,
  opciones,
  esExcepcion,
  disabled,
  onCambio,
}: CeldaEditableProps) {
  const cellClass = [
    styles.td,
    esExcepcion ? styles.celdaExcepcion : styles.celdaInactiva,
  ].join(" ");

  const selectClass = [
    styles.select,
    esExcepcion ? styles.selectExcepcion : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <td className={cellClass} data-atributo={atributo}>
      <select
        value={valor}
        onChange={(e) => onCambio(atributo, e.target.value)}
        disabled={disabled}
        className={selectClass}
        title={
          esExcepcion
            ? `Excepción —${atributo} hereda "${valor}", este valor difiere del grupo`
            : `Heredado del grupo — ${valor}`
        }
      >
        {opciones.length === 0 ? (
          <option value="">—</option>
        ) : (
          opciones.map((v) => (
            <option key={v.codigo} value={v.codigo}>
              {v.etiqueta}
            </option>
          ))
        )}
      </select>
    </td>
  );
}