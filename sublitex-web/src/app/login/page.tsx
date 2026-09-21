"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { iniciarSesion } from "@/services/authApi";
import { getAuthToken } from "@/services/apiClient";
import { logger } from "@/utils/logger";
import styles from "./login.module.css";

function IconLogotipo() {
  return (
    <span className={styles.brandMark} aria-hidden="true">
      <span className={styles.brandMarkInner}>S</span>
    </span>
  );
}

function IconSpinner() {
  return (
    <svg
      className={styles.spin}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2.6" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PaginaLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ya hay sesión activa: saltamos directo a la app.
  useEffect(() => {
    if (getAuthToken()) router.replace("/pedidos");
  }, [router]);

  function limpiarError() {
    if (error) setError(null);
  }

  async function onSubmit(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!email.trim() || !password) {
      setError("Ingresá tu correo y contraseña.");
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      await iniciarSesion(email.trim(), password);
      router.replace("/pedidos");
    } catch (err) {
      // Nunca loguear email/password: solo el motivo de fallo.
      logger.warn(
        "Login",
        "Inicio de sesión fallido",
        err instanceof Error ? err.message : "No se pudo iniciar sesión."
      );
      setError(
        err instanceof Error ? err.message : "No se pudo iniciar sesión."
      );
      setEnviando(false);
    }
  }

  return (
    <main className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <IconLogotipo />
          <span className={styles.brandWordmark}>SUBLITEX</span>
          <span className={styles.brandSub}>SIPES · Iniciar sesión</span>
        </div>

        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="login-email">
              Correo electrónico
            </label>
            <input
              id="login-email"
              className={styles.input}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="sistema@sublitex.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                limpiarError();
              }}
              disabled={enviando}
            />
          </div>

          <div className={styles.campo}>
            <label className={styles.label} htmlFor="login-password">
              Contraseña
            </label>
            <input
              id="login-password"
              className={styles.input}
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                limpiarError();
              }}
              disabled={enviando}
            />
          </div>

          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.submit}
            disabled={enviando}
          >
            {enviando ? (
              <>
                <IconSpinner />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}