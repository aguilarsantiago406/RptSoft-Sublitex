"use client";

import { useState, useTransition } from "react";
import { DollarSign, Plus, Trash2, Calendar, CreditCard, CheckCircle2, AlertCircle, Paperclip, ExternalLink } from "lucide-react";
import type { PagoItem } from "../../api/comercial.api";
import { actionEliminarPago } from "../../actions/comercial.actions";
import { ModalRegistrarPago } from "./ModalRegistrarPago";
import { ModalConfirmacion } from "@/components/ui/ModalConfirmacion";
import styles from "./proforma.module.css";

interface TablaPagosHistoricosProps {
  pedidoId: string;
  pagos: PagoItem[];
  totalPedido: number;
  totalPagado: number;
  saldoPendiente: number;
}

export function TablaPagosHistoricos({
  pedidoId,
  pagos,
  totalPedido,
  totalPagado,
  saldoPendiente,
}: TablaPagosHistoricosProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagoAEliminar, setPagoAEliminar] = useState<PagoItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [, startTransition] = useTransition();

  const handleEliminar = () => {
    if (!pagoAEliminar) return;
    setIsDeleting(true);
    startTransition(async () => {
      await actionEliminarPago(pedidoId, pagoAEliminar.id);
      setIsDeleting(false);
      setPagoAEliminar(null);
    });
  };

  const getMedioBadge = (medio: string) => {
    switch (medio) {
      case "YAPE":
        return { label: "Yape", color: "#7c3aed", bg: "#f3e8ff" };
      case "PLIN":
        return { label: "Plin", color: "#0284c7", bg: "#e0f2fe" };
      case "TRANSFERENCIA":
        return { label: "Transferencia", color: "#0d9488", bg: "#ccfbf1" };
      case "EFECTIVO":
        return { label: "Efectivo", color: "#16a34a", bg: "#dcfce7" };
      default:
        return { label: medio, color: "#475569", bg: "#f1f5f9" };
    }
  };

  const porcentajePagado = totalPedido > 0
    ? Math.min(100, Math.round((totalPagado / totalPedido) * 100))
    : 0;

  return (
    <section className={styles.confirmacionesSection} style={{ marginBottom: "24px" }}>
      <div className={styles.confirmacionesHeader}>
        <div>
          <div className={styles.confirmacionesTitle} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <DollarSign size={18} color="#15803d" />
            <span>Gestión de Pagos y Abonos Parciales</span>
          </div>
          <div className={styles.confirmacionesSubtitle}>
            Historial de abonos registrados · Saldo calculado dinámicamente
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#15803d",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          <Plus size={16} />
          <span>+ Registrar Abono / Pago</span>
        </button>
      </div>

      {/* Tarjetas de Métricas Financieras */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "16px" }}>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Total Pedido</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#0f172a", marginTop: "2px" }}>
            S/ {totalPedido.toFixed(2)}
          </div>
        </div>

        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#166534", textTransform: "uppercase" }}>Total Pagado ({porcentajePagado}%)</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#15803d", marginTop: "2px" }}>
            S/ {totalPagado.toFixed(2)}
          </div>
        </div>

        <div style={{ background: saldoPendiente > 0 ? "#fef2f2" : "#f0fdf4", border: `1px solid ${saldoPendiente > 0 ? "#fecaca" : "#bbf7d0"}`, borderRadius: "8px", padding: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: saldoPendiente > 0 ? "#991b1b" : "#166534", textTransform: "uppercase" }}>
            Saldo Pendiente
          </div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: saldoPendiente > 0 ? "#dc2626" : "#15803d", marginTop: "2px" }}>
            S/ {saldoPendiente.toFixed(2)}
          </div>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Estado de Liquidación</div>
          <div style={{ marginTop: "4px" }}>
            {saldoPendiente <= 0 && totalPagado > 0 ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#15803d", fontWeight: "600", fontSize: "12px" }}>
                <CheckCircle2 size={14} /> 100% CANCELADO
              </span>
            ) : totalPagado > 0 ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#b45309", fontWeight: "600", fontSize: "12px" }}>
                <AlertCircle size={14} /> PAGO PARCIAL
              </span>
            ) : (
              <span style={{ color: "#dc2626", fontWeight: "600", fontSize: "12px" }}>
                SIN ABONOS REGISTRADOS
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Pagos */}
      {pagos.length === 0 ? (
        <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "8px", padding: "20px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
          No hay pagos parciales registrados para este pedido. Pulsa <strong>&quot;+ Registrar Abono / Pago&quot;</strong> para registrar adelantos o cancelaciones.
        </div>
      ) : (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#475569" }}>
                <th style={{ padding: "10px 12px" }}>#</th>
                <th style={{ padding: "10px 12px" }}>Fecha</th>
                <th style={{ padding: "10px 12px" }}>Medio</th>
                <th style={{ padding: "10px 12px" }}>N° Operación / Referencia</th>
                <th style={{ padding: "10px 12px" }}>Comprobante</th>
                <th style={{ padding: "10px 12px" }}>Registrado por</th>
                <th style={{ padding: "10px 12px", textAlign: "right" }}>Monto</th>
                <th style={{ padding: "10px 12px", textAlign: "center", width: "48px" }}></th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p, index) => {
                const badge = getMedioBadge(p.medio);
                const fechaStr = new Date(p.fechaPago).toLocaleDateString("es-PE", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: "600" }}>{index + 1}</td>
                    <td style={{ padding: "10px 12px", color: "#334155" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={13} color="#64748b" />
                        {fechaStr}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", color: "#334155" }}>
                      <div>{p.numeroOperacion || "—"}</div>
                      {p.notas && <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{p.notas}</div>}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {p.comprobanteUrl ? (
                        <a
                          href={p.comprobanteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "#0284c7",
                            fontSize: "12px",
                            fontWeight: "500",
                            textDecoration: "none",
                          }}
                        >
                          <Paperclip size={13} />
                          <span>Ver voucher</span>
                          <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#64748b", fontSize: "12px" }}>
                      {p.registradoPor?.nombre || "Sistema"}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "700", color: "#15803d", fontSize: "14px" }}>
                      S/ {Number(p.monto).toFixed(2)}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => setPagoAEliminar(p)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "4px" }}
                        title="Eliminar este abono"
                        aria-label="Eliminar abono"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <ModalRegistrarPago
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          pedidoId={pedidoId}
          totalPedido={totalPedido}
          totalPagadoActual={totalPagado}
          saldoActual={saldoPendiente}
        />
      )}

      <ModalConfirmacion
        isOpen={Boolean(pagoAEliminar)}
        onClose={() => setPagoAEliminar(null)}
        onConfirm={handleEliminar}
        title="Eliminar Registro de Pago"
        description={
          pagoAEliminar
            ? `¿Confirmas que deseas eliminar el abono de S/ ${Number(pagoAEliminar.monto).toFixed(2)} (${pagoAEliminar.medio})? El saldo del pedido será recalculado automáticamente.`
            : ""
        }
        confirmText="Eliminar Pago"
        variant="danger"
        isPending={isDeleting}
      />
    </section>
  );
}
