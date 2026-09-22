import type { PedidoDetalle } from "../types/pedido";
import { EstadoPedidoBadge } from "./EstadoPedidoBadge";
import styles from "./pedidos.module.css";

interface PedidoHeaderProps {
  pedido: PedidoDetalle;
}

export function PedidoHeader({ pedido }: PedidoHeaderProps) {
  return (
    <header className={styles.detailHeader}>
      <div className={styles.detailHeaderMain}>
        <h1 className={styles.detailHeaderTitle}>
          DATOS DEL PEDIDO <span className={styles.detailHeaderCode}>— {pedido.codigo}</span>
        </h1>
        <p className={styles.detailHeaderSubtitle}>
          <span>Ficha técnica operativa</span>
          <span>·</span>
          <span>Cliente:</span>
          <span className={styles.detailClientTag}>{pedido.cliente.nombre}</span>
        </p>
      </div>
      <EstadoPedidoBadge estado={pedido.estado} />
    </header>
  );
}
