"use client";

import { useState } from "react";
import { useIsClient } from "@/lib/useIsClient";
import type { GrupoPedido } from "@/features/pedidos/types/pedido";
import type { ParticipanteConPrendas } from "@/features/pedidos/api/pedidos.api";
import { actionCrearPrenda } from "@/features/pedidos/actions/prendas.actions";
import styles from "./participantes.module.css";

type TipoPrendaVal = "VENTA" | "OBSEQUIO" | "MUESTRA";

interface AgregarPrendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  participante: ParticipanteConPrendas | null;
  pedidoId: string;
  grupos: GrupoPedido[];
  tiposProducto?: Array<{ id: string; nombre: string; codigo: string }>;
  colores?: Array<{ id: string; nombre: string; codigoHex: string }>;
}

export function AgregarPrendaModal({
  isOpen,
  onClose,
  participante,
  pedidoId,
  grupos,
  tiposProducto = [],
  colores = [],
}: AgregarPrendaModalProps) {
  const isClient = useIsClient();
  const grupo = grupos.find((g) => g.id === participante?.grupoId);
  const defaultProdId = grupo?.tipoProducto?.id ?? tiposProducto[0]?.id ?? "";

  const [tipoProductoId, setTipoProductoId] = useState(defaultProdId);
  const [tipoPrenda, setTipoPrenda] = useState<TipoPrendaVal>("VENTA");
  const [esArquero, setEsArquero] = useState(false);
  const [colorId, setColorId] = useState(colores[0]?.id ?? "");
  const [numero, setNumero] = useState("");
  const [nombreEnPrenda, setNombreEnPrenda] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !participante || !isClient) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!participante || !tipoProductoId) return;
    setLoading(true);
    setError(null);

    const res = await actionCrearPrenda(pedidoId, {
      participanteId: participante.id,
      grupoId: participante.grupoId,
      tipoProductoId,
      tipoPrenda,
      esArquero,
      colorId: colorId || undefined,
      numero: numero.trim() || undefined,
      nombreEnPrenda: nombreEnPrenda.trim() || undefined,
    });
    setLoading(false);

    if (!res.ok) {
      setError(res.error ?? "No se pudo agregar la prenda.");
      return;
    }
    onClose();
  }

  const opcionesProd = tiposProducto.length > 0 ? tiposProducto : grupos.filter((g) => g.tipoProducto).map((g) => g.tipoProducto!);

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Agregar Prenda Extra</h2>
            <p className={styles.modalSubtitle}>Para <strong>{participante.nombrePersona}</strong> · Grupo: {grupo?.nombre ?? "Principal"}</p>
          </div>
          <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="tipoProd">Tipo de Producto</label>
            <select id="tipoProd" className={styles.formSelect} value={tipoProductoId} onChange={(e) => setTipoProductoId(e.target.value)} required>
              {opcionesProd.map((p) => (<option key={p.id} value={p.id}>{p.nombre}</option>))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="tipoPrenda">Tipo</label>
              <select id="tipoPrenda" className={styles.formSelect} value={tipoPrenda} onChange={(e) => setTipoPrenda(e.target.value as TipoPrendaVal)}>
                <option value="VENTA">Venta</option>
                <option value="OBSEQUIO">Obsequio</option>
                <option value="MUESTRA">Muestra</option>
              </select>
            </div>
            {colores.length > 0 && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="colorP">Color</label>
                <select id="colorP" className={styles.formSelect} value={colorId} onChange={(e) => setColorId(e.target.value)}>
                  {colores.map((c) => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
                </select>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="numP">Número</label>
              <input id="numP" type="text" className={styles.formInput} placeholder="Ej. 10 o S/N" value={numero} onChange={(e) => setNumero(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="apodoP">Apodo</label>
              <input id="apodoP" type="text" className={styles.formInput} placeholder="Ej. L. GÓMEZ" value={nombreEnPrenda} onChange={(e) => setNombreEnPrenda(e.target.value)} />
            </div>
          </div>

          <div style={{ margin: "8px 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <input id="arqCheck" type="checkbox" checked={esArquero} onChange={(e) => setEsArquero(e.target.checked)} style={{ cursor: "pointer", width: 16, height: 16 }} />
            <label htmlFor="arqCheck" style={{ fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>¿Es arquero?</label>
          </div>

          {error && <p style={{ color: "#b3261e", fontSize: "0.82rem", fontWeight: 700, margin: "8px 0" }}>{error}</p>}

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" className={styles.primaryButton} disabled={loading || !tipoProductoId}>
              {loading ? "Asignando…" : "Sumar Prenda"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
