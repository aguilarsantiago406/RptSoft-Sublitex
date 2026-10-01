"use client";

import { useState, useRef, useTransition } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/lib/useIsClient";
import { Upload, AlertTriangle, CheckCircle, X, Download } from "lucide-react";
import type { GrupoPedido } from "@/features/pedidos/types/pedido";
import { actionCargaMasiva, type FilaCargaMasiva } from "../actions/carga-masiva.actions";
import styles from "./participantes.module.css";

interface ModalCargaMasivaProps {
  isOpen: boolean;
  onClose: () => void;
  grupos: GrupoPedido[];
  pedidoId: string;
}

const PLANTILLA_CSV = `nombre,apodo,numero,talla,tallaShort,genero,tipoPrenda
GARCIA LOPEZ Carlos,GARCIA,10,M,,HOMBRE,VENTA
RAMIREZ ANA,RAMI,7,S,,MUJER,VENTA
PEREZ JUAN,PEREZ,9,M,L,HOMBRE,VENTA`;

function parsearCSV(texto: string): FilaCargaMasiva[] {
  const lineas = texto.trim().split(/\r?\n/);
  if (lineas.length < 2) return [];
  const headers = lineas[0].split(",").map((h) => h.trim().toLowerCase());
  return lineas.slice(1).map((linea) => {
    const vals = linea.split(",").map((v) => v.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return {
      nombre: obj["nombre"] || "",
      apodo: obj["apodo"] || undefined,
      numero: obj["numero"] || undefined,
      talla: obj["talla"] || undefined,
      tallaShort: obj["tallashort"] || obj["talla_short"] || undefined,
      genero: obj["genero"] || undefined,
      tipoPrenda: obj["tipoprenda"] || obj["tipo_prenda"] || undefined,
      esArquero: obj["esarquero"] === "true" || obj["esarquero"] === "1",
    };
  }).filter((f) => f.nombre.trim());
}

export function ModalCargaMasiva({ isOpen, onClose, grupos, pedidoId }: ModalCargaMasivaProps) {
  const isClient = useIsClient();
  const [grupoId, setGrupoId] = useState(grupos[0]?.id ?? "");
  const [filas, setFilas] = useState<FilaCargaMasiva[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ creados: number; errores: { fila: number; error: string }[] } | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !isClient) return null;

  function handleArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(null);
    setResultado(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const texto = ev.target?.result as string;
      const parsed = parsearCSV(texto);
      if (!parsed.length) {
        setParseError("No se encontraron filas válidas. Revisa que el CSV tenga encabezados y datos.");
      } else {
        setFilas(parsed);
      }
    };
    reader.readAsText(file, "utf-8");
  }

  function handleEnviar() {
    if (!grupoId || !filas.length) return;
    startTransition(async () => {
      const res = await actionCargaMasiva(grupoId, pedidoId, filas);
      if (res.ok) {
        setResultado({ creados: res.creados ?? 0, errores: res.errores ?? [] });
        setFilas([]);
        if (fileRef.current) fileRef.current.value = "";
      } else {
        setParseError(res.error ?? "Error al procesar la carga.");
      }
    });
  }

  function handleDescargarPlantilla() {
    const blob = new Blob([PLANTILLA_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_carga_masiva.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCerrar() {
    setFilas([]);
    setParseError(null);
    setResultado(null);
    if (fileRef.current) fileRef.current.value = "";
    onClose();
  }

  return createPortal(
    <div className={styles.modalBackdrop} onClick={handleCerrar}>
      <div
        className={styles.modalCardWide}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 560 }}
      >
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Carga Masiva de Participantes</h3>
            <p className={styles.modalSubtitle}>Sube un CSV con toda la lista sin esperar que cada persona llene su portal</p>
          </div>
          <button type="button" className={styles.modalCloseButton} onClick={handleCerrar} aria-label="Cerrar">✕</button>
        </div>

        <div style={{ padding: "16px 20px", display: "grid", gap: "16px" }}>
          {/* Selector de grupo */}
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
              Grupo de destino
            </label>
            <select
              value={grupoId}
              onChange={(e) => setGrupoId(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: "0.85rem" }}
            >
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>{g.nombre}</option>
              ))}
            </select>
          </div>

          {/* Zona de subida */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>
                Archivo CSV
              </label>
              <button
                type="button"
                onClick={handleDescargarPlantilla}
                style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "#0284c7", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                <Download size={12} /> Descargar plantilla
              </button>
            </div>
            <label
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                border: "2px dashed #cbd5e1", borderRadius: 8, padding: "20px 16px",
                cursor: "pointer", background: "#f8fafc", transition: "border-color 0.15s",
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <Upload size={24} color="#94a3b8" />
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                {filas.length > 0
                  ? <strong style={{ color: "#0284c7" }}>{filas.length} filas listas para importar</strong>
                  : "Arrastra un CSV o haz clic para seleccionar"}
              </span>
              <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                Columnas: nombre, apodo, numero, talla, tallaShort, genero, tipoPrenda
              </span>
              <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleArchivo} style={{ display: "none" }} />
            </label>
          </div>

          {/* Preview de filas */}
          {filas.length > 0 && (
            <div style={{ maxHeight: 160, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 6 }}>
              <table style={{ width: "100%", fontSize: "0.75rem", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f1f5f9", position: "sticky", top: 0 }}>
                  <tr>
                    {["#", "Nombre", "Apodo", "N.°", "Talla", "Short"].map((h) => (
                      <th key={h} style={{ padding: "4px 8px", textAlign: "left", fontWeight: 600, color: "#475569" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filas.map((f, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "3px 8px", color: "#94a3b8" }}>{i + 1}</td>
                      <td style={{ padding: "3px 8px", fontWeight: 600 }}>{f.nombre}</td>
                      <td style={{ padding: "3px 8px", color: "#64748b" }}>{f.apodo || "—"}</td>
                      <td style={{ padding: "3px 8px" }}>{f.numero || "—"}</td>
                      <td style={{ padding: "3px 8px" }}>{f.talla || "—"}</td>
                      <td style={{ padding: "3px 8px", color: f.tallaShort ? "#b45309" : "#94a3b8" }}>
                        {f.tallaShort || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Error de parse */}
          {parseError && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, fontSize: "0.82rem", color: "#b91c1c" }}>
              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
              {parseError}
            </div>
          )}

          {/* Resultado exitoso */}
          {resultado && (
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 6, fontSize: "0.82rem", color: "#065f46" }}>
                <CheckCircle size={14} style={{ flexShrink: 0 }} />
                <strong>{resultado.creados} participantes creados</strong> correctamente.
              </div>
              {resultado.errores.length > 0 && (
                <div style={{ padding: "8px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, fontSize: "0.78rem", color: "#92400e" }}>
                  <strong>{resultado.errores.length} errores:</strong>
                  <ul style={{ margin: "4px 0 0 0", paddingLeft: 16 }}>
                    {resultado.errores.map((e) => (
                      <li key={e.fila}>Fila {e.fila}: {e.error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.modalFooter} style={{ padding: "12px 20px" }}>
          <button type="button" className={styles.modalCancelButton} onClick={handleCerrar} disabled={isPending}>
            {resultado ? "Cerrar" : "Cancelar"}
          </button>
          {!resultado && (
            <button
              type="button"
              className={styles.modalSubmitButton}
              onClick={handleEnviar}
              disabled={isPending || !filas.length || !grupoId}
            >
              {isPending ? "Importando..." : `Importar ${filas.length} participantes`}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
