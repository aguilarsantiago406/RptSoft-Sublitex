"use client";

import { formatDate } from "@/lib/format/date";
import { useTableState } from "@/lib/useTableState";
import { Pagination } from "@/components/ui/table/Pagination";
import { SortableTh } from "@/components/ui/table/SortableTh";
import shared from "@/components/ui/table/tableShared.module.css";
import type { Cliente, TipoCliente } from "../types/cliente";
import styles from "./clientes.module.css";

interface ClientesTableProps {
  clientes: Cliente[];
  error?: string | null;
}

function getBadgeClass(tipo: TipoCliente): string {
  switch (tipo) {
    case "COLEGIO":
      return `${styles.badge} ${styles.badgeColegio}`;
    case "PROMOCION":
      return `${styles.badge} ${styles.badgePromocion}`;
    case "CLUB":
      return `${styles.badge} ${styles.badgeClub}`;
    case "EMPRESA":
      return `${styles.badge} ${styles.badgeEmpresa}`;
    case "PARTICULAR":
    default:
      return `${styles.badge} ${styles.badgeParticular}`;
  }
}

function getTipoLabel(tipo: TipoCliente): string {
  switch (tipo) {
    case "COLEGIO":
      return "Colegio";
    case "PROMOCION":
      return "Promoción";
    case "CLUB":
      return "Club";
    case "EMPRESA":
      return "Empresa";
    case "PARTICULAR":
      return "Particular";
    default:
      return tipo;
  }
}

export function ClientesTable({ clientes, error }: ClientesTableProps) {
  const table = useTableState<Cliente>(clientes);
  const offset = (table.page - 1) * table.pageSize;

  return (
    <>
      {error && (
        <div className={shared.inlineWarning} role="alert">
          {error}
        </div>
      )}

      {clientes.length === 0 ? (
        <div className={styles.tableCard}>
          <div className={styles.emptyState}>
            No se encontraron clientes ni organizaciones registradas con los filtros
            seleccionados.
          </div>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colIndex}>#</th>
                  <SortableTh<Cliente>
                    label="Organización / Cliente"
                    sortKey="nombre"
                    activeKey={table.sortKey}
                    dir={table.sortDir}
                    onSort={table.toggleSort}
                  />
                  <SortableTh<Cliente>
                    label="Tipo"
                    sortKey="tipo"
                    activeKey={table.sortKey}
                    dir={table.sortDir}
                    onSort={table.toggleSort}
                    width={140}
                  />
                  <SortableTh<Cliente>
                    label="Ciudad / Sede"
                    sortKey="ciudad"
                    activeKey={table.sortKey}
                    dir={table.sortDir}
                    onSort={table.toggleSort}
                    width={160}
                  />
                  <th style={{ width: "160px" }}>Teléfono</th>
                  <th style={{ width: "150px" }}>Registrado el</th>
                </tr>
              </thead>
              <tbody>
                {table.sortedRows.map((cliente, index) => {
                  return (
                    <tr key={cliente.id}>
                      <td className={styles.colIndex}>{offset + index + 1}</td>
                      <td>
                        <div className={styles.clientName}>{cliente.nombre}</div>
                      </td>
                      <td>
                        <span className={getBadgeClass(cliente.tipo)}>
                          {getTipoLabel(cliente.tipo)}
                        </span>
                      </td>
                      <td>{cliente.ciudad || "—"}</td>
                      <td>{cliente.telefono || "—"}</td>
                      <td style={{ color: "#64748b", fontSize: "0.82rem" }} suppressHydrationWarning>
                        {formatDate(cliente.creadoEn)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            page={table.page}
            totalPages={table.totalPages}
            totalRows={table.totalRows}
            firstRow={table.firstRow}
            lastRow={table.lastRow}
            onPage={table.setPage}
          />
        </div>
      )}
    </>
  );
}
