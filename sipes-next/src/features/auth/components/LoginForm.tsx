"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import styles from "./login.module.css";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { message?: string };
        setError(body.message ?? "Correo o contraseña incorrectos.");
        return;
      }

      window.location.assign("/pedidos");
    } catch {
      setError("No pudimos conectarnos con el servidor. Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.brand}>
          <Image
            src="/logo-sublitex.png"
            alt="Sublitex"
            width={210}
            height={40}
            priority
            style={{ width: "auto", height: "40px", objectFit: "contain" }}
          />
        </div>
        <p className={styles.subtitle} style={{ marginTop: "12px", marginBottom: "24px" }}>
          Sistema de pedidos
        </p>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">Correo electrónico</label>
          <input
            className={styles.input}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">Contraseña</label>
          <input
            className={styles.input}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <button className={styles.submit} type="submit" disabled={pending}>
          {pending ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}