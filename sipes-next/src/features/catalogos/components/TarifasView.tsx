"use client";

import { useState, useTransition } from "react";
import { useTableState } from "@/lib/useTableState";
import { Pagination } from "@/components/ui/table/Pagination";
import { SortableTh } from "@/components/ui/table/SortableTh";
import { formatDateNumeric } from "@/lib/format/date";
import type { TarifaCatalogo } from "../types/catalogo";
import { ETIQUETA_TIPO_TARIFA } from "../types/catalogo";
import { actionEliminarTarifa } from "../actions/tarifas.actions";
import { ModalTarifaForm } from "./ModalTarifaForm";
import styles from "./catalogos.module.css";

interface TarifasViewProps {
  tarifas: TarifaCatalogo[];
}

function formatFecha(iso?: string | null): string {
  return formatDateNumeric(iso);
}

function getEstado(t: TarifaCatalogo): { label: string; className: string } {
  if (!t.activo) return { label: "Inactiva", className: styles.tarifaEstadoInactiva };
  const hoy = new Date();
  const desde = new Date(t.vigenteDesde);
  const hasta = t.vigenteHasta ? new Date(t.vigenteHasta) : null;
  if (hasta && hasta < hoy) return { label: "Vencida", className: styles.tarifaEstadoVencida };
  if (desde > hoy) return { label: "Futura", className: styles.tarifaEstadoFutura };
  return { label: "Vigente", className: styles.tarifaEstadoVigente };
}

export function TarifasView({ tarifas }: TarifasViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<TarifaCatalogo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const table = useTableState<TarifaCatalogo>(tarifas);

  const handleNueva = () => {
    setEditing(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleEditar = (tarifa: TarifaCatalogo) => {
    setEditing(tarifa);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleEliminar = (tarifa: TarifaCatalogo) => {
    const confirmar = window.confirm(
      `¿Eliminar la tarifa "${tarifa.concepto}"? Esta acción borra el registro asociado.`
    );
    if (!confirmar) return;

    setErrorMsg(null);
    setDeletingId(tarifa.id);
    startTransition(async () => {
      const res = await actionEliminarTarifa(tarifa.id);
      setDeletingId(null);
      if (!res.ok) {
        setErrorMsg(res.error || "No se pudo eliminar la tarifa.");
      }
    });
  };

  return (
    <section className={styles.tarifasSection}>
      <div className={styles.tarifasHeader}>
        <div>
          <h3 className={styles.standardsTitle}>Catálogo de Tarifas (R-K10)</h3>
          <p className={styles.standardsDesc}>
            Costos de impresión y confección, precios de venta y recargos · los conceptos
            vigentes se usan para cotización automática en proformas
          </p>
        </div>
        <div className={styles.tarifasHeaderActions}>
          <button type="button" className={styles.tarifaNuevaButton} onClick={handleNueva}>
            + Nueva tarifa
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className={styles.tarifaErrorBanner} role="alert">
          {errorMsg}
        </div>
      )}

      <div className={styles.tableCard}>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <SortableTh<TarifaCatalogo>
                  label="Tipo"
                  sortKey="tipo"
                  activeKey={table.sortKey}
                  dir={table.sortDir}
                  onSort={table.toggleSort}
                />
                <SortableTh<TarifaCatalogo>
                  label="Concepto"
                  sortKey="concepto"
                  activeKey={table.sortKey}
                  dir={table.sortDir}
                  onSort={table.toggleSort}
                />
                <SortableTh<TarifaCatalogo>
                  label="Valor (S/)"
                  sortKey="valor"
                  activeKey={table.sortKey}
                  dir={table.sortDir}
                  onSort={table.toggleSort}
                  align="right"
                />
                <SortableTh<TarifaCatalogo>
                  label="Vigencia desde"
                  sortKey="vigenteDesde"
                  activeKey={table.sortKey}
                  dir={table.sortDir}
                  onSort={table.toggleSort}
                />
                <th>Vigencia hasta</th>
                <th>Estado</th>
                <th>Nota</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tarifas.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.tarifaEmptyCell}>
                    Todavía no hay tarifas registradas. Creá la primera para habilitar la
                    cotización automática.
                  </td>
                </tr>
              ) : (
                table.sortedRows.map((t) => {
                  const estado = getEstado(t);
                  return (
                    <tr key={t.id}>
                      <td>
                        <span className={styles.tarifaTipoChip}>
                          {ETIQUETA_TIPO_TARIFA[t.tipo]}
                        </span>
                      </td>
                      <td>
                        <span className={styles.tarifaConcepto}>{t.concepto}</span>
                      </td>
                      <td className={styles.tarifaValor}>
                        {Number(t.valor).toFixed(2)}
                      </td>
                      <td suppressHydrationWarning>{formatFecha(t.vigenteDesde)}</td>
                      <td suppressHydrationWarning>{formatFecha(t.vigenteHasta)}</td>
                      <td>
                        <span className={estado.className}>{estado.label}</span>
                      </td>
                      <td className={styles.tarifaNota}>{t.nota || "—"}</td>
                      <td>
                        <div className={styles.tarifaActions}>
                          <button
                            type="button"
                            className={styles.tarifaEditButton}
                            onClick={() => handleEditar(t)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className={styles.tarifaDeleteButton}
                            onClick={() => handleEliminar(t)}
                            disabled={deletingId === t.id}
                          >
                            {deletingId === t.id ? "Eliminando…" : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
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

      <ModalTarifaForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initial={editing}
      />
    </section>
  );
}