"use client";

import { useState } from "react";
import { useTableState } from "@/lib/useTableState";
import { Pagination } from "@/components/ui/table/Pagination";
import { SortableTh } from "@/components/ui/table/SortableTh";
import type { GrupoPedido } from "@/features/pedidos/types/pedido";
import type { ParticipanteConPrendas } from "@/features/pedidos/api/pedidos.api";
import { ParticipantesRow } from "./ParticipantesRow";
import { AgregarPrendaModal } from "./AgregarPrendaModal";
import styles from "./participantes.module.css";

interface FilaParticipante {
  participante: ParticipanteConPrendas;
  nombreGrupo: string;
}

interface ParticipantesTableProps {
  participantes: FilaParticipante[];
  pedidoId: string;
  grupos: GrupoPedido[];
  tiposProducto?: Array<{ id: string; nombre: string; codigo: string }>;
  colores?: Array<{ id: string; nombre: string; codigoHex: string }>;
}

export function ParticipantesTable({
  participantes,
  pedidoId,
  grupos,
  tiposProducto = [],
  colores = [],
}: ParticipantesTableProps) {
  const table = useTableState<FilaParticipante>(participantes);
  const offset = (table.page - 1) * table.pageSize;
  const [partParaPrenda, setPartParaPrenda] = useState<ParticipanteConPrendas | null>(null);

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
            <col style={{ width: "44px" }} />
            <col style={{ width: "220px" }} />
            <col style={{ width: "110px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "240px" }} />
            <col style={{ width: "160px" }} />
          </colgroup>
          <thead>
            <tr>
              <th className={styles.colIndex}>#</th>
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
              <th>Prendas</th>
              <th>Enlace</th>
              <th style={{ textAlign: "right" }}>Acciones</th>
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
                onAgregarPrenda={setPartParaPrenda}
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

      {partParaPrenda && (
        <AgregarPrendaModal
          key={partParaPrenda.id}
          isOpen={true}
          onClose={() => setPartParaPrenda(null)}
          participante={partParaPrenda}
          pedidoId={pedidoId}
          grupos={grupos}
          tiposProducto={tiposProducto}
          colores={colores}
        />
      )}
    </div>
  );
}
