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
            <col style={{ width: "140px" }} />
            <col style={{ width: "180px" }} />
            <col style={{ width: "140px" }} />
            <col style={{ width: "60px" }} />
            <col style={{ width: "70px" }} />
            <col style={{ width: "90px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "90px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "76px" }} />
          </colgroup>
          <thead>
            <tr>
              <th className={styles.colIndex}>#</th>
              <th>Grupo</th>
              <th>Participante</th>
              <th>Apodo</th>
              <th>N°</th>
              <th>Talla</th>
              <th>Género</th>
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
                  atributosCatalogo={atributos}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
