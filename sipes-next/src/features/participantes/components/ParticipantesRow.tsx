"use client";

import { useState, useTransition } from "react";
import type { ParticipanteConPrendas } from "@/features/pedidos/api/pedidos.api";
import {
  actionRegenerarEnlace,
  actionRevocarEnlace,
  actionConfirmarManual,
  actionEliminarParticipante,
} from "../actions/participantes.actions";
import { ModalConfirmacion } from "@/components/ui/ModalConfirmacion";
import styles from "./participantes.module.css";

interface ParticipantesRowProps {
  index: number;
  participante: ParticipanteConPrendas & { enlaceRevocado?: boolean };
  nombreGrupo: string;
  pedidoId: string;
  onAgregarPrenda?: (participante: ParticipanteConPrendas) => void;
}

export function ParticipantesRow({
  index,
  participante,
  pedidoId,
  onAgregarPrenda,
}: ParticipantesRowProps) {
  const [token, setToken] = useState(participante.enlaceToken);
  const estado = participante.estado;
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [modalAction, setModalAction] = useState<"revocar" | "confirmar" | "eliminar" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCopy() {
    if (!token) return;
    navigator.clipboard.writeText(`${window.location.origin}/participante/${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerate() {
    if (regenerating) return;
    setRegenerating(true);
    const res = await actionRegenerarEnlace(participante.id, pedidoId);
    setRegenerating(false);
    if (res.ok && res.enlaceToken) {
      setToken(res.enlaceToken);
      setCopied(false);
    }
  }

  function handleModalConfirm() {
    if (!modalAction) return;
    setErrorMsg(null);
    const act = modalAction;
    setModalAction(null);
    startTransition(async () => {
      let res;
      if (act === "revocar") res = await actionRevocarEnlace(participante.id, pedidoId);
      else if (act === "confirmar") res = await actionConfirmarManual(participante.id, pedidoId);
      else if (act === "eliminar") res = await actionEliminarParticipante(participante.id, pedidoId);
      if (res && !res.ok) setErrorMsg(res.error || "No se pudo completar la acción.");
    });
  }

  const puedeRevocar = !participante.enlaceRevocado && estado !== "CONFIRMADO";
  const statusConfig = {
    PENDIENTE: { cls: styles.statusBadgePendiente, text: "Pendiente" },
    REGISTRADO: { cls: styles.statusBadgeRegistrado, text: "Registrado" },
    CONFIRMADO: { cls: styles.statusBadgeConfirmado, text: "Confirmado" },
  }[estado] ?? { cls: styles.statusBadgePendiente, text: "Pendiente" };

  return (
    <tr>
      <td className={styles.colIndex}>{index + 1}</td>
      <td className={styles.cellTruncate}>
        <span className={styles.participanteNombre} title={participante.nombrePersona}>
          {participante.nombrePersona}
        </span>
      </td>
      <td>
        <span className={statusConfig.cls}>{statusConfig.text}</span>
      </td>
      <td>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <span className={styles.tabBadge} title={`${participante.prendas?.length ?? 0} prendas`} style={{ fontWeight: 600 }}>
            {participante.prendas?.length ?? 0}
          </span>
          {onAgregarPrenda && (
            <button
              type="button" className={styles.copyButton}
              onClick={() => onAgregarPrenda(participante)}
              title="Sumar una prenda adicional a este participante"
              style={{ padding: "4px 8px", fontSize: "0.75rem", fontWeight: 600 }}
            >
              + Prenda
            </button>
          )}
        </div>
      </td>
      <td>
        {token ? (
          <div className={styles.linkCell}>
            <div className={styles.linkActions}>
              <button type="button" className={styles.copyButton} onClick={handleCopy} title="Copiar enlace público">
                {copied ? "Copiado" : "Copiar enlace"}
              </button>
              <button type="button" className={styles.regenerateButton} onClick={handleRegenerate} disabled={regenerating} title="Regenerar nuevo token de 7 días">
                {regenerating ? "…" : "Renovar"}
              </button>
              {puedeRevocar && (
                <button type="button" className={styles.revokeButton} onClick={() => setModalAction("revocar")} disabled={isPending} title="Revocar enlace">
                  Revocar
                </button>
              )}
            </div>
            {errorMsg && <div className={styles.linkError} role="alert">{errorMsg}</div>}
          </div>
        ) : (
          <button type="button" className={styles.copyButton} onClick={handleRegenerate} disabled={regenerating}>
            {regenerating ? "Generando…" : "+ Generar link"}
          </button>
        )}
      </td>
      <td>
        <div className={styles.linkActions} style={{ justifyContent: "flex-end" }}>
          {estado !== "CONFIRMADO" && (
            <button
              type="button" className={styles.copyButton}
              onClick={() => setModalAction("confirmar")}
              disabled={isPending}
              title="Confirmar participante manualmente sin enlace público"
              style={{ background: "#ecfdf5", color: "#047857", borderColor: "#a7f3d0", fontWeight: 600 }}
            >
              Confirmar
            </button>
          )}
          <button
            type="button" className={styles.revokeButton}
            onClick={() => setModalAction("eliminar")}
            disabled={isPending}
            title="Eliminar participante del grupo"
          >
            Eliminar
          </button>
        </div>

        <ModalConfirmacion
          isOpen={modalAction !== null}
          onClose={() => setModalAction(null)}
          onConfirm={handleModalConfirm}
          title={
            modalAction === "revocar" ? "Revocar Enlace" :
            modalAction === "confirmar" ? "Confirmar Participante" : "Eliminar Participante"
          }
          description={
            modalAction === "revocar" ? `¿Revocar el enlace público de ${participante.nombrePersona}? El enlace dejará de funcionar.` :
            modalAction === "confirmar" ? `¿Confirmar manualmente la ficha de ${participante.nombrePersona}? El estado pasará a Confirmado.` :
            `¿Eliminar a ${participante.nombrePersona} y todas sus prendas asignadas del pedido? Esta acción es irreversible.`
          }
          confirmText={modalAction === "revocar" ? "Revocar" : modalAction === "confirmar" ? "Confirmar" : "Eliminar"}
          variant={modalAction === "confirmar" ? "primary" : "danger"}
          isPending={isPending}
        />
      </td>
    </tr>
  );
}
