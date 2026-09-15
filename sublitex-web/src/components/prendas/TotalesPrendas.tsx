"use client";

import React from "react";
import type { TotalesPedido } from "@/types/prendas";

interface TotalesPrendasProps {
  totales: TotalesPedido;
}

const thCentro =
  "border border-slate-200 px-2.5 py-2 text-center tabular-nums dark:border-slate-800/80";
const thDerecha =
  "border border-slate-200 px-2.5 py-2 text-right tabular-nums dark:border-slate-800/80";

export function TotalesPrendas({ totales }: TotalesPrendasProps) {
  return (
    <tfoot>
      <tr className="bg-slate-100 font-semibold text-slate-800 dark:bg-slate-900/90 dark:text-slate-200">
        <td colSpan={15} className={`${thDerecha} text-left`}>
          TOTALES
        </td>
        <td className={thDerecha}>S/ {totales.totalBase.toFixed(2)}</td>
        <td className={thDerecha}>S/ {totales.totalRecTalla.toFixed(2)}</td>
        <td className={thDerecha}>S/ {totales.totalRecTela.toFixed(2)}</td>
        <td className={thDerecha}>S/ {totales.totalRecCuello.toFixed(2)}</td>
        <td className={thDerecha}>S/ {totales.totalRecAcabado.toFixed(2)}</td>
        <td className={`${thDerecha} text-[13px] font-bold text-emerald-800 dark:text-emerald-300`}>
          S/ {totales.importeTotal.toFixed(2)}
        </td>
        <td className={thCentro}>{totales.camisetas}</td>
        <td className={thCentro}>{totales.shorts}</td>
        <td className={thCentro}>{totales.medias}</td>
        <td className={thCentro}>✓</td>
      </tr>
    </tfoot>
  );
}