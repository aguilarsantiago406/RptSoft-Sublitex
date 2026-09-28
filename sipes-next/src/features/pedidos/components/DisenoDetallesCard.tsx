import { formatDateTime } from "@/lib/format/date";
import type { DisenoItem } from "../types/diseno";

interface DisenoDetallesCardProps {
  diseno: DisenoItem;
  onQuitarArchivo?: () => void;
  isPending?: boolean;
}

export function DisenoDetallesCard({ diseno, onQuitarArchivo, isPending }: DisenoDetallesCardProps) {
  return (
    <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      <strong style={{ display: "block", fontSize: "0.86rem", color: "var(--navy)", marginBottom: "4px" }}>
        Detalles del diseño (v{diseno.version}):
      </strong>
      <div style={{ fontSize: "0.82rem", color: "#475569", display: "grid", gap: "6px" }}>
        <div suppressHydrationWarning><strong>Registrado:</strong> {formatDateTime(diseno.creadoEn)}</div>
        {diseno.archivoUrl ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
            <div>
              <strong>Archivo Vectorial:</strong>{" "}
              <a href={diseno.archivoUrl} target="_blank" rel="noreferrer" style={{ color: "#0284c7" }}>
                Descargar archivo (.ai / .pdf) ↗
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
          <div style={{ color: "#94a3b8" }}>Sin archivo vectorial adjunto</div>
        )}
        {diseno.aprobadoEn && (
          <div suppressHydrationWarning><strong>Aprobado el:</strong> {formatDateTime(diseno.aprobadoEn)}</div>
        )}
      </div>
    </div>
  );
}
