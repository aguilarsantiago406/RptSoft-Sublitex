"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useIsClient } from "@/lib/useIsClient";
import type { PedidoDetalle } from "../types/pedido";
import { actionActualizarCabeceraPedido, actionActualizarEstadoPedido } from "../actions/pedidos.actions";
import { formatDate } from "@/lib/format/date";
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
  const isClient = useIsClient();
  const router = useRouter();
  const fechaActual = pedido.fechaCompromiso ? pedido.fechaCompromiso.split("T")[0] : "";
  const fechaPedido = pedido.fechaPedido ? pedido.fechaPedido.split("T")[0] : "";
  const minimo = (() => {
    const base = new Date(`${fechaPedido}T00:00:00`);
    base.setDate(base.getDate() + 1);
    return Number.isNaN(base.getTime()) ? undefined : base.toISOString().split("T")[0];
  })();

  const [fechaCompromiso, setFechaCompromiso] = useState(fechaActual);
  const [vendedoraId, setVendedoraId] = useState(pedido.vendedora?.id ?? "");
  const [observaciones, setObservaciones] = useState(pedido.observaciones ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !isClient) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fechaCompromiso) {
      setError("La fecha de compromiso es obligatoria (R-A09).");
      return;
    }
    if (minimo && fechaCompromiso < minimo) {
      setError("La fecha de entrega debe ser posterior a la fecha del pedido (R-A09).");
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

      if (pedido.estado === "BORRADOR") {
        await actionActualizarEstadoPedido(pedido.id, "EN_CONFIGURACION");
      }

      onClose();
      router.refresh();
    });
  }

  return createPortal(
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCardWide} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Editar Pedido {pedido.codigo}</h3>
            <p className={styles.modalSubtitle}>Fecha de entrega y observaciones</p>
          </div>
          <button type="button" className={styles.modalCloseButton} onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {error && <div className={styles.modalErrorBanner} role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formField}>
            <label htmlFor="edit-pedido-fecha">Fecha de entrega pactada *</label>
            <input
              id="edit-pedido-fecha"
              type="date"
              required
              min={minimo}
              value={fechaCompromiso}
              onChange={(e) => setFechaCompromiso(e.target.value)}
              className={styles.formInput}
              aria-describedby="edit-pedido-fecha-hint"
            />
            <small id="edit-pedido-fecha-hint" className={styles.formHint}>
              Debe ser posterior al {formatDate(pedido.fechaPedido)} (R-A09).
            </small>
          </div>

          <div className={styles.formField}>
            <label htmlFor="edit-pedido-vendedora">Asesora comercial</label>
            <select
              id="edit-pedido-vendedora"
              value={vendedoraId}
              onChange={(e) => setVendedoraId(e.target.value)}
              className={styles.formInput}
            >
              <option value="">Sin asesora asignada</option>
              {vendedoras.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="edit-pedido-obs">Observaciones</label>
            <textarea
              id="edit-pedido-obs"
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className={styles.formInput}
              style={{ resize: "vertical" }}
              aria-describedby="edit-pedido-obs-hint"
            />
            <small id="edit-pedido-obs-hint" className={styles.formHint}>
              No llegan a producción. Lo que deba esteemed el taller se registra como atributo o personalización (R-F06).
            </small>
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
    </div>,
    document.body
  );
}
