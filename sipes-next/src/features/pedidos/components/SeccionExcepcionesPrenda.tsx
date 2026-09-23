"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AtributoCatalogoItem } from "../api/pedidos.api";
import type { PrendaDetalle } from "../types/pedido";
import {
  actionCrearExcepcionPrenda,
  actionEliminarExcepcionPrenda,
} from "../actions/pedidos.actions";
import styles from "./prendas.module.css";

interface SeccionExcepcionesPrendaProps {
  prendaId: string;
  pedidoId: string;
  excepciones?: PrendaDetalle["excepciones"];
  atributosCatalogo: AtributoCatalogoItem[];
}

export function SeccionExcepcionesPrenda({
  prendaId,
  pedidoId,
  excepciones = [],
  atributosCatalogo,
}: SeccionExcepcionesPrendaProps) {
  const router = useRouter();
  const [atributoId, setAtributoId] = useState(atributosCatalogo[0]?.id ?? "");
  const currentAtributo = atributosCatalogo.find((a) => a.id === atributoId) ?? atributosCatalogo[0];
  const [valorAtributoId, setValorAtributoId] = useState(currentAtributo?.valores[0]?.id ?? "");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleAtributoChange(newAtributoId: string) {
    setAtributoId(newAtributoId);
    const at = atributosCatalogo.find((a) => a.id === newAtributoId);
    setValorAtributoId(at?.valores[0]?.id ?? "");
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!atributoId || !valorAtributoId) {
      setError("Selecciona el atributo y su valor.");
      return;
    }
    if (!motivo.trim()) {
      setError("El motivo de la excepción es obligatorio para el taller (Regla R-C04).");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await actionCrearExcepcionPrenda(pedidoId, {
        prendaId,
        atributoId,
        valorAtributoId,
        motivo: motivo.trim(),
      });

      if (!res.ok) {
        setError(res.error || "No se pudo registrar la excepción.");
        return;
      }

      setMotivo("");
      router.refresh();
    });
  }

  function handleDelete(excepcionId: string) {
    setDeletingId(excepcionId);
    setError(null);

    startTransition(async () => {
      const res = await actionEliminarExcepcionPrenda(pedidoId, excepcionId);
      setDeletingId(null);

      if (!res.ok) {
        setError(res.error || "No se pudo eliminar la excepción.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div style={{ marginTop: "10px", borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
          Excepciones de Taller (Deltas R-C01)
        </span>
        <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
          {excepciones?.length ?? 0} asignada(s)
        </span>
      </div>

      {error && (
        <div style={{ padding: "5px 8px", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "6px", color: "#be123c", fontSize: "0.72rem", marginBottom: "8px" }}>
          {error}
        </div>
      )}

      {/* Lista de excepciones actuales */}
      {excepciones && excepciones.length > 0 && (
        <div style={{ display: "grid", gap: "4px", marginBottom: "10px" }}>
          {excepciones.map((exc) => (
            <div
              key={exc.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 8px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "0.75rem",
              }}
            >
              <div>
                <strong style={{ color: "var(--navy)" }}>{exc.atributo?.nombre ?? "Atributo"}:</strong>{" "}
                <span style={{ color: "#0284c7", fontWeight: 600 }}>{exc.valor?.etiqueta ?? "Valor"}</span>
                {exc.motivo && (
                  <span style={{ color: "#64748b", marginLeft: "6px", fontSize: "0.72rem" }}>
                    · {exc.motivo}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(exc.id)}
                disabled={isPending || deletingId === exc.id}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                  fontWeight: 700,
                  padding: "1px 4px",
                  fontSize: "0.8rem",
                  lineHeight: 1,
                }}
                title="Eliminar excepción y volver a la norma del grupo"
              >
                {deletingId === exc.id ? "..." : "✕"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulario para agregar una nueva excepción */}
      <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
          + Agregar cambio técnico respecto al grupo
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "6px" }}>
          <select
            value={atributoId}
            onChange={(e) => handleAtributoChange(e.target.value)}
            style={{ padding: "5px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.78rem", background: "#ffffff", color: "var(--navy)" }}
          >
            {atributosCatalogo.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>

          <select
            value={valorAtributoId}
            onChange={(e) => setValorAtributoId(e.target.value)}
            style={{ padding: "5px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.78rem", background: "#ffffff", color: "var(--navy)" }}
          >
            {currentAtributo?.valores.map((v) => (
              <option key={v.id} value={v.id}>
                {v.etiqueta}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          <input
            type="text"
            placeholder="Motivo (ej: Contextura delgada, clima frío...)"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            style={{ flex: 1, padding: "5px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.78rem", background: "#ffffff" }}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={isPending || !motivo.trim()}
            style={{
              padding: "5px 10px",
              background: isPending || !motivo.trim() ? "#94a3b8" : "#0284c7",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: isPending || !motivo.trim() ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
