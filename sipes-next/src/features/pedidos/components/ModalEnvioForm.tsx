"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/lib/useIsClient";
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
  const isClient = useIsClient();
  const [nombreCompleto, setNombreCompleto] = useState(initial?.nombreCompleto ?? "");
  const [dni, setDni] = useState(initial?.dni ?? "");
  const [celular, setCelular] = useState(initial?.celular ?? "");
  const [ciudad, setCiudad] = useState(initial?.ciudad ?? "");
  const [agencia, setAgencia] = useState(initial?.agencia ?? "");
  const [referencia, setReferencia] = useState(initial?.referencia ?? "");
  const [correo, setCorreo] = useState(initial?.correo ?? "");
  const [codigoRecojo, setCodigoRecojo] = useState(initial?.codigoRecojo ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !isClient) return null;

  function handleReset() {
    setError(null);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nombreLimpio = nombreCompleto.trim();
    const dniLimpio = dni.trim();
    const celularLimpio = celular.trim();
    const ciudadLimpia = ciudad.trim();
    const agenciaLimpia = agencia.trim();
    const correoLimpio = correo.trim();
    const referenciaLimpia = referencia.trim();

    if (nombreLimpio.length < 2) {
      setError("El nombre completo debe tener al menos 2 caracteres.");
      return;
    }

    if (!/^\d{8,11}$/.test(dniLimpio)) {
      setError("El DNI debe contener 8 dígitos numéricos (o hasta 11 si es RUC).");
      return;
    }

    if (!/^9\d{8}$/.test(celularLimpio)) {
      setError("El celular debe tener exactamente 9 dígitos numéricos y comenzar con 9.");
      return;
    }

    if (ciudadLimpia.length < 2) {
      setError("La ciudad debe tener al menos 2 caracteres.");
      return;
    }

    if (agenciaLimpia.length < 2) {
      setError("La agencia debe tener al menos 2 caracteres.");
      return;
    }

    if (correoLimpio && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
      setError("El correo electrónico no tiene un formato válido (Ej: usuario@dominio.com).");
      return;
    }

    const data: DatosEnvioForm = {
      nombreCompleto: nombreLimpio,
      dni: dniLimpio,
      celular: celularLimpio,
      ciudad: ciudadLimpia,
      agencia: agenciaLimpia,
      referencia: referenciaLimpia || undefined,
      correo: correoLimpio || undefined,
      codigoRecojo: codigoRecojo.trim() || undefined,
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

  return createPortal(
    <div className={styles.modalBackdrop} onClick={handleReset}>
      <div className={styles.modalCardWide} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>
              {initial ? "Editar datos de envío" : "Registrar datos de envío"}
            </h3>
            <p className={styles.modalSubtitle}>
              Los siete datos de rotulado para despacho · Sin los siete no se despacha
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
              <label htmlFor="envio-dni">DNI / Documento *</label>
              <input
                id="envio-dni"
                type="text"
                inputMode="numeric"
                maxLength={11}
                required
                placeholder="Ej: 72345678"
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 11))}
                className={styles.formInput}
              />
              <small className={styles.formHint}>Solo números (8 dígitos para DNI)</small>
            </div>

            <div className={styles.formField}>
              <label htmlFor="envio-celular">Celular *</label>
              <input
                id="envio-celular"
                type="text"
                inputMode="numeric"
                maxLength={9}
                required
                placeholder="Ej: 987654321"
                value={celular}
                onChange={(e) => setCelular(e.target.value.replace(/\D/g, "").slice(0, 9))}
                className={styles.formInput}
              />
              <small className={styles.formHint}>9 dígitos comenzando con 9</small>
            </div>
          </div>

          <div className={styles.twoColsLayout} style={{ gap: "12px" }}>
            <div className={styles.formField}>
              <label htmlFor="envio-ciudad">Ciudad *</label>
              <input
                id="envio-ciudad"
                type="text"
                required
                placeholder="Ej: Arequipa"
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
                placeholder="Ej: Shalom / Marvisur"
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
                placeholder="Ej: Dejar en agencia terminal norte"
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
                type="email"
                placeholder="Ej: contacto@empresa.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className={styles.formInput}
              />
              <small className={styles.formHint}>Para aviso de entrega</small>
            </div>
          </div>

          <div className={styles.formField}>
            <label htmlFor="envio-codigoRecojo" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Clave / Código de Recojo en Agencia (Confidencial)</span>
              <span style={{ fontSize: "11px", color: "#b45309", fontWeight: 600 }}>🔒 Retenido según saldo</span>
            </label>
            <input
              id="envio-codigoRecojo"
              type="text"
              placeholder="Ej: 7492-X / Clave de retiro Shalom o Marvisur"
              value={codigoRecojo}
              onChange={(e) => setCodigoRecojo(e.target.value)}
              className={styles.formInput}
            />
            <small className={styles.formHint}>
              Solo se liberará y mostrará para entrega al cliente si el saldo pendiente de pago es S/ 0.00.
            </small>
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
    </div>,
    document.body
  );
}