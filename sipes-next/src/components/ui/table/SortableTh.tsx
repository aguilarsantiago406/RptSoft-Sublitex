"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { SortDir, SortKey } from "@/lib/useTableState";
import styles from "./tableShared.module.css";

export interface SortableThProps<T> {
  label: string;
  sortKey: SortKey<T>;
  activeKey: SortKey<T> | undefined;
  dir: SortDir;
  onSort: (key: SortKey<T>) => void;
  align?: "left" | "center" | "right";
  width?: number | string;
}

export function SortableTh<T>({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  align,
  width,
}: SortableThProps<T>) {
  const activo = activeKey === sortKey;
  const Icon = activo ? (dir === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;

  return (
    <th
      className={styles.sortTh}
      style={{
        ...(width !== undefined ? { width } : {}),
        ...(align ? { textAlign: align } : {}),
      }}
      aria-sort={activo ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        className={styles.sortButton}
        onClick={() => onSort(sortKey)}
        title={`Ordenar por ${label}`}
      >
        <span className={styles.sortLabel}>{label}</span>
        <Icon
          className={activo ? `${styles.sortIcon} ${styles.sortIconActive}` : styles.sortIcon}
          size={13}
          aria-hidden="true"
        />
      </button>
    </th>
  );
}
