"use client";

import { useTableState } from "@/lib/useTableState";
import { Pagination } from "@/components/ui/table/Pagination";
import { SortableTh } from "@/components/ui/table/SortableTh";
import type { UbicacionPersonalizacionCatalogo } from "@/features/catalogos/types/catalogo";
import type { AtributoCatalogoItem, TallaCatalogoItem } from "../api/pedidos.api";
import type { PrendaDetalle } from "../types/pedido";
import { PrendaRow } from "./PrendaRow";
import styles from "./prendas.module.css";

interface PrendasTableProps {
  prendas: PrendaDetalle[];
  pedidoId: string;
  tallas: TallaCatalogoItem[];
  atributos: AtributoCatalogoItem[];
  colores?: Array<{ id: string; nombre: string; codigoHex: string }>;
  ubicaciones?: UbicacionPersonalizacionCatalogo[];
}

export function PrendasTable({
  prendas,
  pedidoId,
  tallas,
  atributos,
  colores,
  ubicaciones,
}: PrendasTableProps) {
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
            <col style={{ width: "170px" }} />
            <col style={{ width: "110px" }} />
            <col style={{ width: "60px" }} />
            <col style={{ width: "55px" }} />
            <col style={{ width: "75px" }} />
            <col style={{ width: "105px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "80px" }} />
          </colgroup>
          <thead>
            <tr>
              <th className={styles.colIndex}>#</th>
              <th>Participante</th>
              <SortableTh<PrendaDetalle>
                label="Apodo"
                sortKey="nombreEnPrenda"
                activeKey={table.sortKey}
                dir={table.sortDir}
                onSort={table.toggleSort}
              />
              <SortableTh<PrendaDetalle>
                label="Número"
                sortKey="numero"
                activeKey={table.sortKey}
                dir={table.sortDir}
                onSort={table.toggleSort}
              />
              <th>Talla</th>
              <SortableTh<PrendaDetalle>
                label="Género"
                sortKey="genero"
                activeKey={table.sortKey}
                dir={table.sortDir}
                onSort={table.toggleSort}
              />
              <th>Color</th>
              <SortableTh<PrendaDetalle>
                label="Tipo de Prenda"
                sortKey="tipoPrenda"
                activeKey={table.sortKey}
                dir={table.sortDir}
                onSort={table.toggleSort}
              />
              <th>Estampados</th>
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
                  coloresDisponibles={colores}
                  ubicacionesCatalogo={ubicaciones}
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
