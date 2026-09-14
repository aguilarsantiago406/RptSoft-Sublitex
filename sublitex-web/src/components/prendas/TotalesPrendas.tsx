"use client";

import React from "react";
import type { TotalesPedido } from "@/types/prendas";
import styles from "./TablaPrendas.module.css";

interface TotalesPrendasProps {
  totales: TotalesPedido;
}

export function TotalesPrendas({ totales }: TotalesPrendasProps) {
  return (
    <tfoot>
      <tr className={styles.tfootRow}>
        <td colSpan={15} className={styles.tdTotal}>
          TOTALES
        </td>
        <td className={styles.tdTotal}>S/ {totales.totalBase.toFixed(2)}</td>
        <td className={styles.tdTotal}>S/ {totales.totalRecTalla.toFixed(2)}</td>
        <td className={styles.tdTotal}>S/ {totales.totalRecTela.toFixed(2)}</td>
        <td className={styles.tdTotal}>S/ {totales.totalRecCuello.toFixed(2)}</td>
        <td className={styles.tdTotal}>S/ {totales.totalRecAcabado.toFixed(2)}</td>
        <td className={styles.tdTotalDestacado}>
          S/ {totales.importeTotal.toFixed(2)}
        </td>
        <td className={styles.tdTotalCenter}>{totales.camisetas}</td>
        <td className={styles.tdTotalCenter}>{totales.shorts}</td>
        <td className={styles.tdTotalCenter}>{totales.medias}</td>
        <td className={styles.tdTotalCenter}>✓</td>
      </tr>
    </tfoot>
  );
}
