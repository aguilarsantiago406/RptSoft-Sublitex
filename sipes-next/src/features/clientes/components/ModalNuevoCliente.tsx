"use client";

import { useState, useTransition } from "react";
import type { TipoCliente } from "../types/cliente";
import { actionCrearCliente } from "../actions/clientes.actions";
import styles from "./clientes.module.css";

interface ModalNuevoClienteProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TIPOS_CLIENTE: Array<{ value: TipoCliente; label: string }> = [
  { value: "COLEGIO", label: "Colegio / Escuela" },
  { value: "PROMOCION", label: "Promoción escolar" },
  { value: "CLUB", label: "Club deportivo / Academia" },
  { value: "EMPRESA", label: "Empresa / Corporativo" },
  { value: "PARTICULAR", label: "Particular / Evento" },
];

export function ModalNuevoCliente({
  isOpen,
  onClose,
  onSuccess,
}: ModalNuevoClienteProps) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<TipoCliente>("PROMOCION");
  const [ciudad, setCiudad] = useState("Lima");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleReset() {
    setNombre("");
    setTipo("PROMOCION");
    setCiudad("Lima");
    setTelefono("");
    setError(null);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El nombre de la organización o cliente es obligatorio.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await actionCrearCliente({
        nombre: nombre.trim(),
        tipo,
        ciudad: ciudad.trim() || undefined,
        telefono: telefono.trim() || undefined,
      });

      if (!res.ok) {
        setError(res.error ?? "No se pudo registrar el cliente.");
        return;
      }

      handleReset();
      onSuccess?.();
    });
  }

  return (
    <div className={styles.modalBackdrop} onClick={handleReset}>
      <div
        className={styles.modalDialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.modalHeader}>
          <h2 id="modal-title" className={styles.modalTitle}>
            Nuevo Cliente / Organización
          </h2>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={handleReset}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="cliente-nombre">
                Nombre de la Organización o Grupo *
              </label>
              <input
                id="cliente-nombre"
                className={styles.formInput}
                type="text"
                placeholder="Ej. Colegio San Agustín - Promo 2026"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoFocus
                required
              />
              <span className={styles.formHint}>
                Un cliente en SIPES representa a la entidad o grupo contratante.
              </span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="cliente-tipo">
                Tipo de Cliente / Segmento *
              </label>
              <select
                id="cliente-tipo"
                className={styles.formSelect}
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoCliente)}
              >
                {TIPOS_CLIENTE.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="cliente-ciudad">
                Ciudad o Sede
              </label>
              <input
                id="cliente-ciudad"
                className={styles.formInput}
                type="text"
                placeholder="Ej. Lima, Trujillo, Arequipa"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="cliente-telefono">
                Teléfono de Contacto Principal
              </label>
              <input
                id="cliente-telefono"
                className={styles.formInput}
                type="tel"
                placeholder="Ej. 999 888 777"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={handleReset}
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={isPending}
            >
              {isPending ? "Registrando..." : "Guardar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
