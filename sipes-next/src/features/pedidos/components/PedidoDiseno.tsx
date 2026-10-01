"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DisenoItem, EstadoDiseno } from "../types/diseno";
import {
  actionProponerDiseno,
  actionAprobarDiseno,
  actionAprobarDisenoPorWhatsApp,
  actionEliminarArchivoEnNube,
} from "../actions/disenos.actions";
import { ExternalLink, Sparkles, AlertTriangle, Upload, MessageCircle, CheckCircle2, Zap } from "lucide-react";
import { formatDateTime } from "@/lib/format/date";
import { ModalSubirDiseno } from "./ModalSubirDiseno";
import { ModalRechazarDiseno } from "./ModalRechazarDiseno";
import { ModalConfirmacion } from "@/components/ui/ModalConfirmacion";
import { DisenoHistorial } from "./DisenoHistorial";
import { DisenoDetallesCard } from "./DisenoDetallesCard";
import styles from "./pedidos.module.css";

interface PedidoDisenoProps {
  pedidoId: string;
  disenos: DisenoItem[];
  userRol?: string;
}

const ESTADO_LABELS: Record<EstadoDiseno, { label: string; color: string; bg: string }> = {
  BORRADOR: { label: "En borrador / Elaboración", color: "#d97706", bg: "#fef3c7" },
  PROPUESTO: { label: "Propuesto para aprobación", color: "#2563eb", bg: "#dbeafe" },
  APROBADO: { label: "Aprobado (Bloque cerrado)", color: "#16a34a", bg: "#dcfce7" },
  RECHAZADO: { label: "Rechazado con observaciones", color: "#e11d48", bg: "#ffe4e6" },
};

