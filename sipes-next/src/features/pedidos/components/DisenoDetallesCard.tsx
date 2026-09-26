import type { DisenoItem } from "../types/diseno";

interface DisenoDetallesCardProps {
  diseno: DisenoItem;
}

export function DisenoDetallesCard({ diseno }: DisenoDetallesCardProps) {
  return (
    <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      <strong style={{ display: "block", fontSize: "0.86rem", color: "var(--navy)", marginBottom: "4px" }}>
        Detalles del diseño (v{diseno.version}):
      </strong>
      <div style={{ fontSize: "0.82rem", color: "#475569", display: "grid", gap: "6px" }}>
        <div><strong>Registrado:</strong> {new Date(diseno.creadoEn).toLocaleString()}</div>
        {diseno.archivoUrl && (
          <div>
            <strong>Archivo Vectorial:</strong>{" "}
            <a href={diseno.archivoUrl} target="_blank" rel="noreferrer" style={{ color: "#0284c7" }}>
              Descargar archivo (.ai / .pdf) ↗
            </a>
          </div>
        )}
        {diseno.aprobadoEn && (
          <div><strong>Aprobado el:</strong> {new Date(diseno.aprobadoEn).toLocaleString()}</div>
        )}
      </div>
    </div>
  );
}
