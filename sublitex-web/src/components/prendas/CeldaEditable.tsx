"use client";

import React from "react";

interface CeldaEditableProps {
  atributo: string;
  valor: string;
  opciones: { codigo: string; etiqueta: string }[];
  esExcepcion: boolean;
  disabled: boolean;
  /** Valor base del grupo (configuración heredable). Con él se restaura HEREDADO (R-C08). */
  valorHeredado?: string;
  onCambio: (atributo: string, valor: string) => void;
}

const selectBase =
  "w-full cursor-pointer rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-400/30 dark:[color-scheme:dark] dark:border-slate-700/60 dark:bg-slate-800/90 dark:text-slate-100";

export function CeldaEditable({
  atributo,
  valor,
  opciones,
  esExcepcion,
  disabled,
  valorHeredado,
  onCambio,
}: CeldaEditableProps) {
  const puedeRestaurar =
    esExcepcion && valorHeredado !== undefined && valorHeredado !== valor;

  return (
    <td
      className={`border px-1.5 py-1 align-middle ${
        esExcepcion
          ? "border-amber-400 bg-amber-100 text-amber-950 dark:border-amber-500/80 dark:bg-amber-950/50 dark:text-amber-200"
          : "border-slate-200 bg-transparent dark:border-slate-800/80"
      }`}
    >
      <div className="flex min-w-[110px] items-center gap-1">
        {esExcepcion && (
          <span
            title="Excepción al grupo"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 ring-1 ring-amber-600/50 dark:bg-amber-400"
          />
        )}
        <select
          value={valor}
          onChange={(e) => onCambio(atributo, e.target.value)}
          disabled={disabled}
          className={[
            selectBase,
            esExcepcion
              ? "font-semibold text-amber-950 dark:text-amber-200"
              : "text-slate-800 dark:text-slate-100",
          ].join(" ")}
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
        {puedeRestaurar && (
          <button
            type="button"
            title="Restablecer a valor heredado del grupo"
            onClick={() => onCambio(atributo, valorHeredado)}
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-amber-700 transition-colors hover:bg-amber-200 dark:text-amber-400 dark:hover:bg-amber-900"
            aria-label={`Restablecer ${atributo.toLowerCase()} a valor heredado del grupo`}
          >
            ↺
          </button>
        )}
      </div>
    </td>
  );
}