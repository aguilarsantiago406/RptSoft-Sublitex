"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, FileText, X, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import type { TipoComprobante } from "../../api/comercial.api";
import { actionEmitirConfirmacion } from "../../actions/comercial.actions";
import styles from "./modalEmitirConfirmacion.module.css";

interface ModalEmitirConfirmacionProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: string;
  pedidoCodigo: string;
  basePrendas: number;
  recargoTallasInicial?: number;
}

export function ModalEmitirConfirmacion({
  isOpen,
  onClose,
  pedidoId,
  pedidoCodigo,
  basePrendas,
  recargoTallasInicial = 0,
}: ModalEmitirConfirmacionProps) {
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [adelantoRecibido, setAdelantoRecibido] = useState<number>(0);
  const [comprobante, setComprobante] = useState<TipoComprobante>("BOLETA");
  const [showExtras, setShowExtras] = useState(false);

  const [recargoTallas, setRecargoTallas] = useState<number>(recargoTallasInicial);
  const [recargoTelas, setRecargoTelas] = useState<number>(0);
  const [recargoCuellos, setRecargoCuellos] = useState<number>(0);
  const [recargoAcabados, setRecargoAcabados] = useState<number>(0);
  const [adicionales, setAdicionales] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const totalEstimado = basePrendas + recargoTallasInicial;
      const sugerido = Math.round(totalEstimado * 0.5 * 100) / 100;
      setAdelantoRecibido(sugerido);
      setErrorMsg(null);
      setShowExtras(false);
      setRecargoTallas(recargoTallasInicial);
      setRecargoTelas(0);
      setRecargoCuellos(0);
      setRecargoAcabados(0);
      setAdicionales(0);
    }
  }, [isOpen, basePrendas, recargoTallasInicial]);

  if (!isOpen || !mounted) return null;

  const totalExtras = recargoTallas + recargoTelas + recargoCuellos + recargoAcabados + adicionales;
  const baseSinIgv = basePrendas + totalExtras;
  const igvCalculado = comprobante === "FACTURA" ? Math.round(baseSinIgv * 0.18 * 100) / 100 : 0;
  const totalFinal = baseSinIgv + igvCalculado;
  const saldoPendiente = Math.max(0, Math.round((totalFinal - adelantoRecibido) * 100) / 100);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await actionEmitirConfirmacion(pedidoId, {
        adelantoRecibido,
        comprobante,
        recargoTallas: recargoTallas || undefined,
        recargoTelas: recargoTelas || undefined,
        recargoCuellos: recargoCuellos || undefined,
        recargoAcabados: recargoAcabados || undefined,
        adicionales: adicionales || undefined,
      });

      if (!res.ok) {
        setErrorMsg(res.error || "No se pudo emitir la confirmación.");
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
              <FileText size={20} color="var(--sky-dark)" />
            </div>
            <div>
              <h2 className={styles.title}>Emitir Confirmación Comercial</h2>
              <p className={styles.subtitle}>
                Pedido {pedidoCodigo} · Genera el contrato formal inmutable y el PDF oficial.
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

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="adelanto" className={styles.label}>
                Adelanto recibido (S/):
              </label>
              <input
                id="adelanto"
                type="number"
                step="0.01"
                min="0"
                className={styles.input}
                value={adelantoRecibido}
                onChange={(e) => setAdelantoRecibido(parseFloat(e.target.value) || 0)}
                required
                disabled={isPending}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="comprobante" className={styles.label}>
                Tipo de Comprobante:
              </label>
              <select
                id="comprobante"
                className={styles.select}
                value={comprobante}
                onChange={(e) => setComprobante(e.target.value as TipoComprobante)}
                disabled={isPending}
              >
                <option value="BOLETA">Boleta de Venta</option>
                <option value="FACTURA">Factura (+18% IGV)</option>
                <option value="NOTA_VENTA">Nota de Venta</option>
                <option value="NINGUNO">Ninguno</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="button"
              className={styles.accordionBtn}
              onClick={() => setShowExtras(!showExtras)}
            >
              {showExtras ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showExtras ? "Ocultar recargos adicionales" : "Agregar recargos adicionales (tallas, telas, cuellos...)"}
            </button>

            {showExtras && (
              <div className={styles.extraGrid} style={{ marginTop: "10px" }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Recargo tallas (S/):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.input}
                    value={recargoTallas || ""}
                    onChange={(e) => setRecargoTallas(parseFloat(e.target.value) || 0)}
                    disabled={isPending}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Recargo telas (S/):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.input}
                    value={recargoTelas || ""}
                    onChange={(e) => setRecargoTelas(parseFloat(e.target.value) || 0)}
                    disabled={isPending}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Recargo cuellos (S/):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.input}
                    value={recargoCuellos || ""}
                    onChange={(e) => setRecargoCuellos(parseFloat(e.target.value) || 0)}
                    disabled={isPending}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Recargo acabados (S/):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.input}
                    value={recargoAcabados || ""}
                    onChange={(e) => setRecargoAcabados(parseFloat(e.target.value) || 0)}
                    disabled={isPending}
                  />
                </div>
                <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
                  <label className={styles.label}>Otros adicionales (S/):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.input}
                    value={adicionales || ""}
                    onChange={(e) => setAdicionales(parseFloat(e.target.value) || 0)}
                    disabled={isPending}
                  />
                </div>
              </div>
            )}
          </div>

          <div className={styles.previewCard}>
            <div className={styles.previewRow}>
              <span>Base cotizada prendas:</span>
              <span>S/ {basePrendas.toFixed(2)}</span>
            </div>
            {totalExtras > 0 && (
              <div className={styles.previewRow}>
                <span>Recargos / Adicionales:</span>
                <span>+ S/ {totalExtras.toFixed(2)}</span>
              </div>
            )}
            {comprobante === "FACTURA" && (
              <div className={styles.previewRow}>
                <span>IGV (18% SUNAT):</span>
                <span>+ S/ {igvCalculado.toFixed(2)}</span>
              </div>
            )}
            <div className={styles.previewRowTotal}>
              <span>TOTAL DE LA ORDEN:</span>
              <span>S/ {totalFinal.toFixed(2)}</span>
            </div>
            <div className={styles.previewRow}>
              <span>Adelanto a registrar:</span>
              <span style={{ color: "#15803d", fontWeight: 600 }}>- S/ {adelantoRecibido.toFixed(2)}</span>
            </div>
            <div className={styles.previewRowSaldo}>
              <span>SALDO A LA ENTREGA:</span>
              <span>S/ {saldoPendiente.toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.footer}>
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
              className={styles.confirmBtn}
              disabled={isPending}
            >
              <CheckCircle2 size={16} />
              {isPending ? "Emitiendo PDF..." : "Confirmar y Generar PDF"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
