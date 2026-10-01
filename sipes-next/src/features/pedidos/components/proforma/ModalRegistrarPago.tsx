"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { DollarSign, X, AlertCircle, Calendar, Hash, FileText } from "lucide-react";
import { useIsClient } from "@/lib/useIsClient";
import { actionRegistrarPago } from "../../actions/comercial.actions";
import styles from "./modalEmitirConfirmacion.module.css";

interface ModalRegistrarPagoProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: string;
  totalPedido: number;
  totalPagadoActual: number;
  saldoActual: number;
}

export function ModalRegistrarPago({
  isOpen,
  onClose,
  pedidoId,
  totalPedido,
  totalPagadoActual,
  saldoActual,
}: ModalRegistrarPagoProps) {
  const isClient = useIsClient();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [monto, setMonto] = useState<number | "">(saldoActual > 0 ? saldoActual : "");
  const [medio, setMedio] = useState<"YAPE" | "PLIN" | "TRANSFERENCIA" | "EFECTIVO">("TRANSFERENCIA");
  const [numeroOperacion, setNumeroOperacion] = useState("");
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split("T")[0]);
  const [notas, setNotas] = useState("");

  if (!isOpen || !isClient) return null;

  const montoNum = typeof monto === "number" ? monto : 0;
  const nuevoTotalPagado = Math.round((totalPagadoActual + montoNum) * 100) / 100;
  const nuevoSaldo = Math.max(0, Math.round((totalPedido - nuevoTotalPagado) * 100) / 100);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!monto || montoNum <= 0) {
      setErrorMsg("El monto a registrar debe ser mayor a S/ 0.");
      return;
    }

    startTransition(async () => {
      const res = await actionRegistrarPago(pedidoId, {
        monto: montoNum,
        medio,
        numeroOperacion: numeroOperacion.trim() || undefined,
        fechaPago: fechaPago ? new Date(fechaPago).toISOString() : undefined,
        notas: notas.trim() || undefined,
      });

      if (!res.ok) {
        setErrorMsg(res.error || "No se pudo registrar el pago.");
        return;
      }

      onClose();
    });
  }

  return createPortal(
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <div className={styles.iconWrapper}>
              <DollarSign size={20} color="#15803d" />
            </div>
            <div>
              <h2 className={styles.title}>Registrar Pago / Abono</h2>
              <p className={styles.subtitle}>
                Registra un abono histórico (Yape, Plin, Transferencia o Efectivo)
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isPending}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          {errorMsg && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Total Pedido</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#0f172a" }}>S/ {totalPedido.toFixed(2)}</div>
            </div>
            <div style={{ background: "#fef2f2", padding: "10px", borderRadius: "6px", border: "1px solid #fecaca" }}>
              <div style={{ fontSize: "11px", color: "#dc2626", textTransform: "uppercase" }}>Saldo Pendiente Actual</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#dc2626" }}>S/ {saldoActual.toFixed(2)}</div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="monto" className={styles.label}>
              Monto a Abonar (S/) *
            </label>
            <input
              id="monto"
              type="number"
              step="0.01"
              min="0.1"
              className={styles.input}
              value={monto}
              onChange={(e) => setMonto(e.target.value === "" ? "" : parseFloat(e.target.value))}
              disabled={isPending}
              required
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="medio" className={styles.label}>
              Medio de Pago *
            </label>
            <select
              id="medio"
              className={styles.input}
              value={medio}
              onChange={(e) => setMedio(e.target.value as any)}
              disabled={isPending}
            >
              <option value="TRANSFERENCIA">Transferencia Bancaria (BCP / BBVA / Interbank)</option>
              <option value="YAPE">Yape</option>
              <option value="PLIN">Plin</option>
              <option value="EFECTIVO">Efectivo / Caja</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className={styles.formGroup}>
              <label htmlFor="nroOperacion" className={styles.label}>
                <Hash size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                N° de Operación
              </label>
              <input
                id="nroOperacion"
                type="text"
                placeholder="Ej. 1829471"
                className={styles.input}
                value={numeroOperacion}
                onChange={(e) => setNumeroOperacion(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="fechaPago" className={styles.label}>
                <Calendar size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                Fecha del Pago
              </label>
              <input
                id="fechaPago"
                type="date"
                className={styles.input}
                value={fechaPago}
                onChange={(e) => setFechaPago(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notas" className={styles.label}>
              <FileText size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
              Notas u Observación
            </label>
            <input
              id="notas"
              type="text"
              placeholder="Ej. Constancia enviada por WhatsApp"
              className={styles.input}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", padding: "10px", marginTop: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span>Nuevo total pagado:</span>
              <strong style={{ color: "#15803d" }}>S/ {nuevoTotalPagado.toFixed(2)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "4px" }}>
              <span>Nuevo saldo pendiente:</span>
              <strong style={{ color: nuevoSaldo === 0 ? "#15803d" : "#dc2626" }}>
                S/ {nuevoSaldo.toFixed(2)} {nuevoSaldo === 0 && "· ¡100% CANCELADO!"}
              </strong>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isPending || !monto || montoNum <= 0}
            >
              {isPending ? "Registrando..." : "Guardar Pago"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
