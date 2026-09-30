"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import type { PedidoDetalle } from "../types/pedido";
import { formatDate } from "@/lib/format/date";
import { ModalEditarPedido } from "./ModalEditarPedido";
import styles from "./pedidos.module.css";

interface PedidoIdentificacionProps {
  pedido: PedidoDetalle;
  vendedoras?: Array<{ id: string; nombre: string }>;
}

export function PedidoIdentificacion({ pedido, vendedoras = [] }: PedidoIdentificacionProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <section className={`${styles.sectionBlock} ${styles.sectionBlockCompacta}`}>
      <div className={styles.sectionHeaderRow}>
        <div className={styles.sectionTitleRow}>
          <span className={styles.cardIcon}>
            <Clock size={16} />
          </span>
          <h2 className={styles.sectionTitle}>Identificación</h2>
        </div>
        <button
          type="button"
          className={styles.cardActionGhost}
          onClick={() => setIsEditOpen(true)}
          title="Modificar fecha de entrega u observaciones"
        >
          Editar
        </button>
      </div>

      <dl className={styles.idFields}>
        <div>
          <dt>N° de pedido</dt>
          <dd className={styles.code}>{pedido.codigo}</dd>
        </div>
        <div>
          <dt>Fecha de registro</dt>
          <dd suppressHydrationWarning>{formatDate(pedido.fechaPedido)}</dd>
        </div>
        <div>
          <dt>Fecha de entrega pactada</dt>
          <dd suppressHydrationWarning>{formatDate(pedido.fechaCompromiso)}</dd>
        </div>
        <div>
          <dt>Asesora comercial</dt>
          <dd className={pedido.vendedora?.nombre ? undefined : styles.valueMuted}>
            {pedido.vendedora?.nombre || "Sin asignar"}
          </dd>
        </div>
        <div>
          <dt>Cliente</dt>
          <dd>{pedido.cliente.nombre}</dd>
        </div>
        <div>
          <dt>Teléfono</dt>
          <dd className={pedido.cliente.telefono ? undefined : styles.valueMuted}>
            {pedido.cliente.telefono || "No registrado"}
          </dd>
        </div>
        <div>
          <dt>Ciudad / destino</dt>
          <dd className={pedido.cliente.ciudad ? undefined : styles.valueMuted}>
            {pedido.cliente.ciudad || "No registrada"}
          </dd>
        </div>
        {pedido.observaciones && (
          <div className={styles.idFieldAncho}>
            <dt>Observaciones</dt>
            <dd>{pedido.observaciones}</dd>
          </div>
        )}
      </dl>

      {isEditOpen && (
        <ModalEditarPedido
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          pedido={pedido}
          vendedoras={vendedoras}
        />
      )}
    </section>
  );
}
