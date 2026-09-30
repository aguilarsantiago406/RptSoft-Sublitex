"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Trash2 } from "lucide-react";
import type { AtributoCatalogoItem } from "../api/pedidos.api";
import type { PrendaDetalle } from "../types/pedido";
import { actionCrearExcepcionPrenda, actionEliminarExcepcionPrenda } from "../actions/prendas.actions";
import styles from "./pedidos.module.css";

interface SeccionExcepcionesPrendaProps {
  prendaId: string;
  pedidoId: string;
  excepciones?: PrendaDetalle["excepciones"];
  atributosCatalogo: AtributoCatalogoItem[];
}

export function SeccionExcepcionesPrenda({
  prendaId, pedidoId, excepciones = [], atributosCatalogo,
}: SeccionExcepcionesPrendaProps) {
  const router = useRouter();
  const [atributoId, setAtributoId] = useState(atributosCatalogo[0]?.id ?? "");
  const currentAtributo = atributosCatalogo.find((a) => a.id === atributoId) ?? atributosCatalogo[0];
  const [valorAtributoId, setValorAtributoId] = useState(currentAtributo?.valores[0]?.id ?? "");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleAtributoChange(newId: string) {
    setAtributoId(newId);
    const at = atributosCatalogo.find((a) => a.id === newId);
    setValorAtributoId(at?.valores[0]?.id ?? "");
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!atributoId || !valorAtributoId) { setError("Selecciona el atributo y su valor."); return; }
    if (!motivo.trim()) { setError("El motivo de la excepción es obligatorio para el taller (Regla R-C04)."); return; }
    setError(null);
    startTransition(async () => {
      const res = await actionCrearExcepcionPrenda(pedidoId, { prendaId, atributoId, valorAtributoId, motivo: motivo.trim() });
      if (!res.ok) { setError(res.error || "No se pudo registrar la excepción."); return; }
      setMotivo("");
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    startTransition(async () => {
      const res = await actionEliminarExcepcionPrenda(pedidoId, id);
      setDeletingId(null);
      if (!res.ok) setError(res.error || "No se pudo eliminar la excepción.");
      router.refresh();
    });
  }

  const hayExcepciones = excepciones.length > 0;

  return (
    <div style={{ display: "grid", gap: "14px" }}>
      {error && <div className={styles.modalErrorBanner} role="alert">{error}</div>}

      <div style={{ display: "grid", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertCircle size={17} color={hayExcepciones ? "#d97706" : "#64748b"} />
            <span style={{ fontSize: "0.82rem", fontWeight: 400, color: hayExcepciones ? "#92400e" : "#334155", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Excepciones de Confección
            </span>
          </div>
          <span style={{
            fontSize: "0.75rem", fontWeight: 400, padding: "2px 8px", borderRadius: "12px",
            background: hayExcepciones ? "#fef3c7" : "#f1f5f9", color: hayExcepciones ? "#92400e" : "#64748b",
            border: hayExcepciones ? "1px solid #fde68a" : "1px solid #e2e8f0",
          }}>
            {excepciones.length} {excepciones.length === 1 ? "excepción registrada" : "excepciones registradas"}
          </span>
        </div>

        {!hayExcepciones ? (
          <div style={{ padding: "10px 14px", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "8px", fontSize: "0.8rem", color: "#64748b", fontWeight: 400 }}>
            Esta prenda usa la confección estándar del grupo sin variaciones.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "8px" }}>
            {excepciones.map((exc) => (
              <div
                key={exc.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", background: "#fffbeb", border: "1px solid #fcd34d",
                  borderLeft: "4px solid #f59e0b", borderRadius: "8px", boxShadow: "0 1px 3px rgba(245, 158, 11, 0.12)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: 400, textTransform: "uppercase",
                      background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "4px", border: "1px solid #fde68a",
                    }}>
                      {exc.atributo?.nombre ?? "Atributo"}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "#78350f", fontWeight: 400 }}>cambia a:</span>
                    <span style={{ fontSize: "0.92rem", fontWeight: 400, color: "#92400e" }}>
                      {exc.valor?.etiqueta ?? "Valor"}
                    </span>
                  </div>
                  {exc.motivo && (
                    <div style={{ fontSize: "0.76rem", color: "#b45309", fontWeight: 400 }}>Motivo: {exc.motivo}</div>
                  )}
                </div>
                <button
                  type="button" onClick={() => handleDelete(exc.id)} disabled={isPending || deletingId === exc.id}
                  style={{
                    background: "#ffffff", border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.76rem",
                    fontWeight: 400, padding: "4px 10px", borderRadius: "6px", cursor: "pointer", display: "flex",
                    alignItems: "center", gap: "4px",
                  }}
                  title="Eliminar excepción técnica"
                >
                  <Trash2 size={13} />
                  {deletingId === exc.id ? "..." : "Quitar"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleAdd} style={{ padding: "12px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", display: "grid", gap: "10px" }}>
        <span style={{ fontSize: "0.74rem", fontWeight: 400, color: "var(--navy)", textTransform: "uppercase" }}>
          + Agregar Cambio Técnico Respecto al Grupo
        </span>

        <div className={styles.twoColsLayout} style={{ gap: "10px" }}>
          <div className={styles.formField}>
            <label style={{ fontWeight: 400 }}>Atributo</label>
            <select value={atributoId} onChange={(e) => handleAtributoChange(e.target.value)} className={styles.formInput} style={{ fontWeight: 400 }}>
              {atributosCatalogo.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>

          <div className={styles.formField}>
            <label style={{ fontWeight: 400 }}>Nuevo Valor</label>
            <select value={valorAtributoId} onChange={(e) => setValorAtributoId(e.target.value)} className={styles.formInput} style={{ fontWeight: 400 }}>
              {currentAtributo?.valores.map((v) => <option key={v.id} value={v.id}>{v.etiqueta}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.formField}>
          <label style={{ fontWeight: 400 }}>Motivo del cambio (obligatorio R-C04)</label>
          <input
            type="text" placeholder="Ej: Contextura delgada, pedido especial de cliente..."
            value={motivo} onChange={(e) => setMotivo(e.target.value)}
            className={styles.formInput} style={{ fontWeight: 400 }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" disabled={isPending || !motivo.trim()} className={styles.modalSubmitButton} style={{ fontWeight: 400 }}>
            {isPending ? "Guardando..." : "+ Guardar Excepción"}
          </button>
        </div>
      </form>
    </div>
  );
}
