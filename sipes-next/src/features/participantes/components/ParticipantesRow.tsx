"use client";

import { useState, useTransition } from "react";
import type { ParticipanteConPrendas } from "@/features/pedidos/api/pedidos.api";
import {
  actionRegenerarEnlace,
  actionRevocarEnlace,
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

function getGroupBadgeClass(nombreGrupo: string): string {
  const lower = nombreGrupo.toLowerCase();
  if (lower.includes("kit")) return styles.groupBadgeKit;
  if (lower.includes("camiseta")) return styles.groupBadgeCamiseta;
  return styles.groupBadgeDefault;
}

export function ParticipantesRow({
  index,
  participante,
  nombreGrupo,
  pedidoId,
  onAgregarPrenda,
}: ParticipantesRowProps) {
  const [token, setToken] = useState(participante.enlaceToken);
  const estado = participante.estado;
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleCopy() {
    if (!token) return;
    const url = `${window.location.origin}/participante/${token}`;
    navigator.clipboard.writeText(url);
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

  const [isConfirmRevocarOpen, setIsConfirmRevocarOpen] = useState(false);

  function handleConfirmRevocar() {
    if (isRevoking) return;

    setErrorMsg(null);
    setIsRevoking(true);
    startTransition(async () => {
      const res = await actionRevocarEnlace(participante.id, pedidoId);
      setIsRevoking(false);
      setIsConfirmRevocarOpen(false);
      if (!res.ok) {
        setErrorMsg(res.error || "No se pudo revocar el enlace del participante.");
      }
    });
  }

  const puedeRevocar = !participante.enlaceRevocado && estado !== "CONFIRMADO";

  const badgeClass = getGroupBadgeClass(nombreGrupo);

  let statusBadgeClass = styles.statusBadgePendiente;
  let statusText = "Pendiente";
  if (estado === "REGISTRADO") {
    statusBadgeClass = styles.statusBadgeRegistrado;
    statusText = "Registrado";
  } else if (estado === "CONFIRMADO") {
    statusBadgeClass = styles.statusBadgeConfirmado;
    statusText = "Confirmado";
  }

  return (
    <tr>
      <td className={styles.colIndex}>{index + 1}</td>
      <td className={styles.cellTruncate}>
        <span
          className={styles.participanteNombre}
          title={participante.nombrePersona}
        >
          {participante.nombrePersona}
        </span>
      </td>
      <td>
        <span className={statusBadgeClass}>
          {statusText}
        </span>
      </td>
      <td>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <span
            className={styles.tabBadge}
            title={`${participante.prendas?.length ?? 0} prendas asignadas`}
            style={{ fontWeight: 600 }}
          >
            {participante.prendas?.length ?? 0}
          </span>
          {onAgregarPrenda && (
            <button
              type="button"
              className={styles.copyButton}
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
              <button
                type="button"
                className={styles.copyButton}
                onClick={handleCopy}
                title="Copiar enlace público del participante"
              >
                {copied ? "Copiado" : "Copiar enlace"}
              </button>
              <button
                type="button"
                className={styles.regenerateButton}
                onClick={handleRegenerate}
                disabled={regenerating}
                title="Regenerar nuevo token de 7 días"
              >
                {regenerating ? "…" : "Renovar"}
              </button>
              {puedeRevocar && (
                <button
                  type="button"
                  className={styles.revokeButton}
                  onClick={() => setIsConfirmRevocarOpen(true)}
                  disabled={isRevoking}
                  title="Revocar el enlace público de forma permanente"
                >
                  {isRevoking ? "Revocando…" : "Revocar enlace"}
                </button>
              )}
            </div>

            {errorMsg && (
              <div className={styles.linkError} role="alert">
                {errorMsg}
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className={styles.copyButton}
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            {regenerating ? "Generando…" : "+ Generar link"}
          </button>
        )}

        <ModalConfirmacion
          isOpen={isConfirmRevocarOpen}
          onClose={() => setIsConfirmRevocarOpen(false)}
          onConfirm={handleConfirmRevocar}
          title="Revocar Enlace"
          description={
            <>
              ¿Revocar el enlace público de <strong>{participante.nombrePersona}</strong>?
              <br />
              <br />
              El enlace dejará de funcionar y el participante deberá solicitar un nuevo token.
            </>
          }
          confirmText="Revocar Enlace"
          variant="danger"
          isPending={isRevoking}
        />
      </td>
    </tr>
  );
}
