import Link from "next/link";
import { Palette, ExternalLink, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { DisenoItem, EstadoDiseno } from "../types/diseno";
import styles from "./pedidos.module.css";

interface PedidoDisenoCardProps {
  pedidoId: string;
  pedidoCodigo?: string;
  disenos: DisenoItem[];
}

const ESTADO_INFO: Record<EstadoDiseno, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  BORRADOR: { label: "En elaboración", color: "#d97706", bg: "#fef3c7", icon: Clock },
  PROPUESTO: { label: "Propuesto para aprobación", color: "#2563eb", bg: "#dbeafe", icon: Clock },
  APROBADO: { label: "Aprobado (Bloque cerrado)", color: "#16a34a", bg: "#dcfce7", icon: CheckCircle2 },
  RECHAZADO: { label: "Rechazado", color: "#e11d48", bg: "#ffe4e6", icon: AlertCircle },
};

export function PedidoDisenoCard({ pedidoId, pedidoCodigo, disenos }: PedidoDisenoCardProps) {
  const activo = disenos[0] ?? null;
  const info = activo ? ESTADO_INFO[activo.estado] : null;
  const Icon = info?.icon ?? Clock;
  const targetId = pedidoCodigo ?? pedidoId;

  return (
    <section className={styles.sectionBlock}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Palette size={18} color="var(--sky-dark)" />
            DISEÑO Y MOCKUP
          </h2>
          <p className={styles.sectionSubtitle}>
            Arte gráfico y previsualización textil aprobada por el cliente
          </p>
        </div>
        <Link
          href={`/pedidos/${targetId}/diseno`}
          className={styles.envioEditButton}
          style={{ textDecoration: "none" }}
        >
          {activo ? "Abrir Taller de Diseño →" : "+ Cargar primer mockup"}
        </Link>
      </div>

      {activo ? (
        <div style={{ display: "grid", gridTemplateColumns: activo.imagenUrl ? "140px 1fr" : "1fr", gap: "20px", alignItems: "center" }}>
          {activo.imagenUrl && (
            <div
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid var(--border)",
                background: "#000",
                position: "relative",
              }}
            >
              <img
                src={activo.imagenUrl}
                alt="Mockup activo"
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              />
            </div>
          )}

          <div style={{ display: "grid", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--navy)" }}>
                Versión activa (v{activo.version})
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: info?.color,
                  backgroundColor: info?.bg,
                }}
              >
                <Icon size={14} />
                {info?.label}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--muted)" }}>
              {activo.estado === "APROBADO"
                ? "Este diseño fue aprobado por el cliente y congeló el bloque de diseño para el taller."
                : activo.estado === "RECHAZADO"
                ? "El diseño fue rechazado con observaciones técnicas. Se debe generar y subir una nueva versión."
                : "El diseño se encuentra en revisión. Accedé al taller para subir nuevas versiones o aprobar el arte."}
            </p>

            {activo.aprobadoPorWhatsApp && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#dcfce7",
                  border: "1px solid #bbf7d0",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  color: "#15803d",
                  fontWeight: 650,
                  width: "fit-content",
                }}
              >
                <CheckCircle2 size={13} />
                Diseño: Según modelo aprobado por WhatsApp
              </div>
            )}

            {activo.estado === "RECHAZADO" && activo.motivoRechazo && (
              <div
                style={{
                  background: "#fff1f2",
                  border: "1px solid #fecdd3",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "0.82rem",
                  color: "#9f1239",
                }}
              >
                <strong>Observación técnica:</strong> {activo.motivoRechazo}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
              {activo.archivoUrl && (
                <a
                  href={activo.archivoUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "var(--sky-dark)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink size={14} />
                  Descargar arte (.cdr / .zip / .pdf)
                </a>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: "20px", textAlign: "center", background: "#f8fafc", borderRadius: "12px", border: "1px dashed var(--border)" }}>
          <Palette size={28} color="#94a3b8" style={{ margin: "0 auto 8px" }} />
          <p style={{ margin: 0, fontWeight: 600, fontSize: "0.88rem", color: "var(--navy)" }}>
            Aún no se ha cargado el mockup gráfico
          </p>
          <p style={{ margin: "4px 0 12px", fontSize: "0.8rem", color: "var(--muted)" }}>
            El diseñador asignado debe subir el arte y el mockup en el taller de diseño antes de enviar a producción.
          </p>
          <Link href={`/pedidos/${targetId}/diseno`} className={styles.linkButton} style={{ textDecoration: "none" }}>
            Ir al Taller de Diseño para subir arte
          </Link>
        </div>
      )}
    </section>
  );
}
