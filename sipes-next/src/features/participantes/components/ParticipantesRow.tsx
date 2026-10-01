"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import type { ParticipanteConPrendas } from "@/features/pedidos/api/pedidos.api";
import {
  actionRegenerarEnlace,
  actionRevocarEnlace,
  actionConfirmarManual,
  actionEliminarParticipante,
  actionActualizarParticipante,
} from "../actions/participantes.actions";
import { Trash2, Pencil, Check, X } from "lucide-react";
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

  // Estado de edición inline del nombre
  const [isEditing, setIsEditing] = useState(false);
  const [nombreEdit, setNombreEdit] = useState(participante.nombrePersona);
  const [nombreActual, setNombreActual] = useState(participante.nombrePersona);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  function handleStartEdit() {
    setNombreEdit(nombreActual);
    setErrorMsg(null);
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setNombreEdit(nombreActual);
    setIsEditing(false);
  }

  function handleSaveEdit() {
    const trimmed = nombreEdit.trim();
    if (!trimmed) {
      setErrorMsg("El nombre no puede estar vacío.");
      return;
    }
    if (trimmed === nombreActual) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      const res = await actionActualizarParticipante(participante.id, trimmed, pedidoId);
      if (res.ok) {
        setNombreActual(trimmed);
        setIsEditing(false);
        setErrorMsg(null);
      } else {
        setErrorMsg(res.error || "No se pudo actualizar el nombre.");
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  }

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
        {isEditing ? (
          <div className={styles.participanteNombreWrapper}>
            <input
              ref={inputRef}
              type="text"
              className={styles.editNameInput}
              value={nombreEdit}
              onChange={(e) => setNombreEdit(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isPending}
              maxLength={100}
              aria-label="Editar nombre del participante"
            />
            <div className={styles.editNameActions}>
              <button
                type="button"
                className={styles.editConfirmBtn}
                onClick={handleSaveEdit}
                disabled={isPending}
                title="Guardar nombre (Enter)"
                aria-label="Guardar nombre"
              >
                <Check size={13} />
              </button>
              <button
                type="button"
                className={styles.editCancelBtn}
                onClick={handleCancelEdit}
                disabled={isPending}
                title="Cancelar (Esc)"
                aria-label="Cancelar edición"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        ) : (
          <span
            className={styles.participanteNombre}
            title={`${nombreActual} · Clic en Editar para modificar`}
          >
            {nombreActual}
          </span>
        )}
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
            type="button"
            className={styles.editBtn}
            onClick={isEditing ? handleCancelEdit : handleStartEdit}
            disabled={isPending}
            title="Editar nombre del participante"
            aria-label="Editar nombre del participante"
          >
            <Pencil size={13} />
          </button>

          <button
            type="button"
            className={styles.revokeButton}
            onClick={() => setModalAction("eliminar")}
            disabled={isPending}
            title="Eliminar participante del grupo"
            aria-label="Eliminar participante del grupo"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "5px 7px" }}
          >
            <Trash2 size={13} />
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
            modalAction === "revocar" ? `¿Revocar el enlace público de ${nombreActual}? El enlace dejará de funcionar.` :
            modalAction === "confirmar" ? `¿Confirmar manualmente la ficha de ${nombreActual}? El estado pasará a Confirmado.` :
            `¿Eliminar a ${nombreActual} y todas sus prendas asignadas del pedido? Esta acción es irreversible.`
          }
          confirmText={modalAction === "revocar" ? "Revocar" : modalAction === "confirmar" ? "Confirmar" : "Eliminar"}
          variant={modalAction === "confirmar" ? "primary" : "danger"}
          isPending={isPending}
        />
      </td>
    </tr>
  );
}
