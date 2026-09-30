import type { PedidoDetalle } from "../types/pedido";
import { EstadoPedidoBadge } from "./EstadoPedidoBadge";
import styles from "./pedidos.module.css";

interface PedidoTopbarProps {
  pedido: PedidoDetalle;
}

/* Ancla de identidad del pedido, igual en todas sus secciones: código,
   cliente y estado. No repite el título que ya muestra cada page.
   Server Component: el token de sesión solo se lee en servidor. */
export function PedidoTopbar({ pedido }: PedidoTopbarProps) {
  return (
    <div className={styles.pedidoTopbar}>
      <div className={styles.pedidoTopbarMain}>
        <span className={styles.pedidoTopbarCodigo}>{pedido.codigo}</span>
        <span className={styles.pedidoTopbarSep} aria-hidden="true" />
        <span className={styles.pedidoTopbarCliente}>{pedido.cliente.nombre}</span>
      </div>
      <EstadoPedidoBadge estado={pedido.estado} />
    </div>
  );
}
