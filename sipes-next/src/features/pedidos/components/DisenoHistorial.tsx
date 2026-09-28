import { formatDate } from "@/lib/format/date";
import type { DisenoItem } from "../types/diseno";

interface DisenoHistorialProps {
  versiones: DisenoItem[];
}

export function DisenoHistorial({ versiones }: DisenoHistorialProps) {
  if (versiones.length <= 1) return null;

  return (
    <details style={{ fontSize: "0.8rem", color: "#64748b" }}>
      <summary style={{ cursor: "pointer", fontWeight: 600 }}>
        Ver historial de versiones anteriores ({versiones.length - 1})
      </summary>
      <div style={{ display: "grid", gap: "6px", marginTop: "8px" }}>
        {versiones.slice(1).map((v) => (
          <div
            key={v.id}
            style={{
              padding: "6px 10px",
              background: "#f8fafc",
              borderRadius: "6px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>v{v.version} · {v.estado}</span>
            <span suppressHydrationWarning>{formatDate(v.creadoEn)}</span>
          </div>
        ))}
      </div>
    </details>
  );
}
