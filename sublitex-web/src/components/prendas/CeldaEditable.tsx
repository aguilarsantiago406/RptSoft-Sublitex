"use client";

import React from "react";

interface CeldaEditableProps {
  atributo: string;
  valor: string;
  opciones: { codigo: string; etiqueta: string }[];
  esExcepcion: boolean;
  disabled: boolean;
  onCambio: (atributo: string, valor: string) => void;
}

const selectEstilo: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 3,
  background: "transparent",
  fontSize: 11,
  padding: "2px 4px",
  cursor: "pointer",
  outline: "none",
  fontFamily: "inherit",
};

export function CeldaEditable({
  atributo,
  valor,
  opciones,
  esExcepcion,
  disabled,
  onCambio,
}: CeldaEditableProps) {
  return (
    <td
      style={{
        padding: "4px 8px",
        border: "1px solid #eee",
        background: esExcepcion ? "#fff3cd" : "inherit",
      }}
    >
      <select
        value={valor}
        onChange={(e) => onCambio(atributo, e.target.value)}
        disabled={disabled}
        style={{
          ...selectEstilo,
          background: "transparent",
          fontWeight: esExcepcion ? "bold" : "normal",
        }}
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
