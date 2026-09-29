"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/lib/useIsClient";
import { actionActualizarUsuario, actionCambiarPasswordUsuario } from "../actions/usuarios.actions";
import { ROLES_DISPONIBLES, ROLES_CONFIG, type UsuarioItem, type RolUsuario } from "../types/usuario";
import styles from "./usuarios.module.css";

interface ModalEditarUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: UsuarioItem | null;
}

export function ModalEditarUsuario({
  isOpen,
  onClose,
  usuario,
}: ModalEditarUsuarioProps) {
  const isClient = useIsClient();
  const [nombre, setNombre] = useState(usuario?.nombre ?? "");
  const [rol, setRol] = useState<RolUsuario>(usuario?.rol ?? "VENDEDORA");
  const [activo, setActivo] = useState(usuario?.activo ?? true);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !usuario || !isClient) return null;

  const rolActual = ROLES_CONFIG[rol];

  function handleClose() {
    setNewPassword("");
    setError(null);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario) return;
    if (!nombre.trim()) return setError("El nombre es obligatorio.");
    if (newPassword && newPassword.length < 6) {
      return setError("La nueva contraseña debe tener al menos 6 caracteres.");
    }

    setError(null);
    startTransition(async () => {
      const res = await actionActualizarUsuario(usuario.id, {
        nombre: nombre.trim(),
        rol,
        activo,
      });

      if (!res.ok) return setError(res.error || "No se pudo actualizar el usuario.");

      if (newPassword.trim()) {
        const pwdRes = await actionCambiarPasswordUsuario(usuario.id, newPassword.trim());
        if (!pwdRes.ok) return setError(pwdRes.error || "No se pudo cambiar la contraseña.");
      }

      handleClose();
    });
  }

  return createPortal(
    <div className={styles.modalBackdrop} onClick={handleClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Editar Usuario</h3>
            <p className={styles.modalSubtitle}>{usuario.email}</p>
          </div>
          <button type="button" className={styles.modalCloseButton} onClick={handleClose} aria-label="Cerrar">✕</button>
        </header>

        {error && <div className={styles.modalErrorBanner} role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="edit-usr-nombre" className={styles.label}>Nombre Completo *</label>
            <input
              id="edit-usr-nombre"
              type="text"
              required
              className={styles.input}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="edit-usr-rol" className={styles.label}>Rol Operativo en el Sistema *</label>
            <select
              id="edit-usr-rol"
              className={styles.select}
              value={rol}
              onChange={(e) => setRol(e.target.value as RolUsuario)}
              disabled={isPending}
            >
              {ROLES_DISPONIBLES.map((r) => (
                <option key={r.rol} value={r.rol}>
                  {r.label}
                </option>
              ))}
            </select>

            {rolActual && (
              <div className={styles.permisosBox}>
                <p className={styles.permisosTitulo}>Alcance y Permisos del Perfil:</p>
                <p className={styles.permisosDesc}>{rolActual.descripcion}</p>
                <div className={styles.permisosChips}>
                  {rolActual.permisos.map((p) => (
                    <span key={p} className={styles.permisoChip}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="edit-usr-pass" className={styles.label}>Nueva Contraseña (opcional)</label>
            <input
              id="edit-usr-pass"
              type="password"
              minLength={6}
              className={styles.input}
              placeholder="Dejar en blanco para conservar actual"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isPending}
            />
          </div>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              disabled={isPending}
            />
            <span>Cuenta activa (habilitada para acceder al sistema)</span>
          </label>

          <footer className={styles.modalFooter}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isPending}
            >
              {isPending ? "Guardando..." : "Guardar Cambios"}
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body
  );
}
