import type { EstadoPedido } from "../types/pedido";
import styles from "./pedidos.module.css";

const LABELS: Record<EstadoPedido, string> = {
  BORRADOR: "Borrador",
  EN_CONFIGURACION: "En configuración",
  EN_RECOLECCION: "En recolección",
  EN_REVISION: "En revisión",
  CERRADO: "Cerrado",
  EN_PRODUCCION: "En producción",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

interface EstadoPedidoBadgeProps {
  estado: EstadoPedido;
  size?: "md" | "lg";
}

export function EstadoPedidoBadge({ estado, size = "md" }: EstadoPedidoBadgeProps) {
  const isLarge = size === "lg";
  return (
    <span
      className={`${styles.badge} ${isLarge ? styles.badgeLg : ""} ${styles[`estado_${estado}`]}`}
      role="status"
    >
      <span className={styles.statusDot} aria-hidden="true" />
      <span>{LABELS[estado]}</span>
    </span>
  );
}
