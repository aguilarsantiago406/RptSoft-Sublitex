"use client";

import { useCallback, useMemo, useState } from "react";

export type SortDir = "asc" | "desc";

/** Clave plana de la fila o ruta con puntos para valores anidados ("participante.estado"). */
export type SortKey<T> = (keyof T & string) | `${string}.${string}`;

export interface UseTableStateOptions {
  initialPageSize?: number;
}

export interface UseTableStateResult<T> {
  page: number;
  pageSize: number;
  totalPages: number;
  totalRows: number;
  setPage: (page: number) => void;
  next: () => void;
  prev: () => void;
  firstRow: number;
  lastRow: number;
  sortKey: SortKey<T> | undefined;
  sortDir: SortDir;
  toggleSort: (key: SortKey<T>) => void;
  sortedRows: T[];
}

const DEFAULT_PAGE_SIZE = 10;

interface SortState<T> {
  key: SortKey<T> | undefined;
  dir: SortDir;
}

function getValueAtPath(row: unknown, path: string): unknown {
  if (!path.includes(".")) {
    return row === null || row === undefined
      ? undefined
      : (row as Record<string, unknown>)[path];
  }

  let current: unknown = row;
  for (const segment of path.split(".")) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

/** Compara dos valores de celda. Los vacíos siempre quedan al final, en ambos sentidos. */
function compareCellValues(a: unknown, b: unknown): number {
  if (isEmptyValue(a) || isEmptyValue(b)) {
    if (isEmptyValue(a) && isEmptyValue(b)) return 0;
    return isEmptyValue(a) ? 1 : -1;
  }

  if (a === b) return 0;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);

  return String(a).localeCompare(String(b), "es", {
    numeric: true,
    sensitivity: "base",
  });
}

function sortRows<T>(rows: T[], key: SortKey<T>, dir: SortDir): T[] {
  const factor = dir === "asc" ? 1 : -1;
  return [...rows].sort(
    (a, b) => compareCellValues(getValueAtPath(a, key), getValueAtPath(b, key)) * factor
  );
}

/**
 * Estado de paginación y ordenamiento para tablas con datos ya cargados en memoria.
 * El orden es ascendente -> descendente -> sin orden, y la página vuelve a 1
 * cuando cambia el conjunto de filas o la clave de ordenamiento.
 */
export function useTableState<T>(
  rows: T[],
  opts?: UseTableStateOptions
): UseTableStateResult<T> {
  const pageSize = opts?.initialPageSize ?? DEFAULT_PAGE_SIZE;
  const [sort, setSort] = useState<SortState<T>>({ key: undefined, dir: "asc" });
  const [pageState, setPageState] = useState<{
    page: number;
    rows: T[];
    sortKey: SortKey<T> | undefined;
  }>({ page: 1, rows, sortKey: undefined });

  const sortKey = sort.key;
  const sortDir = sort.dir;

  // Ajuste de estado durante el render: si cambiaron las filas o la clave de
  // ordenamiento, la paginación vuelve a la primera página.
  if (pageState.rows !== rows || pageState.sortKey !== sortKey) {
    setPageState({ page: 1, rows, sortKey });
  }

  const page =
    pageState.rows === rows && pageState.sortKey === sortKey ? pageState.page : 1;

  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const setPage = useCallback(
    (next: number) => {
      setPageState((current) => ({ ...current, page: Math.min(Math.max(1, next), totalPages) }));
    },
    [totalPages]
  );

  const next = useCallback(() => setPage(safePage + 1), [setPage, safePage]);
  const prev = useCallback(() => setPage(safePage - 1), [setPage, safePage]);

  const toggleSort = useCallback((key: SortKey<T>) => {
    setSort((current) => {
      if (current.key !== key) return { key, dir: "asc" };
      if (current.dir === "asc") return { key, dir: "desc" };
      return { key: undefined, dir: "asc" };
    });
    setPageState((current) => ({ ...current, page: 1 }));
  }, []);

  const sortedRows = useMemo(() => {
    const ordered = sortKey ? sortRows(rows, sortKey, sortDir) : rows;
    const start = (safePage - 1) * pageSize;
    return ordered.slice(start, start + pageSize);
  }, [rows, sortKey, sortDir, safePage, pageSize]);

  const firstRow = totalRows === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const lastRow = totalRows === 0 ? 0 : Math.min(safePage * pageSize, totalRows);

  return {
    page: safePage,
    pageSize,
    totalPages,
    totalRows,
    setPage,
    next,
    prev,
    firstRow,
    lastRow,
    sortKey,
    sortDir,
    toggleSort,
    sortedRows,
  };
}
