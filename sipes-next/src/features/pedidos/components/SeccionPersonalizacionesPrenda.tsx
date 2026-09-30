"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { UbicacionPersonalizacionCatalogo } from "@/features/catalogos/types/catalogo";
import type { PrendaDetalle } from "../types/pedido";
import { actionCrearPersonalizacion, actionEliminarPersonalizacion } from "../actions/personalizaciones.actions";
import styles from "./pedidos.module.css";

interface SeccionPersonalizacionesPrendaProps {
  prendaId: string;
  pedidoId: string;
  personalizaciones?: PrendaDetalle["personalizaciones"];
  ubicaciones: UbicacionPersonalizacionCatalogo[];
}

export function SeccionPersonalizacionesPrenda({
  prendaId, pedidoId, personalizaciones = [], ubicaciones,
}: SeccionPersonalizacionesPrendaProps) {
  const router = useRouter();
  const [ubicacionId, setUbicacionId] = useState(ubicaciones[0]?.id ?? "");
  const [contenido, setContenido] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!ubicacionId) { setError("Selecciona la ubicación del estampado (R-F03)."); return; }
    if (!contenido.trim()) { setError("El texto del estampado no puede estar vacío (R-F04)."); return; }
    setError(null);
    startTransition(async () => {
      const res = await actionCrearPersonalizacion(pedidoId, { prendaId, ubicacionId, contenido: contenido.trim() });
      if (!res.ok) { setError(res.error || "No se pudo registrar la personalización."); return; }
      setContenido("");
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    startTransition(async () => {
      const res = await actionEliminarPersonalizacion(pedidoId, id);
      setDeletingId(null);
      if (!res.ok) setError(res.error || "No se pudo eliminar la personalización.");
      router.refresh();
    });
  }

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      {error && <div className={styles.modalErrorBanner} role="alert">{error}</div>}

      <div style={{ display: "grid", gap: "6px" }}>
        <span style={{ fontSize: "0.74rem", fontWeight: 400, color: "#475569", textTransform: "uppercase" }}>
          Estampados Registrados ({personalizaciones.length})
        </span>

        {personalizaciones.length === 0 ? (
          <div style={{ padding: "10px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.8rem", color: "#64748b", fontWeight: 400 }}>
            Esta prenda no tiene estampados especiales asignados.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "6px" }}>
            {personalizaciones.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 400, textTransform: "uppercase", background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: "4px", marginRight: "8px" }}>
                    {p.ubicacion?.etiqueta ?? "Ubicación"}
                  </span>
                  <span style={{ fontSize: "0.86rem", color: "var(--navy)", fontWeight: 400 }}>&ldquo;{p.contenido}&rdquo;</span>
                </div>
                <button
                  type="button" onClick={() => handleDelete(p.id)} disabled={isPending || deletingId === p.id}
                  style={{ background: "none", border: "none", color: "#ef4444", fontSize: "0.78rem", fontWeight: 400, cursor: "pointer" }}
                >
                  {deletingId === p.id ? "Eliminando..." : "Quitar"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleAdd} style={{ padding: "12px 14px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "10px", display: "grid", gap: "10px" }}>
        <span style={{ fontSize: "0.74rem", fontWeight: 400, color: "var(--navy)", textTransform: "uppercase" }}>
          + Agregar Nuevo Estampado
        </span>

        <div className={styles.twoColsLayout} style={{ gap: "10px" }}>
          <div className={styles.formField}>
            <label>Ubicación</label>
            <select value={ubicacionId} onChange={(e) => setUbicacionId(e.target.value)} className={styles.formInput}>
              {ubicaciones.map((u) => <option key={u.id} value={u.id}>{u.etiqueta}</option>)}
            </select>
          </div>

          <div className={styles.formField}>
            <label>Texto a estampar</label>
            <input
              type="text" placeholder="Ej: KALESSI, Sponsor..."
              value={contenido} onChange={(e) => setContenido(e.target.value)}
              className={styles.formInput}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" disabled={isPending || !contenido.trim()} className={styles.modalSubmitButton}>
            {isPending ? "Guardando..." : "+ Guardar Estampado"}
          </button>
        </div>
      </form>
    </div>
  );
}
