"use client";

import { useState, useTransition } from "react";
import type { PedidoDetalle } from "../types/pedido";
import { actionEliminarColorPedido } from "../actions/pedidos.actions";
import { ModalColorForm } from "./ModalColorForm";
import styles from "./pedidos.module.css";

interface PedidoColoresProps {
  pedidoId: string;
  colores: PedidoDetalle["colores"];
}

export function PedidoColores({ pedidoId, colores }: PedidoColoresProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleEliminar = (colorId: string, nombreColor: string) => {
    const confirmar = window.confirm(`¿Seguro que deseas eliminar el color "${nombreColor}"?`);
    if (!confirmar) return;

    setIsDeletingId(colorId);
    startTransition(async () => {
      await actionEliminarColorPedido(pedidoId, colorId);
      setIsDeletingId(null);
    });
  };

  return (
    <section className={styles.sectionBlock}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitle}>3 · COLORES OFICIALES</h2>
          <p className={styles.sectionSubtitle}>Código hexadecimal obligatorio (Regla R-K05)</p>
        </div>
        <div className={styles.colorsHeaderActions}>
          <span className={styles.tagSi}>{colores.length} colores</span>
          <button
            type="button"
            className={styles.addColorButton}
            onClick={() => setIsModalOpen(true)}
          >
            + Agregar Color
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
              onClick={() => handleEliminar(color.id, color.nombre)}
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
    </section>
  );
}
