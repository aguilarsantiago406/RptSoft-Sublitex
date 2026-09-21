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

export function EstadoPedidoBadge({ estado }: { estado: EstadoPedido }) {
  return (
    <span className={`${styles.badge} ${styles[`estado_${estado}`]}`}>
      {LABELS[estado]}
    </span>
  );
}
