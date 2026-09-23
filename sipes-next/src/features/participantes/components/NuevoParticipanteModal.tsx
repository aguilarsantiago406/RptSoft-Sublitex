"use client";

import { useState } from "react";
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
  const [nombrePersona, setNombrePersona] = useState("");
  const [grupoId, setGrupoId] = useState(grupos[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombrePersona.trim() || !grupoId) return;

    setLoading(true);
    setError(null);

    const selectedGrupo = grupos.find((g) => g.id === grupoId);
    const tipoProductoId = selectedGrupo?.tipoProducto?.id;

    const res = await actionCrearParticipante(
      grupoId,
      nombrePersona,
      pedidoId,
      tipoProductoId
    );
    setLoading(false);

    if (!res.ok || !res.participante) {
      setError(res.error ?? "Ocurrió un error al registrar al participante.");
      return;
    }

    setCreatedToken(res.participante.enlaceToken);
  }

  function handleCopy() {
    if (!createdToken) return;
    const url = `${window.location.origin}/participante/${createdToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleOpenWhatsApp() {
    if (!createdToken) return;
    const url = `${window.location.origin}/participante/${createdToken}`;
    const wa = `https://wa.me/?text=${encodeURIComponent(
      `Hola ${nombrePersona}, completa tus datos para tu prenda de Sublitex en este enlace: ${url}`
    )}`;
    window.open(wa, "_blank", "noreferrer");
  }

  function handleResetAndClose() {
    setNombrePersona("");
    setCreatedToken(null);
    setError(null);
    setCopied(false);
    onClose();
  }

  return (
    <div className={styles.modalBackdrop} onClick={handleResetAndClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Nuevo Participante</h2>
            <p className={styles.modalSubtitle}>
              {createdToken
                ? "Participante registrado con éxito"
                : "Registra a un participante y genera su enlace de WhatsApp"}
            </p>
          </div>
          <button
            type="button"
            className={styles.modalClose}
            onClick={handleResetAndClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {createdToken ? (
          <div>
            <div className={styles.successBox}>
              <p className={styles.successTitle}>Enlace generado para {nombrePersona}</p>
              <div className={styles.linkUrlRow}>
                <span>/participante/{createdToken}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
              <button
                type="button"
                className={styles.copyButton}
                onClick={handleCopy}
                style={{ flex: 1, padding: "9px 12px", justifyContent: "center" }}
              >
                {copied ? "¡Copiado!" : "Copiar enlace"}
              </button>
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className={styles.whatsappButton}
                style={{ flex: 1, padding: "9px 12px", justifyContent: "center" }}
              >
                Enviar WhatsApp
              </button>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleResetAndClose}
              >
                Finalizar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="nombrePersona">
                Nombre de la persona
              </label>
              <input
                id="nombrePersona"
                type="text"
                className={styles.formInput}
                placeholder="Ej. Lucas Gómez"
                value={nombrePersona}
                onChange={(e) => setNombrePersona(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="grupoId">
                Grupo técnico
              </label>
              <select
                id="grupoId"
                className={styles.formSelect}
                value={grupoId}
                onChange={(e) => setGrupoId(e.target.value)}
              >
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nombre} ({g.tipoProducto?.nombre ?? "Producto"})
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p style={{ color: "#b3261e", fontSize: "0.82rem", fontWeight: 700, margin: "8px 0" }}>
                {error}
              </p>
            )}

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleResetAndClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={loading || !nombrePersona.trim()}
              >
                {loading ? "Generando…" : "Generar Enlace"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
