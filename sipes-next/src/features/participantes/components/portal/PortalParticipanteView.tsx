"use client";

import { useState } from "react";
import type { ParticipantePublicoDetalle } from "../../api/portal.api";
import type { TallaCatalogoItem } from "@/features/pedidos/api/pedidos.api";
import {
  actionGuardarFichaParticipante,
  actionConfirmarFichaParticipante,
} from "../../actions/portal.actions";
import styles from "./portal.module.css";

interface PortalParticipanteViewProps {
  participante: ParticipantePublicoDetalle;
  tallas: TallaCatalogoItem[];
}

interface FormPrendaState {
  prendaId: string;
  tallaId: string;
  genero: "HOMBRE" | "MUJER" | "NINO" | "NINA" | "SIN_ESPECIFICAR";
  numero: string;
  nombreEnPrenda: string;
}

export function PortalParticipanteView({
  participante,
  tallas,
}: PortalParticipanteViewProps) {
  const [estado, setEstado] = useState(participante.estado);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Inicializar estado del formulario con las prendas del participante
  const [prendasForm, setPrendasForm] = useState<FormPrendaState[]>(() =>
    participante.prendas.map((p) => ({
      prendaId: p.id,
      tallaId: p.tallaId ?? "",
      genero: p.genero ?? "SIN_ESPECIFICAR",
      numero: p.numero ?? "",
      nombreEnPrenda: p.nombreEnPrenda ?? "",
    }))
  );

  const isConfirmed = estado === "CONFIRMADO";

  function handleFieldChange(
    index: number,
    field: keyof FormPrendaState,
    value: string
  ) {
    setPrendasForm((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setError(null);
    setSuccessMsg(null);
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    if (saving || isConfirmed) return;

    setError(null);
    setSuccessMsg(null);
    setSaving(true);

    const dto = {
      prendas: prendasForm.map((p) => ({
        prendaId: p.prendaId,
        tallaId: p.tallaId || undefined,
        genero: p.genero,
        numero: p.numero.trim() || undefined,
        nombreEnPrenda: p.nombreEnPrenda.trim().toUpperCase() || undefined,
      })),
    };

    const res = await actionGuardarFichaParticipante(
      participante.enlaceToken,
      dto
    );
    setSaving(false);

    if (res.ok) {
      setEstado("REGISTRADO");
      setSuccessMsg("¡Tus datos se guardaron correctamente!");
    } else {
      setError(res.error ?? "No se pudieron guardar los datos.");
    }
  }

  async function handleConfirmar() {
    if (confirming || isConfirmed) return;

    // Validar que todas las prendas tengan talla antes de confirmar
    const sinTalla = prendasForm.some((p) => !p.tallaId);
    if (sinTalla) {
      setError("Por favor seleccioná tu talla antes de confirmar definitivamente.");
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setConfirming(true);

    const res = await actionConfirmarFichaParticipante(
      participante.enlaceToken
    );
    setConfirming(false);

    if (res.ok) {
      setEstado("CONFIRMADO");
      setSuccessMsg("¡Ficha confirmada con éxito! Ya no se requieren más cambios.");
    } else {
      setError(res.error ?? "No se pudo confirmar la ficha.");
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.brandHeader}>
        <div className={styles.brandLogo}>SUBLITEX</div>
        <div className={styles.brandSubtitle}>Ficha Técnica de Participante</div>
      </header>

      <main className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.groupBadge}>{participante.grupo.nombre}</span>
          <h1 className={styles.greeting}>Hola, {participante.nombrePersona}</h1>
          <p className={styles.cardInstruction}>
            {isConfirmed
              ? "Tus especificaciones ya están confirmadas y listas para corte."
              : "Completá los datos de tu prenda para iniciar la confección."}
          </p>
        </div>

        <div className={styles.cardBody}>
          {isConfirmed && (
            <div className={styles.statusBannerConfirmado}>
              <span>✓</span>
              <div>
                <strong>Ficha Confirmada</strong>
                <div style={{ fontSize: "0.78rem", opacity: 0.9 }}>
                  Tus datos fueron validados y están bloqueados para producción.
                </div>
              </div>
            </div>
          )}

          {!isConfirmed && estado === "REGISTRADO" && (
            <div className={styles.statusBannerRegistrado}>
              <span>ℹ</span>
              <div>
                <strong>Datos Guardados</strong>
                <div style={{ fontSize: "0.78rem", opacity: 0.9 }}>
                  Podés modificarlos o confirmarlos definitivamente abajo.
                </div>
              </div>
            </div>
          )}

          {error && <div className={styles.errorBanner}>{error}</div>}
          {successMsg && !isConfirmed && (
            <div className={styles.statusBannerConfirmado}>{successMsg}</div>
          )}

          <form onSubmit={handleGuardar}>
            {prendasForm.map((p, idx) => {
              const prendaOriginal = participante.prendas[idx];
              const tituloPrenda =
                participante.prendas.length > 1
                  ? `Prenda #${idx + 1}`
                  : "Detalles de la Prenda";

              const tallasPrenda = tallas.filter(
                (t) =>
                  !prendaOriginal?.tipoProductoId ||
                  t.tipoProductoId === prendaOriginal.tipoProductoId
              );
              const tallasOpciones =
                tallasPrenda.length > 0 ? tallasPrenda : tallas;

              return (
                <div key={p.prendaId} className={styles.prendaCard}>
                  <div className={styles.prendaTitle}>
                    {tituloPrenda}
                    {prendaOriginal?.esArquero && (
                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: "0.72rem",
                          background: "#fef3c7",
                          color: "#92400e",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        Arquero
                      </span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                      Talla <span className={styles.required}>*</span>
                    </label>
                    <select
                      className={styles.select}
                      value={p.tallaId}
                      disabled={isConfirmed || saving || confirming}
                      onChange={(e) =>
                        handleFieldChange(idx, "tallaId", e.target.value)
                      }
                      required
                    >
                      <option value="">-- Seleccioná tu talla --</option>
                      {tallasOpciones.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.codigo} {t.etiqueta ? `(${t.etiqueta})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Corte / Género</label>
                    <select
                      className={styles.select}
                      value={p.genero}
                      disabled={isConfirmed || saving || confirming}
                      onChange={(e) =>
                        handleFieldChange(idx, "genero", e.target.value as any)
                      }
                    >
                      <option value="SIN_ESPECIFICAR">Unisex / Estándar</option>
                      <option value="HOMBRE">Hombre (Corte Recto)</option>
                      <option value="MUJER">Mujer (Corte Entallado)</option>
                      <option value="NINO">Niño</option>
                      <option value="NINA">Niña</option>
                    </select>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Número en la Espalda</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Ej: 10 (opcional)"
                      maxLength={4}
                      value={p.numero}
                      disabled={isConfirmed || saving || confirming}
                      onChange={(e) =>
                        handleFieldChange(idx, "numero", e.target.value)
                      }
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Nombre o Apodo en Prenda</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Ej: SANTIAGO (opcional)"
                      maxLength={20}
                      value={p.nombreEnPrenda}
                      disabled={isConfirmed || saving || confirming}
                      onChange={(e) =>
                        handleFieldChange(idx, "nombreEnPrenda", e.target.value)
                      }
                    />
                  </div>
                </div>
              );
            })}

            {!isConfirmed && (
              <div className={styles.actionsContainer}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={saving || confirming}
                >
                  {saving ? "Guardando..." : "Guardar mis datos"}
                </button>

                {estado === "REGISTRADO" && (
                  <button
                    type="button"
                    className={styles.confirmButton}
                    onClick={handleConfirmar}
                    disabled={saving || confirming}
                  >
                    {confirming
                      ? "Confirmando..."
                      : "Confirmar datos definitivamente"}
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </main>

      <footer className={styles.footerNote}>
        Sublitex — Sistema de Gestión Textil Industrial
      </footer>
    </div>
  );
}
