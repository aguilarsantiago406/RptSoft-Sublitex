import { formatDateTime } from "@/lib/format/date";
import type { DisenoItem } from "../types/diseno";
import { Download, AlertCircle, CheckCircle2 } from "lucide-react";

interface DisenoDetallesCardProps {
  diseno: DisenoItem;
  onQuitarArchivo?: () => void;
  isPending?: boolean;
}

function extraerNombreArchivo(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const parts = pathname.split("/");
    const filename = parts[parts.length - 1] || "archivo";
    return decodeURIComponent(filename);
  } catch {
    const parts = url.split("/");
    return parts[parts.length - 1] || "archivo";
  }
}

function obtenerEtiquetaFormato(url: string): string {
  const nombre = extraerNombreArchivo(url).toLowerCase();
  if (nombre.endsWith(".cdr")) return "CorelDRAW (.cdr)";
  if (nombre.endsWith(".zip")) return "Comprimido (.zip)";
  if (nombre.endsWith(".ai")) return "Illustrator (.ai)";
  if (nombre.endsWith(".pdf")) return "PDF de producción (.pdf)";
  return "Arte vectorial (.cdr / .zip / .pdf)";
}

export function DisenoDetallesCard({ diseno, onQuitarArchivo, isPending }: DisenoDetallesCardProps) {
  const nombreArchivo = diseno.archivoUrl ? extraerNombreArchivo(diseno.archivoUrl) : null;
  const etiquetaFormato = diseno.archivoUrl ? obtenerEtiquetaFormato(diseno.archivoUrl) : null;

  return (
    <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      <strong style={{ display: "block", fontSize: "0.86rem", color: "var(--navy)", marginBottom: "4px" }}>
        Detalles del diseño (v{diseno.version}):
      </strong>
      <div style={{ fontSize: "0.82rem", color: "#475569", display: "grid", gap: "6px" }}>
        <div suppressHydrationWarning><strong>Registrado:</strong> {formatDateTime(diseno.creadoEn)}</div>

        {diseno.archivoUrl ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <strong>{etiquetaFormato}:</strong>{" "}
              <a
                href={diseno.archivoUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#0284c7",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  textDecoration: "none",
                }}
              >
                <Download size={13} />
                Descargar {nombreArchivo} ↗
              </a>
            </div>
            {diseno.estado === "BORRADOR" && onQuitarArchivo && (
              <button
                type="button"
                onClick={onQuitarArchivo}
                disabled={isPending}
                style={{ background: "none", border: "none", color: "#e11d48", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                title="Eliminar archivo vectorial de la nube"
              >
                Quitar archivo
              </button>
            )}
          </div>
        ) : (
          <div style={{ color: "#94a3b8" }}>Sin archivo .cdr / .zip vectorial adjunto</div>
        )}

        {diseno.aprobadoEn && (
          <div suppressHydrationWarning><strong>Aprobado el:</strong> {formatDateTime(diseno.aprobadoEn)}</div>
        )}

        {diseno.aprobadoPorWhatsApp && (
          <div
            style={{
              padding: "6px 10px",
              background: "#dcfce7",
              border: "1px solid #bbf7d0",
              borderRadius: "8px",
              color: "#15803d",
              fontWeight: 650,
              fontSize: "0.8rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              width: "fit-content",
            }}
          >
            <CheckCircle2 size={14} />
            Según modelo aprobado por WhatsApp
          </div>
        )}

        {diseno.rechazadoEn && (
          <div suppressHydrationWarning style={{ color: "#be123c" }}>
            <strong>Rechazado el:</strong> {formatDateTime(diseno.rechazadoEn)}
          </div>
        )}

        {diseno.motivoRechazo && (
          <div
            style={{
              marginTop: "4px",
              padding: "10px 12px",
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              borderRadius: "8px",
              color: "#9f1239",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 650 }}>
              <AlertCircle size={14} color="#e11d48" />
              <span>Observación técnica / Motivo de rechazo:</span>
            </div>
            <p style={{ margin: "4px 0 0", color: "#881337", whiteSpace: "pre-wrap", fontWeight: 500 }}>
              {diseno.motivoRechazo}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
