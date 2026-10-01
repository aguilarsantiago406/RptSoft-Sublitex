"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/format/date";
import { useTableState } from "@/lib/useTableState";
import { Pagination } from "@/components/ui/table/Pagination";
import { SortableTh } from "@/components/ui/table/SortableTh";
import { ModalConfirmacion } from "@/components/ui/ModalConfirmacion";
import { Pencil, Trash2 } from "lucide-react";
import shared from "@/components/ui/table/tableShared.module.css";
import type { Cliente, TipoCliente } from "../types/cliente";
import { actionEliminarCliente } from "../actions/clientes.actions";
import { ModalEditarCliente } from "./ModalEditarCliente";
import styles from "./clientes.module.css";

interface ClientesTableProps {
  clientes: Cliente[];
  error?: string | null;
}

const TIPO_MAP: Record<TipoCliente, { badge: string; label: string }> = {
  COLEGIO: { badge: `${styles.badge} ${styles.badgeColegio}`, label: "Colegio" },
  PROMOCION: { badge: `${styles.badge} ${styles.badgePromocion}`, label: "Promoción" },
  CLUB: { badge: `${styles.badge} ${styles.badgeClub}`, label: "Club" },
  EMPRESA: { badge: `${styles.badge} ${styles.badgeEmpresa}`, label: "Empresa" },
  PARTICULAR: { badge: `${styles.badge} ${styles.badgeParticular}`, label: "Particular" },
};

export function ClientesTable({ clientes, error }: ClientesTableProps) {
  const table = useTableState<Cliente>(clientes);
  const offset = (table.page - 1) * table.pageSize;

  const [clienteAEditar, setClienteAEditar] = useState<Cliente | null>(null);
  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [isDeleting, startTransition] = useTransition();

  function handleConfirmEliminar() {
    if (!clienteAEliminar) return;
    const { id } = clienteAEliminar;

    setErrorAccion(null);
    startTransition(async () => {
      const res = await actionEliminarCliente(id);
      if (!res.ok) {
        setErrorAccion(res.error || "No se pudo eliminar el cliente.");
      } else {
        setClienteAEliminar(null);
      }
    });
  }

  return (
    <>
      {(error || errorAccion) && (
        <div className={shared.inlineWarning} role="alert">
          {errorAccion || error}
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
                  <SortableTh<Cliente> label="Organización / Cliente" sortKey="nombre" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                  <SortableTh<Cliente> label="Tipo" sortKey="tipo" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} width={140} />
                  <SortableTh<Cliente> label="Ciudad / Sede" sortKey="ciudad" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} width={150} />
                  <th style={{ width: "140px" }}>Teléfono</th>
                  <th style={{ width: "130px" }}>Registrado</th>
                  <th style={{ width: "200px", textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {table.sortedRows.map((cliente, index) => {
                  return (
                    <tr key={cliente.id}>
                      <td className={styles.colIndex}>{offset + index + 1}</td>
                      <td>
                        <Link
                          href={`/clientes/${cliente.id}`}
                          className={styles.clientNameLink}
                          title="Ver ficha técnica e historial"
                        >
                          {cliente.nombre}
                        </Link>
                      </td>
                      <td>
                        <span className={TIPO_MAP[cliente.tipo]?.badge ?? styles.badge}>
                          {TIPO_MAP[cliente.tipo]?.label ?? cliente.tipo}
                        </span>
                      </td>
                      <td>{cliente.ciudad || "—"}</td>
                      <td>{cliente.telefono || "—"}</td>
                      <td style={{ color: "#64748b", fontSize: "0.82rem" }} suppressHydrationWarning>
                        {formatDate(cliente.creadoEn)}
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <Link href={`/clientes/${cliente.id}`} className={styles.actionBtnView}>
                            Ver Ficha
                          </Link>
                          <button
                            type="button"
                            className={styles.actionBtnEdit}
                            onClick={() => setClienteAEditar(cliente)}
                            title={`Editar ${cliente.nombre}`}
                            aria-label={`Editar ${cliente.nombre}`}
                            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "5px 7px" }}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            className={styles.actionBtnDelete}
                            onClick={() => {
                              setErrorAccion(null);
                              setClienteAEliminar(cliente);
                            }}
                            title={`Eliminar ${cliente.nombre}`}
                            aria-label={`Eliminar ${cliente.nombre}`}
                            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "5px 7px" }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
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

      {clienteAEditar && (
        <ModalEditarCliente
          isOpen={Boolean(clienteAEditar)}
          onClose={() => setClienteAEditar(null)}
          cliente={clienteAEditar}
        />
      )}

      <ModalConfirmacion
        isOpen={Boolean(clienteAEliminar)}
        onClose={() => setClienteAEliminar(null)}
        onConfirm={handleConfirmEliminar}
        title="Eliminar Cliente"
        description={
          clienteAEliminar
            ? `¿Deseas eliminar a ${clienteAEliminar.nombre}? Solo se podrá eliminar si no tiene pedidos registrados en el sistema.`
            : ""
        }
        confirmText="Eliminar Cliente"
        variant="danger"
        isPending={isDeleting}
      />
    </>
  );
}
