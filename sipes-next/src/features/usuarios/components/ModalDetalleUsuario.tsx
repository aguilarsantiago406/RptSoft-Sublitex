"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/lib/useIsClient";
import { formatDate } from "@/lib/format/date";
import type { UsuarioItem } from "../types/usuario";
import styles from "./usuarios.module.css";

interface ModalDetalleUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: UsuarioItem | null;
  onEdit?: (usuario: UsuarioItem) => void;
}

export function ModalDetalleUsuario({
  isOpen,
  onClose,
  usuario,
  onEdit,
}: ModalDetalleUsuarioProps) {
  const isClient = useIsClient();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !usuario || !isClient) return null;

  function handleCopyId() {
    if (!usuario) return;
    navigator.clipboard.writeText(usuario.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return createPortal(
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
        <header className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Ficha de Usuario</h3>
            <p className={styles.modalSubtitle}>{usuario.email}</p>
          </div>
          <button type="button" className={styles.modalCloseButton} onClick={onClose} aria-label="Cerrar">✕</button>
        </header>

        <div style={{ padding: "16px 20px", display: "grid", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ padding: "8px 12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Nombre</span>
              <p style={{ margin: "3px 0 0", fontSize: "0.88rem", fontWeight: 600, color: "var(--navy)" }}>{usuario.nombre}</p>
            </div>
            <div style={{ padding: "8px 12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Estado</span>
              <div style={{ marginTop: "4px" }}>
                <span className={`${styles.statusBadge} ${usuario.activo ? styles.statusActive : styles.statusInactive}`}>
                  {usuario.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ padding: "8px 12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Rol Operativo</span>
              <div style={{ marginTop: "4px" }}>
                <span className={styles.roleBadge} style={{ display: "inline-block" }}>{usuario.rol}</span>
              </div>
            </div>
            <div style={{ padding: "8px 12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Fecha de Alta</span>
              <p style={{ margin: "3px 0 0", fontSize: "0.82rem", color: "#475569" }} suppressHydrationWarning>
                {formatDate(usuario.creadoEn)}
              </p>
            </div>
          </div>

          <div style={{ padding: "8px 12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Identificador CUID</span>
              <button
                type="button"
                onClick={handleCopyId}
                style={{ background: "none", border: "none", fontSize: "0.72rem", color: "#0284c7", fontWeight: 600, cursor: "pointer" }}
              >
                {copied ? "Copiado" : "Copiar ID"}
              </button>
            </div>
            <p style={{ margin: "3px 0 0", fontSize: "0.78rem", fontFamily: "monospace", color: "#64748b", wordBreak: "break-all" }}>
              {usuario.id}
            </p>
          </div>
        </div>

        <footer className={styles.modalFooter}>
          <button type="button" className={styles.secondaryButton} onClick={onClose}>
            Cerrar
          </button>
          {onEdit && (
            <button
              type="button"
              className={styles.submitButton}
              onClick={() => {
                onClose();
                onEdit(usuario);
              }}
            >
              Editar Usuario
            </button>
          )}
        </footer>
      </div>
    </div>,
    document.body
  );
}
