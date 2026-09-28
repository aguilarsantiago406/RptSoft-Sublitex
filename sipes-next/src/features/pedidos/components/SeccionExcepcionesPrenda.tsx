"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      {error && <div className={styles.modalErrorBanner} role="alert">{error}</div>}

      <div style={{ display: "grid", gap: "6px" }}>
        <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
          Excepciones Registradas ({excepciones.length})
        </span>

        {excepciones.length === 0 ? (
          <div style={{ padding: "10px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.8rem", color: "#64748b" }}>
            Esta prenda usa la confección estándar del grupo sin variaciones.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "6px" }}>
            {excepciones.map((exc) => (
              <div
                key={exc.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", background: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: "4px", marginRight: "8px" }}>
                    {exc.atributo?.nombre ?? "Atributo"}
                  </span>
                  <strong style={{ fontSize: "0.86rem", color: "var(--navy)" }}>{exc.valor?.etiqueta ?? "Valor"}</strong>
                  {exc.motivo && <span style={{ marginLeft: "8px", fontSize: "0.75rem", color: "#64748b" }}>· {exc.motivo}</span>}
                </div>
                <button
                  type="button" onClick={() => handleDelete(exc.id)} disabled={isPending || deletingId === exc.id}
                  style={{ background: "none", border: "none", color: "#ef4444", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
                >
                  {deletingId === exc.id ? "Eliminando..." : "Quitar"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleAdd} style={{ padding: "12px 14px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "10px", display: "grid", gap: "10px" }}>
        <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--navy)", textTransform: "uppercase" }}>
          + Agregar Cambio Técnico Respecto al Grupo
        </span>

        <div className={styles.twoColsLayout} style={{ gap: "10px" }}>
          <div className={styles.formField}>
            <label>Atributo</label>
            <select value={atributoId} onChange={(e) => handleAtributoChange(e.target.value)} className={styles.formInput}>
              {atributosCatalogo.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>

          <div className={styles.formField}>
            <label>Nuevo Valor</label>
            <select value={valorAtributoId} onChange={(e) => setValorAtributoId(e.target.value)} className={styles.formInput}>
              {currentAtributo?.valores.map((v) => <option key={v.id} value={v.id}>{v.etiqueta}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.formField}>
          <label>Motivo del cambio (obligatorio R-C04)</label>
          <input
            type="text" placeholder="Ej: Contextura delgada, pedido especial de cliente..."
            value={motivo} onChange={(e) => setMotivo(e.target.value)} className={styles.formInput}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" disabled={isPending || !motivo.trim()} className={styles.modalSubmitButton}>
            {isPending ? "Guardando..." : "+ Guardar Excepción"}
          </button>
        </div>
      </form>
    </div>
  );
}
