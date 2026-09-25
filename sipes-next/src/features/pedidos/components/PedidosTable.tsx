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
              <th>Asesora</th>
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
                <td>
                  {pedido.vendedora?.nombre ? (
                    <span title={pedido.vendedora.nombre}>{pedido.vendedora.nombre}</span>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>—</span>
                  )}
                </td>
                <td><EstadoPedidoBadge estado={pedido.estado} /></td>
                <td>{pedido.totalPrendas}</td>
                <td>
                  <div>{formatDate(pedido.fechaCompromiso)}</div>
                  {typeof pedido.tiempoDias === "number" && (
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        marginTop: "2px",
                        color:
                          pedido.tiempoDias < 0
                            ? "#e11d48"
                            : pedido.tiempoDias <= 3
                            ? "#d97706"
                            : "#16a34a",
                      }}
                    >
                      {pedido.tiempoDias < 0
                        ? `Vencido (${Math.abs(pedido.tiempoDias)}d)`
                        : pedido.tiempoDias === 0
                        ? "Vence hoy"
                        : `${pedido.tiempoDias}d restantes`}
                    </span>
                  )}
                </td>
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
