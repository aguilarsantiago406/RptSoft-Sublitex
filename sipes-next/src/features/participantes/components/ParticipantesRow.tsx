"use client";

import { useState } from "react";
import type { ParticipanteConPrendas, TallaCatalogoItem } from "@/features/pedidos/api/pedidos.api";
import { actionRegenerarEnlace, actionConfirmarManual } from "../actions/participantes.actions";
import styles from "./participantes.module.css";

interface ParticipantesRowProps {
  index: number;
  participante: ParticipanteConPrendas;
  nombreGrupo: string;
  pedidoId: string;
  mapaTallas: Map<string, string>;
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
  mapaTallas,
}: ParticipantesRowProps) {
  const [token, setToken] = useState(participante.enlaceToken);
  const [estado, setEstado] = useState(participante.estado);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function handleCopy() {
    if (!token) return;
    const url = `${window.location.origin}/enlace/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleOpenWhatsApp() {
    if (!token) return;
    const url = `${window.location.origin}/enlace/${token}`;
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

  async function handleConfirmarManual() {
    if (confirming || estado === "CONFIRMADO") return;
    setConfirming(true);
    const res = await actionConfirmarManual(participante.id, pedidoId);
    setConfirming(false);
    if (res.ok) {
      setEstado("CONFIRMADO");
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

  const prendas = participante.prendas ?? [];

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
          {estado === "CONFIRMADO" ? "✓ " : ""}
          {statusText}
        </span>
      </td>
      <td>
        {(() => {
          if (prendas.length === 0) {
            return <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>Sin prendas</span>;
          }
          const faltanTallas = prendas.some((p) => !p.tallaId);
          if (estado === "PENDIENTE" || faltanTallas) {
            return (
              <span className={styles.statusBadgePendiente}>
                ⚠️ Pendiente de carga
              </span>
            );
          }
          return (
            <span className={styles.statusBadgeConfirmado}>
              ✓ Datos completos
            </span>
          );
        })()}
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
              {copied ? "✓ Copiado" : "🔗 Copiar link"}
            </button>
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className={styles.whatsappButton}
              title="Abrir chat de WhatsApp con el mensaje"
            >
              💬 WhatsApp
            </button>
            <button
              type="button"
              className={styles.regenerateButton}
              onClick={handleRegenerate}
              disabled={regenerating}
              title="Regenerar nuevo token de 7 días"
            >
              {regenerating ? "…" : "🔄"}
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
      <td>
        {estado !== "CONFIRMADO" && (
          <button
            type="button"
            className={styles.copyButton}
            onClick={handleConfirmarManual}
            disabled={confirming}
            style={{ fontSize: "0.72rem", padding: "4px 8px" }}
            title="Confirmar manualmente como coordinador"
          >
            {confirming ? "…" : "Validar ✓"}
          </button>
        )}
      </td>
    </tr>
  );
}
