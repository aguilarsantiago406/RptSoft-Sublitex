"use client";

import { useState, useTransition } from "react";
import { actionCrearUsuario } from "../actions/usuarios.actions";
import { ROLES_DISPONIBLES, type RolUsuario } from "../types/usuario";
import styles from "./usuarios.module.css";

interface ModalNuevoUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModalNuevoUsuario({ isOpen, onClose }: ModalNuevoUsuarioProps) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<RolUsuario>("VENDEDORA");
  const [activo, setActivo] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleReset() {
    setNombre("");
    setEmail("");
    setPassword("");
    setRol("VENDEDORA");
    setActivo(true);
    setError(null);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await actionCrearUsuario({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password,
        rol,
        activo,
      });

      if (!res.ok) {
        setError(res.error || "No se pudo registrar el usuario.");
        return;
      }

      handleReset();
    });
  }

  return (
    <div className={styles.modalBackdrop} onClick={handleReset}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Registrar Usuario</h3>
            <p className={styles.modalSubtitle}>
              Alta de operador, vendedor o personal de taller en SIPES
            </p>
          </div>
          <button
            type="button"
            className={styles.modalCloseButton}
            onClick={handleReset}
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
            <label htmlFor="usr-nombre" className={styles.label}>
              Nombre Completo *
            </label>
            <input
              id="usr-nombre"
              type="text"
              required
              className={styles.input}
              placeholder="Ej: Laura Méndez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="usr-email" className={styles.label}>
              Correo Electrónico (Login) *
            </label>
            <input
              id="usr-email"
              type="email"
              required
              className={styles.input}
              placeholder="usuario@sublitex.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="usr-password" className={styles.label}>
              Contraseña Inicial * (mínimo 6 caracteres)
            </label>
            <input
              id="usr-password"
              type="password"
              required
              minLength={6}
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="usr-rol" className={styles.label}>
              Rol Operativo en el Sistema *
            </label>
            <select
              id="usr-rol"
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
            <span>Usuario activo (puede iniciar sesión de inmediato)</span>
          </label>

          <footer className={styles.modalFooter}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleReset}
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isPending}
            >
              {isPending ? "Registrando..." : "Guardar Usuario"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
