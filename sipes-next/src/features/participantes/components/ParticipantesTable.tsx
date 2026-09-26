"use client";

import { useTableState } from "@/lib/useTableState";
import { Pagination } from "@/components/ui/table/Pagination";
import { SortableTh } from "@/components/ui/table/SortableTh";
import type { ParticipanteConPrendas } from "@/features/pedidos/api/pedidos.api";
import { ParticipantesRow } from "./ParticipantesRow";
import styles from "./participantes.module.css";

interface FilaParticipante {
  participante: ParticipanteConPrendas;
  nombreGrupo: string;
}

interface ParticipantesTableProps {
  participantes: FilaParticipante[];
  pedidoId: string;
}

export function ParticipantesTable({ participantes, pedidoId }: ParticipantesTableProps) {
  const table = useTableState<FilaParticipante>(participantes);
  const offset = (table.page - 1) * table.pageSize;

  if (participantes.length === 0) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.emptyState}>
          No se encontraron participantes con los filtros seleccionados.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <colgroup>
            <col style={{ width: "48px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "240px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "auto" }} />
          </colgroup>
          <thead>
            <tr>
              <th className={styles.colIndex}>#</th>
              <SortableTh<FilaParticipante>
                label="Grupo"
                sortKey="nombreGrupo"
                activeKey={table.sortKey}
                dir={table.sortDir}
                onSort={table.toggleSort}
              />
              <SortableTh<FilaParticipante>
                label="Participante"
                sortKey="participante.nombrePersona"
                activeKey={table.sortKey}
                dir={table.sortDir}
                onSort={table.toggleSort}
              />
              <SortableTh<FilaParticipante>
                label="Estado"
                sortKey="participante.estado"
                activeKey={table.sortKey}
                dir={table.sortDir}
                onSort={table.toggleSort}
              />
              <th>Enlace WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {table.sortedRows.map((item, idx) => (
              <ParticipantesRow
                key={item.participante.id}
                index={offset + idx}
                participante={item.participante}
                nombreGrupo={item.nombreGrupo}
                pedidoId={pedidoId}
              />
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
  );
}
