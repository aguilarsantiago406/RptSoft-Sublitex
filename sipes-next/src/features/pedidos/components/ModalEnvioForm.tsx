"use client";

import { useEffect, useState, useTransition } from "react";
import type { DatosEnvioItem } from "../api/comercial.api";
import {
  actionActualizarDatosEnvio,
  actionRegistrarDatosEnvio,
  type DatosEnvioForm,
} from "../actions/envio.actions";
import styles from "./pedidos.module.css";

interface ModalEnvioFormProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: string;
  initial?: DatosEnvioItem | null;
}

export function ModalEnvioForm({ isOpen, onClose, pedidoId, initial }: ModalEnvioFormProps) {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [dni, setDni] = useState("");
  const [celular, setCelular] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [agencia, setAgencia] = useState("");
  const [referencia, setReferencia] = useState("");
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) return;
    setNombreCompleto(initial?.nombreCompleto ?? "");
    setDni(initial?.dni ?? "");
    setCelular(initial?.celular ?? "");
    setCiudad(initial?.ciudad ?? "");
    setAgencia(initial?.agencia ?? "");
    setReferencia(initial?.referencia ?? "");
    setCorreo(initial?.correo ?? "");
    setError(null);
  }, [isOpen, initial]);

  if (!isOpen) return null;

  function handleReset() {
    setError(null);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data: DatosEnvioForm = {
      nombreCompleto,
      dni,
      celular,
      ciudad,
      agencia,
      referencia: referencia.trim() || undefined,
      correo: correo.trim() || undefined,
    };

    setError(null);
    startTransition(async () => {
      const res = initial
        ? await actionActualizarDatosEnvio(pedidoId, data)
        : await actionRegistrarDatosEnvio(pedidoId, data);

      if (!res.ok) {
        setError(res.error || "No se pudo guardar los datos de envío.");
        return;
      }

      handleReset();
    });
  }

  return (
    <div className={styles.modalBackdrop} onClick={handleReset}>
      <div className={styles.modalCardWide} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>
              {initial ? "Editar datos de envío" : "Registrar datos de envío"}
            </h3>
            <p className={styles.modalSubtitle}>
              Los siete datos de rotulado para despacho a provincia (R-K08) · Sin los siete no se
              despacha
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
        </div>

        {error && (
          <div className={styles.modalErrorBanner} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formField}>
            <label htmlFor="envio-nombre">Nombre completo *</label>
            <input
              id="envio-nombre"
              type="text"
              required
              placeholder="Ej: Juan Carlos Rodríguez"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              className={styles.formInput}
              autoFocus
            />
          </div>

          <div className={styles.twoColsLayout} style={{ gap: "12px" }}>
            <div className={styles.formField}>
              <label htmlFor="envio-dni">DNI *</label>
              <input
                id="envio-dni"
                type="text"
                required
                placeholder="Ej: 30123456"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="envio-celular">Celular *</label>
              <input
                id="envio-celular"
                type="text"
                required
                placeholder="Ej: 3515551234"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.twoColsLayout} style={{ gap: "12px" }}>
            <div className={styles.formField}>
              <label htmlFor="envio-ciudad">Ciudad *</label>
              <input
                id="envio-ciudad"
                type="text"
                required
                placeholder="Ej: Córdoba"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="envio-agencia">Agencia *</label>
              <input
                id="envio-agencia"
                type="text"
                required
                placeholder="Ej: Andreani Centro"
                value={agencia}
                onChange={(e) => setAgencia(e.target.value)}
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.twoColsLayout} style={{ gap: "12px" }}>
            <div className={styles.formField}>
              <label htmlFor="envio-referencia">Referencia (Opcional)</label>
              <input
                id="envio-referencia"
                type="text"
                placeholder="Ej: Entregar en portería del club"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className={styles.formInput}
              />
              <small className={styles.formHint}>Suelo de consulta para el despacho</small>
            </div>

            <div className={styles.formField}>
              <label htmlFor="envio-correo">Correo (Opcional)</label>
              <input
                id="envio-correo"
                type="text"
                placeholder="Ej: contacto@colegio.edu.ar"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className={styles.formInput}
              />
              <small className={styles.formHint}>Para aviso de entrega</small>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.modalCancelButton}
              onClick={handleReset}
              disabled={isPending}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.modalSubmitButton} disabled={isPending}>
              {isPending ? "Guardando…" : "Guardar datos de envío"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}