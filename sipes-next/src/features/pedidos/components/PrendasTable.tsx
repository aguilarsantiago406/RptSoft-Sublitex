import type { PrendaDetalle } from "../types/pedido";
import { PrendaRow } from "./PrendaRow";
import styles from "./prendas.module.css";

interface PrendasTableProps {
  prendas: PrendaDetalle[];
}

export function PrendasTable({ prendas }: PrendasTableProps) {
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
          <thead>
            <tr>
              <th className={styles.colIndex}>#</th>
              <th>Grupo</th>
              <th>Participante</th>
              <th>Estampado Espalda</th>
              <th>N°</th>
              <th>Talla</th>
              <th>Corte</th>
              <th>Color</th>
              <th>Tipo</th>
              <th>Excepciones</th>
            </tr>
          </thead>
          <tbody>
            {prendas.map((prenda, idx) => (
              <PrendaRow key={prenda.id} index={idx} prenda={prenda} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
