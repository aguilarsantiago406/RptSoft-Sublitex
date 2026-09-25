"use client";

import { useState } from "react";
import type { ParticipanteConPrendas } from "@/features/pedidos/api/pedidos.api";
import { actionRegenerarEnlace } from "../actions/participantes.actions";
import styles from "./participantes.module.css";

interface ParticipantesRowProps {
  index: number;
  participante: ParticipanteConPrendas;
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
        {token ? (
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
