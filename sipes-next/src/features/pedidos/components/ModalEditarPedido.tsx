"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PedidoDetalle } from "../types/pedido";
import { actionActualizarCabeceraPedido } from "../actions/pedidos.actions";
import styles from "./pedidos.module.css";

interface ModalEditarPedidoProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: PedidoDetalle;
  vendedoras?: Array<{ id: string; nombre: string }>;
}

export function ModalEditarPedido({
  isOpen,
  onClose,
  pedido,
  vendedoras = [],
}: ModalEditarPedidoProps) {
  const router = useRouter();
  const fechaActual = pedido.fechaCompromiso ? pedido.fechaCompromiso.split("T")[0] : "";

  const [fechaCompromiso, setFechaCompromiso] = useState(fechaActual);
  const [vendedoraId, setVendedoraId] = useState(pedido.vendedora?.id ?? "");
  const [observaciones, setObservaciones] = useState(pedido.observaciones ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fechaCompromiso) {
      setError("La fecha de compromiso es obligatoria.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await actionActualizarCabeceraPedido(pedido.id, {
        fechaCompromiso,
        vendedoraId: vendedoraId || null,
        observaciones: observaciones.trim() || undefined,
      });

      if (!res.ok) {
        setError(res.error || "No se pudo actualizar el pedido.");
        return;
      }

      onClose();
      router.refresh();
    });
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCardWide} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Editar Pedido {pedido.codigo}</h3>
            <p className={styles.modalSubtitle}>Modificación de fecha de entrega, asesor y notas comerciales</p>
          </div>
          <button type="button" className={styles.modalCloseButton} onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {error && <div className={styles.modalErrorBanner} role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formField}>
            <label htmlFor="edit-pedido-fecha">Fecha de compromiso de entrega *</label>
            <input
              id="edit-pedido-fecha"
              type="date"
              required
              value={fechaCompromiso}
              onChange={(e) => setFechaCompromiso(e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="edit-pedido-vendedora">Asesora / Vendedor Comercial</label>
            <select
              id="edit-pedido-vendedora"
              value={vendedoraId}
              onChange={(e) => setVendedoraId(e.target.value)}
              className={styles.formInput}
            >
              <option value="">Sin asesora asignada</option>
              {vendedoras.map((v) => (
                <option key={v.id} value={v.id}>{v.nombre}</option>
              ))}
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="edit-pedido-obs">Observaciones comerciales</label>
            <textarea
              id="edit-pedido-obs"
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className={styles.formInput}
              style={{ resize: "vertical" }}
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.modalCancelButton} onClick={onClose} disabled={isPending}>
              Cancelar
            </button>
            <button type="submit" className={styles.modalSubmitButton} disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
