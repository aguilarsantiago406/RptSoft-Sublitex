"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import type { Cliente, TipoCliente } from "../types/cliente";
import { actionActualizarCliente } from "../actions/clientes.actions";
import styles from "./clientes.module.css";

interface ModalEditarClienteProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente | null;
}

const TIPOS_CLIENTE: Array<{ value: TipoCliente; label: string }> = [
  { value: "COLEGIO", label: "Colegio / Escuela" },
  { value: "PROMOCION", label: "Promoción escolar" },
  { value: "CLUB", label: "Club deportivo / Academia" },
  { value: "EMPRESA", label: "Empresa / Corporativo" },
  { value: "PARTICULAR", label: "Particular / Evento" },
];

export function ModalEditarCliente({
  isOpen,
  onClose,
  cliente,
}: ModalEditarClienteProps) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<TipoCliente>("PROMOCION");
  const [ciudad, setCiudad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (cliente) {
      setNombre(cliente.nombre);
      setTipo(cliente.tipo);
      setCiudad(cliente.ciudad || "");
      setTelefono(cliente.telefono || "");
      setError(null);
    }
  }, [cliente]);

  if (!isOpen || !mounted || !cliente) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cliente) return;

    if (!nombre.trim()) {
      setError("El nombre de la organización o cliente es obligatorio.");
      return;
    }

    const clienteId = cliente.id;
    setError(null);
    startTransition(async () => {
      const res = await actionActualizarCliente(clienteId, {
        nombre: nombre.trim(),
        tipo,
        ciudad: ciudad.trim() || undefined,
        telefono: telefono.trim() || undefined,
      });

      if (!res.ok) {
        setError(res.error || "No se pudo actualizar el cliente.");
        return;
      }

      onClose();
    });
  }

  return createPortal(
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modalDialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-edit-title"
      >
        <div className={styles.modalHeader}>
          <h2 id="modal-edit-title" className={styles.modalTitle}>
            Editar Cliente / Organización
          </h2>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.modalBody}>
            {error && (
              <div className={styles.errorBanner} role="alert">
                {error}
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="edit-cliente-nombre">
                Nombre de la Organización o Cliente *
              </label>
              <input
                id="edit-cliente-nombre"
                className={styles.formInput}
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="edit-cliente-tipo">
                  Tipo de Cliente
                </label>
                <select
                  id="edit-cliente-tipo"
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
                <label className={styles.formLabel} htmlFor="edit-cliente-ciudad">
                  Ciudad / Sede
                </label>
                <input
                  id="edit-cliente-ciudad"
                  className={styles.formInput}
                  type="text"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="edit-cliente-telefono">
                Teléfono de Contacto Principal
              </label>
              <input
                id="edit-cliente-telefono"
                className={styles.formInput}
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={isPending}
            >
              {isPending ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
