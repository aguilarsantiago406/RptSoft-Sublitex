"use client";

import React from "react";
import type {
  CatalogoCompleto,
  ColorPedido,
  PrendaItem,
  Tarifa,
  TotalesPedido,
  UpdatePrenda,
} from "@/types/prendas";
import { FilaPrenda } from "./FilaPrenda";
import { TotalesPrendas } from "./TotalesPrendas";

export interface TablaPrendasProps {
  prendas: PrendaItem[];
  colores: ColorPedido[];
  tarifas: Tarifa[];
  catalogo: CatalogoCompleto;
  totales: TotalesPedido;
  valorHeredadoDe?: (atributo: string) => string | undefined;
  dorsalDuplicadoIds?: Set<string>;
  onActualizarPrenda: (idPrenda: string, update: UpdatePrenda) => void;
  onAgregarFila?: () => void;
  onEliminarFila?: (idPrenda: string) => void;
}

const columnasHeaders = [
  "#",
  "Nombre en prenda",
  "Nombre de la persona",
  "Producto",
  "Talla",
  "Número",
  "Color",
  "Género",
  "Corte",
  "Cuello",
  "Tela",
  "Acabado escudo",
  "Arquero",
  "Tipo",
  "Personalización especial",
  "Precio base",
  "Rec. talla",
  "Rec. tela",
  "Rec. cuello",
  "Rec. acabado",
  "PRECIO UNIT.",
  "Camisetas",
  "Shorts",
  "Medias",
  "Qué falta",
  "", // Acciones de fila
];

export function TablaPrendas({
  prendas,
  colores,
  tarifas,
  catalogo,
  totales,
  valorHeredadoDe,
  dorsalDuplicadoIds,
  onActualizarPrenda,
  onAgregarFila,
  onEliminarFila,
}: TablaPrendasProps) {
  const alertaDuplicados = dorsalDuplicadoIds && dorsalDuplicadoIds.size > 0;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 dark:backdrop-blur-md dark:shadow-none">
      {onAgregarFila && (
        <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {prendas.length} prendas en el grupo
          </span>
          <button
            type="button"
            onClick={onAgregarFila}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-700 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            + Nueva prenda
          </button>
        </div>
      )}

      {alertaDuplicados && (
        <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          ⚠ Dorsal(es) repetido(s) en el grupo:{" "}
          {Array.from(dorsalDuplicadoIds!)
            .map((id) => prendas.find((p) => p.id === id)?.numero?.trim())
            .filter(Boolean)
            .join(", ")}
          — resuelva la duplicidad antes de avanzar de estado.
        </div>
      )}

      <table className="w-full border-collapse text-left text-xs whitespace-nowrap text-slate-800 dark:text-slate-200">
        <thead>
          <tr className="bg-slate-100 text-slate-700 dark:bg-slate-900/90 dark:text-slate-300">
            {columnasHeaders.map((col) => (
              <th
                key={col}
                className="border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-slate-700 dark:border-slate-800/80 dark:text-slate-300"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {prendas.map((prenda, i) => (
            <FilaPrenda
              key={prenda.id}
              prenda={prenda}
              index={i}
              colores={colores}
              tarifas={tarifas}
              catalogo={catalogo}
              valorHeredadoDe={valorHeredadoDe}
              dorsalDuplicado={dorsalDuplicadoIds?.has(prenda.id)}
              onActualizarPrenda={onActualizarPrenda}
              onEliminarFila={onEliminarFila}
            />
          ))}
        </tbody>
        <TotalesPrendas totales={totales} />
      </table>
    </div>
  );
}