"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/lib/useIsClient";
import type { GrupoPedido } from "@/features/pedidos/types/pedido";
import { actionCrearParticipante } from "../actions/participantes.actions";
import styles from "./participantes.module.css";

interface NuevoParticipanteModalProps {
  isOpen: boolean;
  onClose: () => void;
  grupos: GrupoPedido[];
  pedidoId: string;
}

export function NuevoParticipanteModal({
  isOpen,
  onClose,
  grupos,
  pedidoId,
}: NuevoParticipanteModalProps) {
  const isClient = useIsClient();
  const [nombrePersona, setNombrePersona] = useState("");
  const [grupoId, setGrupoId] = useState(grupos[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !isClient) return null;

  const grupoValidoId = grupos.some((g) => g.id === grupoId) ? grupoId : (grupos[0]?.id ?? "");

  function handleResetAndClose() {
    setNombrePersona("");
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombrePersona.trim() || !grupoValidoId) return;
    setLoading(true);
    setError(null);
    const tipoProductoId = grupos.find((g) => g.id === grupoValidoId)?.tipoProducto?.id;
    const res = await actionCrearParticipante(
      grupoValidoId,
      nombrePersona,
      pedidoId,
      tipoProductoId ? { tipoProductoId, tipoPrenda: "VENTA", esArquero: false } : undefined
    );
    setLoading(false);
    if (!res.ok || !res.participante) {
      setError(res.error ?? "Ocurrió un error al registrar al participante.");
      return;
    }
    handleResetAndClose();
  }

  const sinGrupos = grupos.length === 0;

  return createPortal(
    <div className={styles.modalBackdrop} onClick={handleResetAndClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Nuevo Participante</h2>
            <p className={styles.modalSubtitle}>Registra al participante en el pedido</p>
          </div>
          <button type="button" className={styles.modalClose} onClick={handleResetAndClose} aria-label="Cerrar">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {sinGrupos && (
            <div className={styles.noGroupsAlert} role="alert">
              <h4 className={styles.noGroupsAlertTitle}>Este pedido aún no tiene grupos técnicos</h4>
              <p className={styles.noGroupsAlertText}>Agrega al menos un grupo en la sección 2 del pedido para poder registrar participantes.</p>
            </div>
          )}
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="nombrePersona">Participante</label>
            <input
              id="nombrePersona"
              type="text"
              className={styles.formInput}
              placeholder="Ej. Lucas Gómez"
              value={nombrePersona}
              onChange={(e) => setNombrePersona(e.target.value)}
              required
              autoFocus={!sinGrupos}
              disabled={sinGrupos}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="grupoId">Grupo</label>
            {sinGrupos ? (
              <select id="grupoId" className={styles.formSelect} disabled value=""><option value="">Sin grupos técnicos configurados</option></select>
            ) : (
              <select id="grupoId" className={styles.formSelect} value={grupoId} onChange={(e) => setGrupoId(e.target.value)} required>
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>{g.nombre} ({g.tipoProducto?.nombre ?? "Producto"})</option>
                ))}
              </select>
            )}
          </div>

          {error && <p style={{ color: "#b3261e", fontSize: "0.82rem", fontWeight: 700, margin: "8px 0" }}>{error}</p>}
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={handleResetAndClose} disabled={loading}>Cancelar</button>
            <button type="submit" className={styles.primaryButton} disabled={loading || sinGrupos || !nombrePersona.trim()}>
              {loading ? "Guardando…" : "Registrar Participante"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
