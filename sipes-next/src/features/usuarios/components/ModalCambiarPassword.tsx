"use client";

import { useState, useTransition } from "react";
import { actionCambiarPassword } from "../actions/usuarios.actions";
import type { UsuarioItem } from "../types/usuario";
import styles from "./usuarios.module.css";

interface ModalCambiarPasswordProps {
  isOpen: boolean;
  usuario: UsuarioItem | null;
  onClose: () => void;
}

export function ModalCambiarPassword({
  isOpen,
  usuario,
  onClose,
}: ModalCambiarPasswordProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !usuario) return null;

  function handleReset() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  }

  function handleClose() {
    handleReset();
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario) return;

    if (!currentPassword) {
      setError("La contraseña actual es obligatoria.");
      return;
    }
    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await actionCambiarPassword(
        usuario.id,
        currentPassword,
        newPassword
      );

      if (!res.ok) {
        setError(res.error || "No se pudo cambiar la contraseña.");
        return;
      }

      handleClose();
    });
  }

  return (
    <div className={styles.modalBackdrop} onClick={handleClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Cambiar Contraseña</h3>
            <p className={styles.modalSubtitle}>
              {usuario.nombre} · {usuario.email}
            </p>
          </div>
          <button
            type="button"
            className={styles.modalCloseButton}
            onClick={handleClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        {error && (
          <div className={styles.modalErrorBanner} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="pwd-actual" className={styles.label}>
              Contraseña Actual *
            </label>
            <input
              id="pwd-actual"
              type="password"
              required
              autoComplete="current-password"
              className={styles.input}
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="pwd-nueva" className={styles.label}>
              Nueva Contraseña * (mínimo 6 caracteres)
            </label>
            <input
              id="pwd-nueva"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className={styles.input}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="pwd-confirmar" className={styles.label}>
              Confirmar Nueva Contraseña *
            </label>
            <input
              id="pwd-confirmar"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className={styles.input}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isPending}
            />
          </div>

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
              {isPending ? "Guardando..." : "Cambiar Contraseña"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
