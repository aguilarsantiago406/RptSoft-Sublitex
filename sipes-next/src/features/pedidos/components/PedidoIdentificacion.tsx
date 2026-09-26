"use client";

import { useState } from "react";
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
    <section className={styles.sectionBlock}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitle}>1 · IDENTIFICACIÓN</h2>
          <p className={styles.sectionSubtitle}>Datos generales de la orden y contacto comercial</p>
        </div>
        <button
          type="button"
          className={styles.envioEditButton}
          onClick={() => setIsEditOpen(true)}
          title="Modificar fecha de entrega, asesor u observaciones"
        >
          Editar identificación
        </button>
      </div>
      <dl className={styles.dataGrid4}>
        <div>
          <dt>N° de pedido</dt>
          <dd className={styles.code}>{pedido.codigo}</dd>
        </div>
        <div>
          <dt>Fecha de registro</dt>
          <dd suppressHydrationWarning>{formatDate(pedido.fechaPedido)}</dd>
        </div>
        <div>
          <dt>Fecha de entrega / compromiso</dt>
          <dd suppressHydrationWarning>{formatDate(pedido.fechaCompromiso)}</dd>
        </div>
        <div>
          <dt>Asesora comercial</dt>
          <dd>{pedido.vendedora?.nombre || "Sin asignar"}</dd>
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
