"use client";

import { useState, useEffect, useTransition } from "react";
import { actionActualizarUsuario } from "../actions/usuarios.actions";
import { ROLES_DISPONIBLES, type UsuarioItem, type RolUsuario } from "../types/usuario";
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
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState<RolUsuario>("VENDEDORA");
  const [activo, setActivo] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre);
      setRol(usuario.rol);
      setActivo(usuario.activo);
      setError(null);
    }
  }, [usuario]);

  if (!isOpen || !usuario) return null;

  function handleClose() {
    setError(null);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario) return;
    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await actionActualizarUsuario(usuario.id, {
        nombre: nombre.trim(),
        rol,
        activo,
      });

      if (!res.ok) {
        setError(res.error || "No se pudo actualizar el usuario.");
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
            <h3 className={styles.modalTitle}>Editar Usuario</h3>
            <p className={styles.modalSubtitle}>{usuario.email}</p>
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
            <label htmlFor="edit-usr-nombre" className={styles.label}>
              Nombre Completo *
            </label>
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
            <label htmlFor="edit-usr-rol" className={styles.label}>
              Rol Operativo en el Sistema *
            </label>
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
          </div>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              disabled={isPending}
            />
            <span>Usuario habilitado / activo</span>
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
              {isPending ? "Guardando..." : "Actualizar Usuario"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
