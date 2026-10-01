"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/format/date";
import type { DisenoItem, EstadoDiseno } from "../types/diseno";
import { Download, ExternalLink, FileCode2, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface DisenoHistorialProps {
  versiones: DisenoItem[];
}

const ESTADO_CONFIG: Record<
  EstadoDiseno,
  { label: string; color: string; bg: string; border: string; icon: typeof Clock }
> = {
  BORRADOR: {
    label: "Borrador",
    color: "#b45309",
    bg: "#fef3c7",
    border: "#fde68a",
    icon: Clock,
  },
  PROPUESTO: {
    label: "Propuesto",
    color: "#1d4ed8",
    bg: "#dbeafe",
    border: "#bfdbfe",
    icon: Clock,
  },
  APROBADO: {
    label: "Aprobado",
    color: "#15803d",
    bg: "#dcfce7",
    border: "#bbf7d0",
    icon: CheckCircle2,
  },
  RECHAZADO: {
    label: "Rechazado",
    color: "#be123c",
    bg: "#ffe4e6",
    border: "#fecdd3",
    icon: AlertCircle,
  },
};

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

function obtenerExtensionEtiqueta(url: string): string {
  const nombre = extraerNombreArchivo(url).toLowerCase();
  if (nombre.endsWith(".cdr")) return "CorelDRAW (.cdr)";
  if (nombre.endsWith(".zip")) return "Comprimido (.zip)";
  if (nombre.endsWith(".ai")) return "Illustrator (.ai)";
  if (nombre.endsWith(".pdf")) return "Documento (.pdf)";
  if (nombre.endsWith(".tif") || nombre.endsWith(".tiff")) return "Tiff (.tif)";
  return "Archivo vectorial / taller";
}

export function DisenoHistorial({ versiones }: DisenoHistorialProps) {
  const [abierto, setAbierto] = useState(false);

  // Versiones anteriores a la activa (versiones[0] es la actual)
  const anteriores = versiones.slice(1);
  if (anteriores.length === 0) return null;

  return (
    <div
      style={{
        marginTop: "14px",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        style={{
          width: "100%",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#f8fafc",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          borderBottom: abierto ? "1px solid #e2e8f0" : "none",
        }}
      >
        <span style={{ fontSize: "0.86rem", fontWeight: 650, color: "#1e293b" }}>
          Historial de Versiones Anteriores ({anteriores.length})
        </span>
        <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>
          {abierto ? "Ocultar ▲" : "Ver historial ▼"}
        </span>
      </button>

      {abierto && (
        <div style={{ display: "grid", gap: "12px", padding: "14px" }}>
          {anteriores.map((v) => {
            const conf = ESTADO_CONFIG[v.estado] ?? ESTADO_CONFIG.BORRADOR;
            const Icon = conf.icon;
            const tieneObservacion = v.estado === "RECHAZADO" && Boolean(v.motivoRechazo);

            return (
              <div
                key={v.id}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border: `1px solid ${conf.border}`,
                  background: "#fafafa",
                  display: "grid",
                  gap: "10px",
                }}
              >
                {/* Cabecera de versión */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        color: "#0f172a",
                        background: "#e2e8f0",
                        padding: "2px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      v{v.version}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: "999px",
                        color: conf.color,
                        background: conf.bg,
                        border: `1px solid ${conf.border}`,
                      }}
                    >
                      <Icon size={12} />
                      {conf.label}
                    </span>
                  </div>

                  <span
                    suppressHydrationWarning
                    style={{ fontSize: "0.78rem", color: "#64748b" }}
                  >
                    Registrado: {formatDateTime(v.creadoEn)}
                  </span>
                </div>

                {/* Contenido: Miniatura + Archivos */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: v.imagenUrl ? "80px 1fr" : "1fr",
                    gap: "12px",
                    alignItems: "center",
                  }}
                >
                  {v.imagenUrl && (
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid #cbd5e1",
                        background: "#f1f5f9",
                        flexShrink: 0,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={v.imagenUrl}
                        alt={`Miniatura v${v.version}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          display: "block",
                        }}
                      />
                    </div>
                  )}

                  <div style={{ display: "grid", gap: "6px", fontSize: "0.82rem" }}>
                    {v.imagenUrl && (
                      <div>
                        <a
                          href={v.imagenUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#0284c7",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontWeight: 500,
                          }}
                        >
                          <ExternalLink size={13} />
                          Ver imagen completa v{v.version}
                        </a>
                      </div>
                    )}

                    {v.archivoUrl ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <FileCode2 size={14} color="#64748b" />
                        <span style={{ color: "#475569" }}>
                          {obtenerExtensionEtiqueta(v.archivoUrl)}:
                        </span>
                        <a
                          href={v.archivoUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#0284c7",
                            textDecoration: "none",
                            fontWeight: 600,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Download size={13} />
                          Descargar ({extraerNombreArchivo(v.archivoUrl)})
                        </a>
                      </div>
                    ) : (
                      <span style={{ color: "#94a3b8" }}>Sin archivo .cdr/.zip adjunto</span>
                    )}
                  </div>
                </div>

                {/* Motivo de rechazo / Observación técnica */}
                {tieneObservacion && (
                  <div
                    style={{
                      background: "#fff1f2",
                      border: "1px solid #fecdd3",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "0.8rem",
                      color: "#9f1239",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                      <AlertCircle size={14} color="#e11d48" />
                      <span>Motivo de rechazo / Corrección solicitada:</span>
                    </div>
                    <p style={{ margin: "4px 0 0", color: "#881337", whiteSpace: "pre-wrap" }}>
                      {v.motivoRechazo}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
