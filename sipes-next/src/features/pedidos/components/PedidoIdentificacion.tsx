import type { PedidoDetalle } from "../types/pedido";
import { formatDate } from "@/lib/format/date";
import styles from "./pedidos.module.css";

interface PedidoIdentificacionProps {
  pedido: PedidoDetalle;
}

export function PedidoIdentificacion({ pedido }: PedidoIdentificacionProps) {
  return (
    <section className={styles.sectionBlock}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitle}>1 · IDENTIFICACIÓN</h2>
          <p className={styles.sectionSubtitle}>Datos generales de la orden y contacto comercial</p>
        </div>
      </div>
      <dl className={styles.dataGrid4}>
        <div>
          <dt>N° de pedido</dt>
          <dd className={styles.code}>{pedido.codigo}</dd>
        </div>
        <div>
          <dt>Fecha de registro</dt>
          <dd>{formatDate(pedido.fechaPedido)}</dd>
        </div>
        <div>
          <dt>Fecha de entrega / compromiso</dt>
          <dd>{formatDate(pedido.fechaCompromiso)}</dd>
        </div>
        <div>
          <dt>Cliente</dt>
          <dd>{pedido.cliente.nombre}</dd>
        </div>
        <div>
          <dt>Teléfono</dt>
          <dd>{pedido.cliente.telefono || "No registrado"}</dd>
        </div>
        <div>
          <dt>Ciudad / Destino</dt>
          <dd>{pedido.cliente.ciudad || "No registrada"}</dd>
        </div>
        {pedido.observaciones && (
          <div>
            <dt>Observaciones</dt>
            <dd>{pedido.observaciones}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
