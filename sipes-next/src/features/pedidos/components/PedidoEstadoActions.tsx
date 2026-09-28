"use client";

import { useState, useTransition } from "react";
import type { EstadoPedido } from "../types/pedido";
import { actionActualizarEstadoPedido } from "../actions/pedidos.actions";
import { ModalConfirmacion } from "@/components/ui/ModalConfirmacion";
import styles from "./pedidos.module.css";

interface PedidoEstadoActionsProps {
  pedidoId: string;
  estadoActual: EstadoPedido;
}

const SIGUIENTE_ESTADO: Partial<Record<EstadoPedido, { destino: EstadoPedido; label: string }>> = {
  BORRADOR: { destino: "EN_CONFIGURACION", label: "Avanzar a En Configuración →" },
  EN_CONFIGURACION: { destino: "EN_RECOLECCION", label: "Avanzar a En Recolección →" },
  EN_RECOLECCION: { destino: "EN_REVISION", label: "Avanzar a En Revisión →" },
  EN_REVISION: { destino: "EN_PRODUCCION", label: "Enviar a Producción →" },
  EN_PRODUCCION: { destino: "ENTREGADO", label: "Marcar como Entregado →" },
  ENTREGADO: { destino: "CERRADO", label: "Cerrar Pedido" },
};

export function PedidoEstadoActions({ pedidoId, estadoActual }: PedidoEstadoActionsProps) {
  const [isConfirmCancelarOpen, setIsConfirmCancelarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const siguiente = SIGUIENTE_ESTADO[estadoActual];
  const esTerminal = estadoActual === "CERRADO" || estadoActual === "CANCELADO";

  const handleAvanzar = () => {
    if (!siguiente) return;
    setErrorMsg(null);

    startTransition(async () => {
      const res = await actionActualizarEstadoPedido(pedidoId, siguiente.destino);
      if (!res.ok) {
        setErrorMsg(res.error || "No se pudo actualizar el estado.");
      }
    });
  };

  const handleConfirmCancelar = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await actionActualizarEstadoPedido(pedidoId, "CANCELADO", "Cancelado desde ficha técnica");
      setIsConfirmCancelarOpen(false);
      if (!res.ok) {
        setErrorMsg(res.error || "No se pudo cancelar el pedido.");
      }
    });
  };

  if (esTerminal) {
    return null;
  }

  return (
    <div className={styles.stateActionsContainer}>
      {errorMsg && (
        <div className={styles.stateActionError} role="alert">
          <span>{errorMsg}</span>
          <button
            type="button"
            className={styles.stateActionErrorClose}
            onClick={() => setErrorMsg(null)}
            aria-label="Cerrar error"
          >
            ✕
          </button>
        </div>
      )}

      <div className={styles.stateActionsButtons}>
        {siguiente && (
          <button
            type="button"
            onClick={handleAvanzar}
            disabled={isPending}
            className={styles.advanceStateButton}
          >
            {isPending ? "Actualizando..." : siguiente.label}
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsConfirmCancelarOpen(true)}
          disabled={isPending}
          className={styles.cancelStateButton}
          title="Cancelar pedido"
        >
          Cancelar
        </button>
      </div>

      <ModalConfirmacion
        isOpen={isConfirmCancelarOpen}
        onClose={() => setIsConfirmCancelarOpen(false)}
        onConfirm={handleConfirmCancelar}
        title="Cancelar Pedido"
        description={
          <>
            ¿Estás seguro de que deseas <strong>CANCELAR</strong> este pedido?
            <br />
            <br />
            Esta acción es irreversible y el pedido pasará a estado cancelado.
          </>
        }
        confirmText="Sí, Cancelar Pedido"
        variant="danger"
        isPending={isPending}
      />
    </div>
  );
}
