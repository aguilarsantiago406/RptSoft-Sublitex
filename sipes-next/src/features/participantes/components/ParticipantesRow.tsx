"use client";

import { useState, useTransition } from "react";
import type { ParticipanteConPrendas } from "@/features/pedidos/api/pedidos.api";
import {
  actionRegenerarEnlace,
  actionRevocarEnlace,
} from "../actions/participantes.actions";
import styles from "./participantes.module.css";

interface ParticipantesRowProps {
  index: number;
  participante: ParticipanteConPrendas & { enlaceRevocado?: boolean };
  nombreGrupo: string;
  pedidoId: string;
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

  function handleOpenWhatsApp() {
    if (!token) return;
    const url = `${window.location.origin}/participante/${token}`;
    const wa = `https://wa.me/?text=${encodeURIComponent(
      `Hola ${participante.nombrePersona}, completa tus datos para tu prenda de Sublitex: ${url}`
    )}`;
    window.open(wa, "_blank", "noreferrer");
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

  function handleRevocar() {
    if (isRevoking) return;

    const confirmar = window.confirm(
      `¿Revocar el enlace público de ${participante.nombrePersona}?\n\nEl enlace dejará de funcionar y el participante deberá solicitar un nuevo token.`
    );
    if (!confirmar) return;

    setErrorMsg(null);
    setIsRevoking(true);
    startTransition(async () => {
      const res = await actionRevocarEnlace(participante.id, pedidoId);
      setIsRevoking(false);
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
      <td>
        <span className={badgeClass}>{nombreGrupo}</span>
      </td>
      <td>
        <span style={{ fontWeight: 500, color: "var(--navy)" }}>{participante.nombrePersona}</span>
      </td>
      <td>
        <span className={statusBadgeClass}>
          {statusText}
        </span>
      </td>
      <td>
        {token ? (
          <div className={styles.linkCell}>
            <div className={styles.linkActions}>
              <button
                type="button"
                className={styles.copyButton}
                onClick={handleCopy}
                title="Copiar enlace público para WhatsApp"
              >
                {copied ? "Copiado" : "Copiar enlace"}
              </button>
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className={styles.whatsappButton}
                title="Abrir chat de WhatsApp con el mensaje"
              >
                WhatsApp
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
                  onClick={handleRevocar}
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
      </td>
    </tr>
  );
}
