"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, MessageCircle, CheckCircle2, Zap } from "lucide-react";
import type { PedidoDetalle } from "../types/pedido";
import type { DisenoItem } from "../types/diseno";
import { ModalSubirDiseno } from "./ModalSubirDiseno";
import { actionAprobarDisenoPorWhatsApp } from "../actions/disenos.actions";
import styles from "./pedidos.module.css";

interface PedidoVistaPreviaProps {
  pedido: PedidoDetalle;
  disenos: DisenoItem[];
}

export function PedidoVistaPrevia({ pedido, disenos }: PedidoVistaPreviaProps) {
  const router = useRouter();
  const [modalUploadOpen, setModalUploadOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const disenoActivo = disenos.find((d) => d.estado === "APROBADO") ?? disenos[0] ?? null;
  const prendaBase = pedido.grupos[0]?.tipoProducto?.nombre ?? null;
  const estaAprobado = disenoActivo?.estado === "APROBADO";
  const aprobadoPorWhatsApp = disenoActivo?.aprobadoPorWhatsApp;

  function handleAprobarExistentePorWhatsApp() {
    if (!disenoActivo) return;
    setErrorMsg(null);
    startTransition(async () => {
      const res = await actionAprobarDisenoPorWhatsApp(disenoActivo.id, pedido.id);
      if (!res.ok) {
        setErrorMsg(res.error || "No se pudo marcar la aprobación por WhatsApp.");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <section className={`${styles.sectionBlock} ${styles.sectionBlockCompacta}`}>
      <div className={styles.sectionHeaderRow}>
        <div className={styles.sectionTitleRow}>
          <span className={styles.cardIcon}>
            <Eye size={16} />
          </span>
          <h2 className={styles.sectionTitle}>Vista previa y diseño</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {!estaAprobado && (
            <button
              type="button"
              onClick={() => setModalUploadOpen(true)}
              disabled={isPending}
              style={{
                background: "#f0fdf4",
                border: "1px solid #86efac",
                color: "#15803d",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "0.76rem",
                fontWeight: 650,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
              title="Cargar captura o mockup directamente aprobado por WhatsApp"
            >
              <Zap size={12} color="#16a34a" />
              Aprobar por WhatsApp
            </button>
          )}

          <Link className={styles.cardActionGhost} href={`/pedidos/${pedido.codigo}/diseno`}>
            Abrir taller
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: "6px 10px", background: "#fef2f2", color: "#991b1b", fontSize: "0.78rem", borderRadius: "6px", marginBottom: "8px" }}>
          {errorMsg}
        </div>
      )}

      <div className={styles.mockupBody}>
        {disenoActivo?.imagenUrl || disenoActivo?.archivoUrl ? (
          <div className={styles.mockupPreview}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={disenoActivo.imagenUrl ?? disenoActivo.archivoUrl ?? ""}
              alt={`Mockup del diseño v${disenoActivo.version}`}
            />
            <span
              className={
                disenoActivo.estado === "APROBADO"
                  ? styles.mockupPreviewTagAprobado
                  : styles.mockupPreviewTag
              }
            >
              v{disenoActivo.version}
            </span>
          </div>
        ) : (
          <div className={styles.mockupPreviewEmpty}>Sin mockup cargado</div>
        )}

        <div className={styles.mockupSideInfo}>
          <div className={styles.mockupSideTitle}>
            {prendaBase ? `${prendaBase}${pedido.grupos[0] ? ` · ${pedido.grupos[0].nombre}` : ""}` : "Sin prenda base"}
          </div>

          {aprobadoPorWhatsApp ? (
            <div style={{ display: "grid", gap: "4px", marginTop: "2px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "#dcfce7",
                  border: "1px solid #bbf7d0",
                  color: "#15803d",
                  fontSize: "0.74rem",
                  fontWeight: 650,
                  padding: "2px 8px",
                  borderRadius: "999px",
                  width: "fit-content",
                }}
              >
                <CheckCircle2 size={12} />
                Aprobado por WhatsApp
              </span>
              <span style={{ fontSize: "0.79rem", color: "#166534", fontWeight: 600 }}>
                Diseño: Según modelo aprobado por WhatsApp
              </span>
            </div>
          ) : (
            <div className={styles.mockupSideDesc}>
              {disenoActivo
                ? `Versión ${disenoActivo.version} · ${disenoActivo.estado.toLowerCase()}`
                : "Todavía no hay versiones de diseño cargadas."}
            </div>
          )}

          {/* Si existe un diseño en borrador/propuesto/rechazado, permitir aprobación directa en 1 clic */}
          {disenoActivo && !estaAprobado && (
            <div style={{ marginTop: "6px" }}>
              <button
                type="button"
                onClick={handleAprobarExistentePorWhatsApp}
                disabled={isPending}
                style={{
                  background: "none",
                  border: "none",
                  color: "#15803d",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <MessageCircle size={12} />
                {isPending ? "Aprobando..." : "Marcar esta versión como aprobada por WhatsApp"}
              </button>
            </div>
          )}
        </div>
      </div>

      <ModalSubirDiseno
        isOpen={modalUploadOpen}
        onClose={() => setModalUploadOpen(false)}
        pedidoId={pedido.id}
        initialAprobadoPorWhatsApp={true}
        versionNumero={disenoActivo ? disenoActivo.version + 1 : 1}
      />
    </section>
  );
}
