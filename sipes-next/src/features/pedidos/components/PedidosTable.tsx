"use client";

import Link from "next/link";
import { formatDate } from "@/lib/format/date";
import { useTableState } from "@/lib/useTableState";
import { Pagination } from "@/components/ui/table/Pagination";
import { SortableTh } from "@/components/ui/table/SortableTh";
import shared from "@/components/ui/table/tableShared.module.css";
import { Shirt, Palette, FileText } from "lucide-react";
import type { PedidoResumen } from "../types/pedido";
import { EstadoPedidoBadge } from "./EstadoPedidoBadge";
import styles from "./pedidos.module.css";

interface PedidosTableProps {
  pedidos: PedidoResumen[];
  error?: string | null;
}

export function PedidosTable({ pedidos, error }: PedidosTableProps) {
  const table = useTableState<PedidoResumen>(pedidos);

  return (
    <>
      {error && (
        <div className={shared.inlineWarning} role="alert">
          {error}
        </div>
      )}

      {pedidos.length === 0 ? (
        <section className={styles.emptyState}>
          <div className={styles.emptyIcon}>SP</div>
          <h2>Aún no hay pedidos</h2>
          <p>Cuando se registre el primero en el backend aparecerá aquí.</p>
        </section>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <SortableTh<PedidoResumen>
                    label="Código"
                    sortKey="codigo"
                    activeKey={table.sortKey}
                    dir={table.sortDir}
                    onSort={table.toggleSort}
                  />
                  <th>Cliente</th>
                  <th>Asesora</th>
                  <SortableTh<PedidoResumen>
                    label="Estado"
                    sortKey="estado"
                    activeKey={table.sortKey}
                    dir={table.sortDir}
                    onSort={table.toggleSort}
                  />
                  <SortableTh<PedidoResumen>
                    label="Prendas"
                    sortKey="totalPrendas"
                    activeKey={table.sortKey}
                    dir={table.sortDir}
                    onSort={table.toggleSort}
                  />
                  <SortableTh<PedidoResumen>
                    label="Compromiso"
                    sortKey="fechaCompromiso"
                    activeKey={table.sortKey}
                    dir={table.sortDir}
                    onSort={table.toggleSort}
                  />
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {table.sortedRows.map((pedido) => (
                  <tr key={pedido.id}>
                    <td className={styles.code}>{pedido.codigo}</td>
                    <td>{pedido.cliente.nombre}</td>
                    <td>
                      {pedido.vendedora?.nombre ? (
                        <span title={pedido.vendedora.nombre}>{pedido.vendedora.nombre}</span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>—</span>
                      )}
                    </td>
                    <td>
                      <EstadoPedidoBadge estado={pedido.estado} />
                    </td>
                    <td>{pedido.totalPrendas}</td>
                    <td>
                      <div suppressHydrationWarning>{formatDate(pedido.fechaCompromiso)}</div>
                      {typeof pedido.tiempoDias === "number" && (
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            marginTop: "2px",
                            color:
                              pedido.tiempoDias < 0
                                ? "#e11d48"
                                : pedido.tiempoDias <= 3
                                ? "#d97706"
                                : "#16a34a",
                          }}
                        >
                          {pedido.tiempoDias < 0
                            ? `Vencido (${Math.abs(pedido.tiempoDias)}d)`
                            : pedido.tiempoDias === 0
                            ? "Vence hoy"
                            : `${pedido.tiempoDias}d restantes`}
                        </span>
                      )}
                    </td>
                    <td className={styles.actionCell}>
                      <div className={styles.tableActions}>
                        <Link
                          className={styles.actionIconBtn}
                          href={`/pedidos/${encodeURIComponent(pedido.codigo)}/prendas`}
                          title="Ir directo a Matriz de Prendas y Tallas"
                          aria-label="Prendas y Tallas"
                        >
                          <Shirt size={15} />
                        </Link>
                        <Link
                          className={styles.actionIconBtn}
                          href={`/pedidos/${encodeURIComponent(pedido.codigo)}/diseno`}
                          title="Ir directo a Taller de Diseño y Mockup"
                          aria-label="Diseño"
                        >
                          <Palette size={15} />
                        </Link>
                        <Link
                          className={styles.actionIconBtn}
                          href={`/pedidos/${encodeURIComponent(pedido.codigo)}/proforma`}
                          title="Ir directo a Cotización y Proforma"
                          aria-label="Proforma"
                        >
                          <FileText size={15} />
                        </Link>
                        <Link
                          className={styles.linkButton}
                          href={`/pedidos/${encodeURIComponent(pedido.codigo)}`}
                          style={{ marginLeft: "4px" }}
                        >
                          Detalle →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
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
