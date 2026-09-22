import type { PedidoDetalle } from "../types/pedido";
import styles from "./pedidos.module.css";

interface PedidoColoresProps {
  colores: PedidoDetalle["colores"];
}

export function PedidoColores({ colores }: PedidoColoresProps) {
  return (
    <section className={styles.sectionBlock}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitle}>3 · COLORES OFICIALES</h2>
          <p className={styles.sectionSubtitle}>Código hexadecimal obligatorio (Regla R-K05)</p>
        </div>
        <span className={styles.tagSi}>{colores.length} colores</span>
      </div>
      <div className={styles.colors}>
        {colores.length === 0 && <p className={styles.configEmpty}>Sin colores registrados.</p>}
        {colores.map((color) => (
          <div className={styles.colorItem} key={color.id}>
            <span className={styles.colorSample} style={{ backgroundColor: color.codigoHex }} />
            <div>
              <strong>{color.nombre}</strong>
              <small>
                HEX: {color.codigoHex}
                {color.referenciaFisica ? ` · ${color.referenciaFisica}` : ""}
              </small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
