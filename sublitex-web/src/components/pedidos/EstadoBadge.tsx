import type { EstadoPedido } from "@/types/pedidos";
import styles from "./EstadoBadge.module.css";

const ESTADO_LABEL: Record<EstadoPedido, string> = {
  BORRADOR: "Borrador",
  EN_CONFIGURACION: "En configuración",
  EN_RECOLECCION: "En recolección",
  EN_REVISION: "En revisión",
  CERRADO: "Cerrado",
  EN_PRODUCCION: "En producción",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const ESTADO_CLASE: Record<EstadoPedido, string> = {
  BORRADOR: styles.estadoBorrador,
  EN_CONFIGURACION: styles.estadoConfiguracion,
  EN_RECOLECCION: styles.estadoRecoleccion,
  EN_REVISION: styles.estadoRevision,
  CERRADO: styles.estadoCerrado,
  EN_PRODUCCION: styles.estadoProduccion,
  ENTREGADO: styles.estadoEntregado,
  CANCELADO: styles.estadoCancelado,
};

export function EstadoBadge({ estado }: { estado: EstadoPedido }) {
  return (
    <span className={`${styles.estadoBadge} ${ESTADO_CLASE[estado]}`}>
      <span className={styles.estadoDot} aria-hidden="true" />
      {ESTADO_LABEL[estado]}
    </span>
  );
}