import Link from "next/link";
import { formatDate } from "@/lib/format/date";
import type { PedidoResumen } from "../types/pedido";
import { EstadoPedidoBadge } from "./EstadoPedidoBadge";
import styles from "./pedidos.module.css";

export function PedidosTable({ pedidos }: { pedidos: PedidoResumen[] }) {
  if (pedidos.length === 0) {
    return (
      <section className={styles.emptyState}>
        <div className={styles.emptyIcon}>SP</div>
        <h2>Aún no hay pedidos</h2>
        <p>Cuando se registre el primero en el backend aparecerá aquí.</p>
      </section>
    );
  }

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Prendas</th>
              <th>Compromiso</th>
              <th><span className="srOnly">Acción</span></th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td className={styles.code}>{pedido.codigo}</td>
                <td>{pedido.cliente.nombre}</td>
                <td><EstadoPedidoBadge estado={pedido.estado} /></td>
                <td>{pedido.totalPrendas}</td>
                <td>{formatDate(pedido.fechaCompromiso)}</td>
                <td className={styles.actionCell}>
                  <Link className={styles.linkButton} href={`/pedidos/${pedido.id}`}>
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
