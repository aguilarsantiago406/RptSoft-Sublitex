"use client";

import { useState, useTransition } from "react";
import { ClipboardList, Plus, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";
import type { BitacoraItem } from "../api/bitacora.api";
import { actionToggleAvisadoTaller, actionEliminarBitacora } from "../actions/bitacora.actions";
import { ModalRegistrarBitacora } from "./ModalRegistrarBitacora";
import styles from "./pedidos.module.css";

interface BitacoraCambiosProps {
  pedidoId: string;
  bitacoras: BitacoraItem[];
  userRole?: string;
}

export function BitacoraCambios({
  pedidoId,
  bitacoras,
  userRole,
}: BitacoraCambiosProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingBitacoraId, setLoadingBitacoraId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const esCoordinadorOAdmin =
    !userRole ||
    userRole === "ADMINISTRADOR" ||
    userRole === "COORDINADOR_OPERATIVO" ||
    userRole === "COORDINADOR_CLIENTE";

  const handleToggleAvisado = (item: BitacoraItem, nuevoValor: boolean) => {
    if (!esCoordinadorOAdmin) return;
    setErrorMsg(null);
    setLoadingBitacoraId(item.id);

    startTransition(async () => {
      const res = await actionToggleAvisadoTaller(pedidoId, item.id, nuevoValor);
      setLoadingBitacoraId(null);
      if (!res.ok) {
        setErrorMsg(res.error || "No se pudo actualizar el estado de aviso a taller.");
      }
    });
  };

  const handleEliminar = (bitacoraId: string) => {
    if (!esCoordinadorOAdmin) return;
    if (!window.confirm("¿Seguro que deseas eliminar este registro de la bitácora?")) return;
    setErrorMsg(null);
    setLoadingBitacoraId(bitacoraId);

    startTransition(async () => {
      const res = await actionEliminarBitacora(pedidoId, bitacoraId);
      setLoadingBitacoraId(null);
      if (!res.ok) {
        setErrorMsg(res.error || "No se pudo eliminar el registro.");
      }
    });
  };

  return (
    <section className={styles.sectionBlock}>
      <div className={styles.sectionHeaderRow}>
        <div className={styles.sectionTitleRow}>
          <span className={styles.cardIcon}>
            <ClipboardList size={16} />
          </span>
          <h2 className={styles.sectionTitle}>
            Bitácora de Modificaciones Post-Cierre
            {bitacoras.length > 0 && (
              <span
                style={{
                  marginLeft: "8px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  background: "#e2e8f0",
                  color: "#334155",
                  padding: "2px 8px",
                  borderRadius: "999px",
                }}
              >
                {bitacoras.length}
              </span>
            )}
          </h2>
        </div>

        <button
          type="button"
          className={styles.cardAction}
          onClick={() => setModalOpen(true)}
        >
          <Plus size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
          Registrar Modificación
        </button>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: "8px 12px",
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            borderRadius: "6px",
            fontSize: "0.82rem",
            marginBottom: "12px",
          }}
        >
          {errorMsg}
        </div>
      )}

      {bitacoras.length === 0 ? (
        <div className={styles.emptyNote}>
          <ClipboardList size={16} />
          <span>No hay modificaciones de último momento registradas para este pedido.</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {bitacoras.map((item) => {
            const fechaStr = new Date(item.fechaSolicitud).toLocaleString("es-PE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            const avisadoEnStr = item.avisadoEn
              ? new Date(item.avisadoEn).toLocaleString("es-PE", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;

            const isLoading = loadingBitacoraId === item.id;

            return (
              <div
                key={item.id}
                style={{
                  background: item.avisadoATaller ? "#f8fafc" : "#fffbeb",
                  border: `1px solid ${item.avisadoATaller ? "#e2e8f0" : "#fef08a"}`,
                  borderRadius: "8px",
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div style={{ flex: 1, minWidth: "260px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>
                      {fechaStr}
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        background: "#e2e8f0",
                        color: "#1e293b",
                        padding: "1px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      Solicitado por: {item.solicitadoPor}
                    </span>
                    {item.prenda && (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          background: "#dbeafe",
                          color: "#1e40af",
                          padding: "1px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        Prenda: {item.prenda.numero ? `#${item.prenda.numero}` : ""}{" "}
                        {item.prenda.nombreEnPrenda || ""}
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      margin: "0",
                      fontSize: "0.88rem",
                      color: "#0f172a",
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.descripcionCambio}
                  </p>

                  <div style={{ marginTop: "6px", fontSize: "0.75rem" }}>
                    {item.avisadoATaller ? (
                      <span style={{ color: "#166534", display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
                        <CheckCircle2 size={13} />
                        Avisado a taller
                        {avisadoEnStr && ` el ${avisadoEnStr}`}
                        {item.avisadoPor && ` por ${item.avisadoPor.nombre}`}
                      </span>
                    ) : (
                      <span style={{ color: "#b45309", display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
                        <AlertTriangle size={13} />
                        Pendiente de notificar a taller de producción
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  {/* Checkbox "¿Avisado a taller?" */}
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: esCoordinadorOAdmin && !isLoading ? "pointer" : "not-allowed",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      background: item.avisadoATaller ? "#dcfce7" : "#fef3c7",
                      border: `1px solid ${item.avisadoATaller ? "#86efac" : "#fde047"}`,
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: item.avisadoATaller ? "#14532d" : "#92400e",
                      userSelect: "none",
                    }}
                    title={
                      esCoordinadorOAdmin
                        ? "Haz clic para marcar o desmarcar el aviso a taller"
                        : "Solo el coordinador o administrador puede marcar el aviso a taller"
                    }
                  >
                    <input
                      type="checkbox"
                      checked={item.avisadoATaller}
                      disabled={!esCoordinadorOAdmin || isLoading}
                      onChange={(e) => handleToggleAvisado(item, e.target.checked)}
                      style={{
                        cursor: esCoordinadorOAdmin ? "pointer" : "not-allowed",
                        width: "16px",
                        height: "16px",
                        accentColor: "#16a34a",
                      }}
                    />
                    <span>¿Avisado a taller?</span>
                  </label>

                  {esCoordinadorOAdmin && (
                    <button
                      type="button"
                      onClick={() => handleEliminar(item.id)}
                      disabled={isLoading}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        padding: "4px",
                        borderRadius: "4px",
                      }}
                      title="Eliminar de bitácora"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <ModalRegistrarBitacora
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          pedidoId={pedidoId}
        />
      )}
    </section>
  );
}
