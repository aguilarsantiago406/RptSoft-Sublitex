"use client";

import { useState, useTransition } from "react";
import { Palette } from "lucide-react";
import type { PedidoDetalle } from "../types/pedido";
import { actionEliminarColorPedido } from "../actions/pedidos.actions";
import { ModalColorForm } from "./ModalColorForm";
import { ModalConfirmacion } from "@/components/ui/ModalConfirmacion";
import styles from "./pedidos.module.css";

interface PedidoColoresProps {
  pedidoId: string;
  colores: PedidoDetalle["colores"];
}

export function PedidoColores({ pedidoId, colores }: PedidoColoresProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [colorAEliminar, setColorAEliminar] = useState<{ id: string; nombre: string } | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleConfirmEliminar = () => {
    if (!colorAEliminar) return;
    const { id: colorId } = colorAEliminar;

    setIsDeletingId(colorId);
    startTransition(async () => {
      await actionEliminarColorPedido(pedidoId, colorId);
      setIsDeletingId(null);
      setColorAEliminar(null);
    });
  };

  return (
    <section className={`${styles.sectionBlock} ${styles.sectionBlockCompacta}`}>
      <div className={styles.sectionHeaderRow}>
        <div className={styles.sectionTitleRow}>
          <span className={styles.cardIcon}>
            <Palette size={16} />
          </span>
          <h2 className={styles.sectionTitle}>Colores oficiales</h2>
        </div>
        <div className={styles.colorsHeaderActions}>
          <span className={styles.countTag}>{colores.length} colores</span>
          <button
            type="button"
            className={styles.cardAction}
            onClick={() => setIsModalOpen(true)}
          >
            + Agregar color
          </button>
        </div>
      </div>

      <div className={styles.colors}>
        {colores.length === 0 && <p className={styles.configEmpty}>Sin colores registrados.</p>}
        {colores.map((color) => (
          <div className={styles.colorItem} key={color.id}>
            <span className={styles.colorSample} style={{ backgroundColor: color.codigoHex }} />
            <div className={styles.colorDetails}>
              <strong>{color.nombre}</strong>
              <small>
                HEX: {color.codigoHex}
                {color.referenciaFisica ? ` · ${color.referenciaFisica}` : ""}
              </small>
            </div>
            <button
              type="button"
              className={styles.deleteColorButton}
              onClick={() => setColorAEliminar({ id: color.id, nombre: color.nombre })}
              disabled={isDeletingId === color.id}
              title={`Eliminar ${color.nombre}`}
              aria-label={`Eliminar color ${color.nombre}`}
            >
              {isDeletingId === color.id ? "..." : "✕"}
            </button>
          </div>
        ))}
      </div>

      <ModalColorForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pedidoId={pedidoId}
      />

      <ModalConfirmacion
        isOpen={Boolean(colorAEliminar)}
        onClose={() => setColorAEliminar(null)}
        onConfirm={handleConfirmEliminar}
        title="Eliminar Color"
        description={
          colorAEliminar ? (
            <>
              ¿Seguro que deseas eliminar el color <strong>{colorAEliminar.nombre}</strong> del pedido?
            </>
          ) : ""
        }
        confirmText="Eliminar Color"
        variant="danger"
        isPending={Boolean(isDeletingId)}
      />
    </section>
  );
}
