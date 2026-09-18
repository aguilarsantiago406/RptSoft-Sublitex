"use client";

import React from "react";
import type { CatalogoCompleto, PrendaItem, TotalesPedido } from "@/types/prendas";
import { validarPrenda } from "@/domain/validacionPrenda";
import styles from "./TablaPrendas.module.css";

interface TotalesPrendasProps {
  totales: TotalesPedido;
  prendas: PrendaItem[];
  catalogo: CatalogoCompleto;
}

/** Totales de la tabla de precios y producción. R-E03: la última columna
 *  ("Qué falta") cuenta INCOMPLETAS reales contra la ficha mínima, no un ✓ fijo. */
export function TotalesPrendas({ totales, prendas, catalogo }: TotalesPrendasProps) {
  const incompletas = prendas.filter((p) => validarPrenda(p, catalogo).length > 0).length;

  return (
    <tfoot>
      <tr className={styles.tfootRow}>
        {/* # + referencia + base (3) */}
        <td className={styles.tdTotal} colSpan={2}>
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
        <td className={`${styles.tdTotalCenter} ${styles.tdTotalEstado}`}>
          {incompletas === 0 ? (
            <span className={styles.faltantesOk}>OK</span>
          ) : (
            <span className={styles.faltantesError}>
              {incompletas} incompleta{incompletas === 1 ? "" : "s"}
            </span>
          )}
        </td>
      </tr>
    </tfoot>
  );
}