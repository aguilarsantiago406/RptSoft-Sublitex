"use client";

import type { ParticipanteConPrendas } from "@/features/pedidos/api/pedidos.api";
import { ParticipantesRow } from "./ParticipantesRow";
import styles from "./participantes.module.css";

interface ParticipantesTableProps {
  participantes: Array<{
    participante: ParticipanteConPrendas;
    nombreGrupo: string;
  }>;
  pedidoId: string;
  mapaTallas?: Map<string, string>;
}

export function ParticipantesTable({
  participantes,
  pedidoId,
}: ParticipantesTableProps) {
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
              <th>Grupo</th>
              <th>Participante</th>
              <th>Estado</th>
              <th>Enlace WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {participantes.map((item, idx) => (
              <ParticipantesRow
                key={item.participante.id}
                index={idx}
                participante={item.participante}
                nombreGrupo={item.nombreGrupo}
                pedidoId={pedidoId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
