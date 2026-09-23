import type { PedidoDetalle } from "../types/pedido";
import { EstadoPedidoBadge } from "./EstadoPedidoBadge";
import { PedidoEstadoActions } from "./PedidoEstadoActions";
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
        </p>
      </div>
      <div className={styles.detailHeaderRight}>
        <EstadoPedidoBadge estado={pedido.estado} size="lg" />
        <PedidoEstadoActions pedidoId={pedido.id} estadoActual={pedido.estado} />
      </div>
    </header>
  );
}
