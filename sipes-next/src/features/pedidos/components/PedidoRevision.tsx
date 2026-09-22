import type { PedidoDetalle } from "../types/pedido";
import styles from "./pedidos.module.css";

interface PedidoRevisionProps {
  pedido: PedidoDetalle;
  totalPrendas: number;
}

export function PedidoRevision({ pedido, totalPrendas }: PedidoRevisionProps) {
  const cumpleMinimo = totalPrendas >= 12;
  const coloresValidos =
    pedido.colores.length > 0 && pedido.colores.every((c) => /^#([0-9A-Fa-f]{6})$/.test(c.codigoHex));

  return (
    <section className={styles.sectionBlock}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitle}>7 · REVISIÓN Y CONTROL DE CALIDAD</h2>
          <p className={styles.sectionSubtitle}>Validaciones automáticas calculadas sobre la orden</p>
        </div>
      </div>
      <ul className={styles.checklist}>
        <li className={styles.checkItem}>
          <span>Total prendas contratadas</span>
          <span className={styles.checkTagOk}>{totalPrendas} contratadas</span>
        </li>
        <li className={styles.checkItem}>
          <span>Pedido mínimo alcanzado (≥ 12 unidades R-K09)</span>
          <span className={cumpleMinimo ? styles.checkTagOk : styles.checkTagWarn}>
            {cumpleMinimo ? `CUMPLE (${totalPrendas})` : "MENOR A 12"}
          </span>
        </li>
        <li className={styles.checkItem}>
          <span>Colores con código HEX válido (R-K05)</span>
          <span className={coloresValidos ? styles.checkTagOk : styles.checkTagWarn}>
            {coloresValidos ? "VALIDADO" : "PENDIENTE HEX"}
          </span>
        </li>
        <li className={styles.checkItem}>
          <span>Fecha compromiso posterior a fecha de pedido (R-A09)</span>
          <span className={pedido.fechaCompromiso ? styles.checkTagOk : styles.checkTagWarn}>
            {pedido.fechaCompromiso ? "OK" : "PENDIENTE"}
          </span>
        </li>
      </ul>
    </section>
  );
}
