"use client";

import { useTableState } from "@/lib/useTableState";
import { Pagination } from "@/components/ui/table/Pagination";
import { SortableTh } from "@/components/ui/table/SortableTh";
import type { AtributoCatalogoItem, TallaCatalogoItem } from "../api/pedidos.api";
import type { PrendaDetalle } from "../types/pedido";
import { PrendaRow } from "./PrendaRow";
import styles from "./prendas.module.css";

interface PrendasTableProps {
  prendas: PrendaDetalle[];
  pedidoId: string;
  tallas: TallaCatalogoItem[];
  atributos: AtributoCatalogoItem[];
}

export function PrendasTable({ prendas, pedidoId, tallas, atributos }: PrendasTableProps) {
  const table = useTableState<PrendaDetalle>(prendas);
  const offset = (table.page - 1) * table.pageSize;

  if (prendas.length === 0) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.emptyState}>
          No se encontraron prendas con los filtros seleccionados.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableScroll}>
        <table className={styles.prendasTable}>
          <colgroup>
            <col style={{ width: "44px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "65px" }} />
            <col style={{ width: "70px" }} />
            <col style={{ width: "85px" }} />
            <col style={{ width: "125px" }} />
            <col style={{ width: "115px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "150px" }} />
          </colgroup>
          <thead>
            <tr>
              <th className={styles.colIndex}>#</th>
              <th>Grupo</th>
              <th>Participante</th>
              <SortableTh<PrendaDetalle>
                label="Apodo"
                sortKey="nombreEnPrenda"
                activeKey={table.sortKey}
                dir={table.sortDir}
                onSort={table.toggleSort}
              />
              <SortableTh<PrendaDetalle>
                label="N°"
                sortKey="numero"
                activeKey={table.sortKey}
                dir={table.sortDir}
                onSort={table.toggleSort}
              />
              <th>Talla</th>
              <SortableTh<PrendaDetalle>
                label="Corte"
                sortKey="genero"
                activeKey={table.sortKey}
                dir={table.sortDir}
                onSort={table.toggleSort}
              />
              <th>Color</th>
              <SortableTh<PrendaDetalle>
                label="Tipo"
                sortKey="tipoPrenda"
                activeKey={table.sortKey}
                dir={table.sortDir}
                onSort={table.toggleSort}
              />
              <th>Excepciones</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {table.sortedRows.map((prenda, idx) => {
              const tallasPrenda = tallas.filter(
                (t) => !prenda.tipoProductoId || t.tipoProductoId === prenda.tipoProductoId
              );
              return (
                <PrendaRow
                  key={prenda.id}
                  index={offset + idx}
                  prenda={prenda}
                  pedidoId={pedidoId}
                  tallasDisponibles={tallasPrenda.length > 0 ? tallasPrenda : tallas}
                  atributosCatalogo={atributos}
                />
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
  );
}
