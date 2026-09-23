"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ClienteListItem } from "../api/pedidos.api";
import { actionCrearPedido } from "../actions/pedidos.actions";
import styles from "./pedidos.module.css";

interface ModalNuevoPedidoProps {
  isOpen: boolean;
  onClose: () => void;
  clientesIniciales: ClienteListItem[];
}

export function ModalNuevoPedido({
  isOpen,
  onClose,
  clientesIniciales,
}: ModalNuevoPedidoProps) {
  const router = useRouter();
  const [clienteId, setClienteId] = useState(clientesIniciales[0]?.id ?? "");

  // Fecha mínima: mañana
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split("T")[0];

  const defaultCompromiso = new Date();
  defaultCompromiso.setDate(defaultCompromiso.getDate() + 14);
  const defaultDateStr = defaultCompromiso.toISOString().split("T")[0];

  const [fechaCompromiso, setFechaCompromiso] = useState(defaultDateStr);
  const [observaciones, setObservaciones] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleReset() {
    setClienteId(clientesIniciales[0]?.id ?? "");
    setFechaCompromiso(defaultDateStr);
    setObservaciones("");
    setError(null);
    onClose();
  }

  function handleSubmitPedido(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteId) {
      setError("Debes seleccionar un cliente para el pedido.");
      return;
    }
    if (!fechaCompromiso) {
      setError("La fecha de compromiso de entrega es obligatoria (Regla R-A09).");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await actionCrearPedido({
        clienteId,
        fechaCompromiso,
        observaciones: observaciones.trim() || undefined,
      });

      if (!res.ok || !res.pedido) {
        setError(res.error || "No se pudo crear el pedido.");
        return;
      }

      handleReset();
      router.push(`/pedidos/${res.pedido.id}`);
    });
  }

  return (
    <div className={styles.modalBackdrop} onClick={handleReset}>
      <div className={styles.modalCardWide} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Nuevo Pedido</h3>
            <p className={styles.modalSubtitle}>
              Alta de orden técnica con código correlativo (Regla R-A03)
            </p>
          </div>
          <button
            type="button"
            className={styles.modalCloseButton}
            onClick={handleReset}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className={styles.modalErrorBanner} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitPedido} className={styles.modalForm}>
          <div className={styles.formField}>
            <label htmlFor="pedido-cliente">Cliente / Organización *</label>
            <select
              id="pedido-cliente"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className={styles.formInput}
              required
            >
              {clientesIniciales.length === 0 && (
                <option value="">No hay clientes registrados en el sistema</option>
              )}
              {clientesIniciales.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} {c.ciudad ? `(${c.ciudad})` : ""} — {c.tipo}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="pedido-fecha">Fecha de compromiso de entrega *</label>
            <input
              id="pedido-fecha"
              type="date"
              required
              min={minDateStr}
              value={fechaCompromiso}
              onChange={(e) => setFechaCompromiso(e.target.value)}
              className={styles.formInput}
            />
            <small className={styles.formHint}>
              Debe ser posterior a la fecha actual para salir de BORRADOR (Regla R-A09)
            </small>
          </div>

          <div className={styles.formField}>
            <label htmlFor="pedido-obs">Observaciones comerciales (Opcional)</label>
            <textarea
              id="pedido-obs"
              rows={3}
              placeholder="Ej: Entrega en paquete único para desfile escolar..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className={styles.formInput}
              style={{ resize: "vertical" }}
            />
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.modalCancelButton}
              onClick={handleReset}
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.modalSubmitButton}
              disabled={isPending || !clienteId}
            >
              {isPending ? "Generando pedido..." : "Crear Pedido →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
