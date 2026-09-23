import type { TallaCatalogoItem } from "../api/pedidos.api";
import type { PrendaDetalle } from "../types/pedido";
import { PrendaRow } from "./PrendaRow";
import styles from "./prendas.module.css";

interface PrendasTableProps {
  prendas: PrendaDetalle[];
  pedidoId: string;
  tallas: TallaCatalogoItem[];
}

export function PrendasTable({ prendas, pedidoId, tallas }: PrendasTableProps) {
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
            <col style={{ width: "80px" }} />
          </colgroup>
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
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {prendas.map((prenda, idx) => {
              const tallasPrenda = tallas.filter(
                (t) => !prenda.tipoProductoId || t.tipoProductoId === prenda.tipoProductoId
              );
              return (
                <PrendaRow
                  key={prenda.id}
                  index={idx}
                  prenda={prenda}
                  pedidoId={pedidoId}
                  tallasDisponibles={tallasPrenda.length > 0 ? tallasPrenda : tallas}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
