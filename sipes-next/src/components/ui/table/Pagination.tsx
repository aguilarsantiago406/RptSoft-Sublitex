"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./pagination.module.css";

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalRows: number;
  firstRow: number;
  lastRow: number;
  onPage: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  totalRows,
  firstRow,
  lastRow,
  onPage,
}: PaginationProps) {
  if (totalRows === 0) return null;

  const enPrimeraPagina = page <= 1;
  const enUltimaPagina = page >= totalPages;

  return (
    <div className={styles.bar}>
      <span className={styles.info}>
        Mostrando {firstRow}–{lastRow} de {totalRows}
      </span>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.button}
          onClick={() => onPage(page - 1)}
          disabled={enPrimeraPagina}
          aria-label="Ir a la página anterior"
        >
          <ChevronLeft className={styles.icon} size={14} aria-hidden="true" />
          Anterior
        </button>

        <span className={styles.pageIndicator}>
          Página {page} de {totalPages}
        </span>

        <button
          type="button"
          className={styles.button}
          onClick={() => onPage(page + 1)}
          disabled={enUltimaPagina}
          aria-label="Ir a la página siguiente"
        >
          Siguiente
          <ChevronRight className={styles.icon} size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