export function PedidoDiseno({ pedidoId, disenos, userRol }: PedidoDisenoProps) {
  const router = useRouter();

  // Roles que pueden gestionar/cargar propuestas gráficas (R-H02)
  const puedeGestionarDiseno =
    !userRol ||
    userRol === "ADMINISTRADOR" ||
    userRol === "DISENO" ||
    userRol === "COORDINADOR_OPERATIVO";

  // Roles que pueden aprobar o rechazar propuestas
  const puedeAprobarRechazar =
    !userRol ||
    userRol === "ADMINISTRADOR" ||
    userRol === "COORDINADOR_OPERATIVO" ||
    userRol === "COORDINADOR_CLIENTE" ||
    userRol === "DISENO";
  const [modalUploadOpen, setModalUploadOpen] = useState(false);
  const [modalWhatsAppOpen, setModalWhatsAppOpen] = useState(false);
  const [modalRechazoOpen, setModalRechazoOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"aprobar" | "quitar" | null>(null);
  const [isReemplazo, setIsReemplazo] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const disenoActivo = disenos[0] ?? null;

  function handleProponer() {
    if (!disenoActivo) return;
    setErrorMsg(null);
    startTransition(async () => {
      const res = await actionProponerDiseno(disenoActivo.id, pedidoId);
      if (!res.ok) setErrorMsg(res.error || "No se pudo proponer el diseño.");
      else router.refresh();
    });
  }

  function handleAprobarPorWhatsApp() {
    if (!disenoActivo) return;
    setErrorMsg(null);
    startTransition(async () => {
      const res = await actionAprobarDisenoPorWhatsApp(disenoActivo.id, pedidoId);
      if (!res.ok) setErrorMsg(res.error || "No se pudo aprobar el diseño por WhatsApp.");
      else router.refresh();
    });
  }

  function handleConfirmAction() {
    if (!disenoActivo || !confirmAction) return;
    setErrorMsg(null);
    const action = confirmAction;
    startTransition(async () => {
      if (action === "aprobar") {
        const res = await actionAprobarDiseno(disenoActivo.id, pedidoId);
        setConfirmAction(null);
        if (!res.ok) setErrorMsg(res.error || "No se pudo aprobar el diseño.");
        else router.refresh();
      } else {
        const parts = (disenoActivo.archivoUrl || "").split("/disenos/");
        if (parts.length > 1) await actionEliminarArchivoEnNube(`disenos/${parts[1]}`);
        setConfirmAction(null);
        router.refresh();
      }
    });
  }

  const badgeInfo = disenoActivo ? ESTADO_LABELS[disenoActivo.estado] : null;

  return (
    <section className={styles.sectionBlock}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitle}>Arte y Mockup Activo</h2>
          {disenoActivo && <p className={styles.sectionSubtitle}>Versión activa v{disenoActivo.version}</p>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {disenoActivo?.aprobadoPorWhatsApp && (
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 650,
                padding: "4px 10px",
                borderRadius: "999px",
                color: "#15803d",
                background: "#dcfce7",
                border: "1px solid #bbf7d0",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <CheckCircle2 size={13} />
              Según modelo aprobado por WhatsApp
            </span>
          )}
          {badgeInfo && (
            <span style={{ fontSize: "0.78rem", fontWeight: 650, padding: "4px 10px", borderRadius: "999px", color: badgeInfo.color, background: badgeInfo.bg }}>
              {badgeInfo.label}
            </span>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className={styles.groupActionError} role="alert">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} aria-label="Cerrar">✕</button>
        </div>
      )}

      {disenoActivo && disenoActivo.estado === "RECHAZADO" && (
        <div
          style={{
            background: "#fff1f2",
            border: "1px solid #fecdd3",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "18px",
            display: "grid",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#ffe4e6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: "#e11d48",
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <strong style={{ color: "#9f1239", fontSize: "0.98rem" }}>
                  Diseño Rechazado (Versión v{disenoActivo.version})
                </strong>
                {disenoActivo.rechazadoEn && (
                  <span
                    suppressHydrationWarning
                    style={{ fontSize: "0.78rem", color: "#be123c" }}
                  >
                    · {formatDateTime(disenoActivo.rechazadoEn)}
                  </span>
                )}
              </div>
              <div
                style={{
                  marginTop: "8px",
                  background: "#ffffff",
                  border: "1px solid #fecdd3",
                  borderRadius: "8px",
                  padding: "10px 14px",
                }}
              >
                <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "#9f1239", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Motivo de rechazo / Observación técnica para corregir:
                </div>
                <p style={{ margin: "4px 0 0", color: "#881337", fontSize: "0.92rem", fontWeight: 500, whiteSpace: "pre-wrap" }}>
                  {disenoActivo.motivoRechazo || "El cliente o coordinación devolvió el diseño con observaciones."}
                </p>
              </div>
            </div>
          </div>

          {puedeGestionarDiseno && (
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
              <button
                type="button"
                className={styles.advanceStateButton}
                onClick={() => {
                  setIsReemplazo(false);
                  setModalUploadOpen(true);
                }}
                disabled={isPending}
                style={{
                  background: "#0284c7",
                  borderColor: "#0284c7",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 18px",
                  fontSize: "0.88rem",
                  fontWeight: 650,
                }}
              >
                <Upload size={16} />
                Subir Nueva Versión (v{disenoActivo.version + 1})
              </button>
            </div>
          )}
        </div>
      )}

      {!disenoActivo ? (
        <div style={{ textAlign: "center", padding: "36px 20px", background: "#f8fafc", borderRadius: "14px", border: "1px dashed #cbd5e1" }}>
          {puedeGestionarDiseno ? (
            <>
              <p style={{ margin: "0 0 12px", color: "#64748b", fontSize: "0.92rem" }}>
                Este pedido todavía no tiene un mockup de diseño registrado.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginTop: "12px" }}>
                <button
                  type="button"
                  className={styles.addGrupoButton}
                  onClick={() => { setIsReemplazo(false); setModalWhatsAppOpen(false); setModalUploadOpen(true); }}
                >
                  + Cargar Propuesta Gráfica
                </button>
                <button
                  type="button"
                  onClick={() => { setIsReemplazo(false); setModalWhatsAppOpen(true); setModalUploadOpen(true); }}
                  style={{
                    background: "#16a34a",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "0.88rem",
                    fontWeight: 650,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Zap size={15} />
                  ⚡ Según modelo aprobado por WhatsApp
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Sparkles size={24} />
              </div>
              <h4 style={{ margin: "0 0 6px", fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>
                Propuesta gráfica en preparación
              </h4>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.84rem" }}>
                El equipo de diseño cargará aquí el mockup y arte oficial una vez asignada la orden.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className={styles.twoColsLayout} style={{ gap: "20px", alignItems: "start" }}>
          <div>
            {disenoActivo.imagenUrl ? (
              <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0", background: "#ffffff" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={disenoActivo.imagenUrl}
                  alt={`Mockup v${disenoActivo.version}`}
                  style={{ width: "100%", height: "auto", display: "block", maxHeight: "360px", objectFit: "contain" }}
                />
              </div>
            ) : (
              <div style={{ padding: "40px", background: "#f1f5f9", borderRadius: "12px", textAlign: "center", color: "#64748b" }}>
                Sin vista previa de imagen
              </div>
            )}
            <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
              {puedeGestionarDiseno && (
                <>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => { setIsReemplazo(true); setModalUploadOpen(true); }}
                    disabled={isPending || disenoActivo.estado === "APROBADO"}
                    title={disenoActivo.estado === "APROBADO" ? "No modificable en estado aprobado" : "Reemplazar archivos"}
                  >
                    Reemplazar archivos (v{disenoActivo.version})
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => { setIsReemplazo(false); setModalUploadOpen(true); }}
                    disabled={isPending}
                    style={{ fontWeight: 600, color: "#0369a1" }}
                  >
                    <Upload size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                    Subir Nueva Versión (v{disenoActivo.version + 1})
                  </button>
                </>
              )}
              {disenoActivo.imagenUrl && (
                <a
                  href={disenoActivo.imagenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.secondaryButton}
                  style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <ExternalLink size={13} />
                  Ver imagen completa
                </a>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gap: "14px" }}>
            <DisenoDetallesCard
              diseno={disenoActivo}
              onQuitarArchivo={() => setConfirmAction("quitar")}
              isPending={isPending}
            />

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {puedeGestionarDiseno && disenoActivo.estado === "BORRADOR" && (
                <button
                  type="button"
                  className={styles.advanceStateButton}
                  onClick={handleProponer}
                  disabled={isPending}
                >
                  {isPending ? "Procesando..." : "Proponer al cliente"}
                </button>
              )}
              {puedeAprobarRechazar && disenoActivo.estado === "PROPUESTO" && (
                <>
                  <button
                    type="button"
                    className={styles.advanceStateButton}
                    onClick={() => setConfirmAction("aprobar")}
                    disabled={isPending}
                  >
                    {isPending ? "Aprobando..." : "✓ Aprobar diseño (Cierra bloque)"}
                  </button>
                  <button
                    type="button"
                    className={styles.cancelStateButton}
                    onClick={() => setModalRechazoOpen(true)}
                    disabled={isPending}
                  >
                    ✕ Rechazar con observaciones
                  </button>
                </>
              )}
              {puedeGestionarDiseno && disenoActivo.estado === "RECHAZADO" && (
                <button
                  type="button"
                  className={styles.advanceStateButton}
                  onClick={() => {
                    setIsReemplazo(false);
                    setModalUploadOpen(true);
                  }}
                  disabled={isPending}
                  style={{
                    background: "#0284c7",
                    borderColor: "#0284c7",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Upload size={14} />
                  Subir Nueva Versión (v{disenoActivo.version + 1})
                </button>
              )}
              {puedeAprobarRechazar && disenoActivo.estado !== "APROBADO" && (
                <button
                  type="button"
                  onClick={handleAprobarPorWhatsApp}
                  disabled={isPending}
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #86efac",
                    color: "#15803d",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    fontSize: "0.85rem",
                    fontWeight: 650,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  title="Aprobar inmediatamente según modelo validado por chat de WhatsApp"
                >
                  <MessageCircle size={14} color="#16a34a" />
                  {isPending ? "Aprobando..." : "Marcar aprobado por WhatsApp"}
                </button>
              )}
            </div>

            <DisenoHistorial versiones={disenos} />
          </div>
        </div>
      )}

      <ModalSubirDiseno
        isOpen={modalUploadOpen}
        onClose={() => {
          setModalUploadOpen(false);
          setModalWhatsAppOpen(false);
        }}
        pedidoId={pedidoId}
        disenoId={isReemplazo && disenoActivo ? disenoActivo.id : undefined}
        versionNumero={isReemplazo && disenoActivo ? disenoActivo.version : ((disenoActivo?.version ?? 0) + 1)}
        initialAprobadoPorWhatsApp={modalWhatsAppOpen}
      />
      {disenoActivo && (
        <ModalRechazarDiseno isOpen={modalRechazoOpen} onClose={() => setModalRechazoOpen(false)} disenoId={disenoActivo.id} pedidoId={pedidoId} />
      )}
      <ModalConfirmacion
        isOpen={confirmAction !== null} onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
        title={confirmAction === "aprobar" ? "Aprobar Diseño Textil" : "Eliminar Archivo Vectorial"}
        description={confirmAction === "aprobar" ? "¿Confirmar aprobación del diseño? Cerrará el bloque de diseño para taller." : "¿Eliminar el archivo vectorial adjunto de la nube? Solo permitido en Borrador."}
        confirmText={confirmAction === "aprobar" ? "Aprobar y Cerrar Bloque" : "Eliminar Archivo"}
        variant={confirmAction === "aprobar" ? "primary" : "danger"} isPending={isPending}
      />
    </section>
  );
}
