"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DisenoItem, EstadoDiseno } from "../types/diseno";
import {
  actionProponerDiseno,
  actionAprobarDiseno,
  actionEliminarArchivoEnNube,
} from "../actions/disenos.actions";
import { ModalSubirDiseno } from "./ModalSubirDiseno";
import { ModalRechazarDiseno } from "./ModalRechazarDiseno";
import { ModalConfirmacion } from "@/components/ui/ModalConfirmacion";
import { DisenoHistorial } from "./DisenoHistorial";
import { DisenoDetallesCard } from "./DisenoDetallesCard";
import styles from "./pedidos.module.css";

interface PedidoDisenoProps {
  pedidoId: string;
  disenos: DisenoItem[];
}

const ESTADO_LABELS: Record<EstadoDiseno, { label: string; color: string; bg: string }> = {
  BORRADOR: { label: "En borrador / Elaboración", color: "#d97706", bg: "#fef3c7" },
  PROPUESTO: { label: "Propuesto para aprobación", color: "#2563eb", bg: "#dbeafe" },
  APROBADO: { label: "Aprobado (Bloque cerrado)", color: "#16a34a", bg: "#dcfce7" },
  RECHAZADO: { label: "Rechazado con observaciones", color: "#e11d48", bg: "#ffe4e6" },
};

export function PedidoDiseno({ pedidoId, disenos }: PedidoDisenoProps) {
  const router = useRouter();
  const [modalUploadOpen, setModalUploadOpen] = useState(false);
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
        {badgeInfo && (
          <span style={{ fontSize: "0.78rem", fontWeight: 650, padding: "4px 10px", borderRadius: "999px", color: badgeInfo.color, background: badgeInfo.bg }}>
            {badgeInfo.label}
          </span>
        )}
      </div>

      {errorMsg && (
        <div className={styles.groupActionError} role="alert">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} aria-label="Cerrar">✕</button>
        </div>
      )}

      {!disenoActivo ? (
        <div style={{ textAlign: "center", padding: "32px 16px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
          <p style={{ margin: "0 0 12px", color: "#64748b", fontSize: "0.92rem" }}>
            Este pedido todavía no tiene un mockup de diseño registrado.
          </p>
          <button
            type="button" className={styles.addGrupoButton}
            onClick={() => { setIsReemplazo(false); setModalUploadOpen(true); }}
          >
            + Subir Primer Mockup
          </button>
        </div>
      ) : (
        <div className={styles.twoColsLayout} style={{ gap: "20px", alignItems: "start" }}>
          <div>
            {disenoActivo.imagenUrl ? (
              <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0", background: "#ffffff" }}>
                <img
                  src={disenoActivo.imagenUrl} alt={`Mockup v${disenoActivo.version}`}
                  style={{ width: "100%", height: "auto", display: "block", maxHeight: "360px", objectFit: "contain" }}
                />
              </div>
            ) : (
              <div style={{ padding: "40px", background: "#f1f5f9", borderRadius: "12px", textAlign: "center", color: "#64748b" }}>
                Sin vista previa de imagen
              </div>
            )}
            <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
              <button
                type="button" className={styles.secondaryButton}
                onClick={() => { setIsReemplazo(true); setModalUploadOpen(true); }}
                disabled={isPending || disenoActivo.estado === "APROBADO"}
                title={disenoActivo.estado === "APROBADO" ? "No modificable en estado aprobado" : "Reemplazar archivos"}
              >
                Reemplazar archivos
              </button>
              <button
                type="button" className={styles.secondaryButton}
                onClick={() => { setIsReemplazo(false); setModalUploadOpen(true); }}
                disabled={isPending}
              >
                + Nueva versión (v{disenoActivo.version + 1})
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gap: "14px" }}>
            <DisenoDetallesCard
              diseno={disenoActivo}
              onQuitarArchivo={() => setConfirmAction("quitar")}
              isPending={isPending}
            />

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {disenoActivo.estado === "BORRADOR" && (
                <button
                  type="button" className={styles.advanceStateButton}
                  onClick={handleProponer} disabled={isPending}
                >
                  {isPending ? "Procesando..." : "Proponer al cliente"}
                </button>
              )}
              {disenoActivo.estado === "PROPUESTO" && (
                <>
                  <button
                    type="button" className={styles.advanceStateButton}
                    onClick={() => setConfirmAction("aprobar")} disabled={isPending}
                  >
                    {isPending ? "Aprobando..." : "✓ Aprobar diseño (Cierra bloque)"}
                  </button>
                  <button
                    type="button" className={styles.cancelStateButton}
                    onClick={() => setModalRechazoOpen(true)} disabled={isPending}
                  >
                    ✕ Rechazar con observaciones
                  </button>
                </>
              )}
            </div>

            <DisenoHistorial versiones={disenos} />
          </div>
        </div>
      )}

      <ModalSubirDiseno
        isOpen={modalUploadOpen} onClose={() => setModalUploadOpen(false)} pedidoId={pedidoId}
        disenoId={isReemplazo && disenoActivo ? disenoActivo.id : undefined}
        versionNumero={isReemplazo && disenoActivo ? disenoActivo.version : undefined}
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
