"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useIsClient } from "@/lib/useIsClient";
import type { UbicacionPersonalizacionCatalogo } from "@/features/catalogos/types/catalogo";
import type { AtributoCatalogoItem } from "../api/pedidos.api";
import type { PrendaDetalle } from "../types/pedido";
import { actionActualizarPrenda } from "../actions/prendas.actions";
import { SeccionExcepcionesPrenda } from "./SeccionExcepcionesPrenda";
import { SeccionPersonalizacionesPrenda } from "./SeccionPersonalizacionesPrenda";
import { TablaConfiguracionGrupo } from "./TablaConfiguracionGrupo";
import styles from "./pedidos.module.css";

const GENEROS = [
  { val: "HOMBRE", label: "Hombre" }, { val: "MUJER", label: "Mujer" },
  { val: "NINO", label: "Niño" }, { val: "NINA", label: "Niña" },
  { val: "SIN_ESPECIFICAR", label: "Estándar" },
] as const;

type GeneroTipo = (typeof GENEROS)[number]["val"];

interface ModalEditarPrendaProps {
  isOpen: boolean;
  onClose: () => void;
  prenda: PrendaDetalle;
  pedidoId: string;
  tallasDisponibles: Array<{ id: string; codigo: string; etiqueta: string }>;
  atributosCatalogo: AtributoCatalogoItem[];
  coloresDisponibles?: Array<{ id: string; nombre: string; codigoHex: string }>;
  ubicacionesCatalogo?: UbicacionPersonalizacionCatalogo[];
}

export function ModalEditarPrenda({
  isOpen, onClose, prenda, pedidoId,
  tallasDisponibles, atributosCatalogo,
  coloresDisponibles = [], ubicacionesCatalogo = [],
}: ModalEditarPrendaProps) {
  const isClient = useIsClient();
  const router = useRouter();
  const [tab, setTab] = useState<"ficha" | "estampados" | "confeccion">("ficha");
  const [nombreEnPrenda, setNombreEnPrenda] = useState(prenda.nombreEnPrenda ?? "");
  const [numero, setNumero] = useState(prenda.numero ?? "");
  const [tallaId, setTallaId] = useState(prenda.tallaId ?? "");
  const [tallaShortId, setTallaShortId] = useState(prenda.tallaShortId ?? "");
  const [genero, setGenero] = useState<GeneroTipo>((prenda.genero as GeneroTipo) ?? "SIN_ESPECIFICAR");
  const [colorId, setColorId] = useState(prenda.colorId ?? "");
  const [tipoPrenda, setTipoPrenda] = useState<"VENTA" | "OBSEQUIO" | "MUESTRA">(
    (prenda.tipoPrenda as "VENTA" | "OBSEQUIO" | "MUESTRA") || "VENTA"
  );
  const [esArquero, setEsArquero] = useState<boolean>(Boolean(prenda.esArquero));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !isClient) return null;
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await actionActualizarPrenda(prenda.id, pedidoId, {
        nombreEnPrenda: nombreEnPrenda.trim() || undefined,
        numero: numero.trim() || undefined,
        tallaId: tallaId || undefined,
        tallaShortId: tallaShortId || null,
        genero,
        colorId: colorId || undefined,
        tipoPrenda,
        esArquero,
      });
      if (!res.ok) { setError(res.error || "No se pudo actualizar la prenda."); return; }
      onClose();
      router.refresh();
    });
  }

  const nombrePersona = prenda.participante?.nombrePersona || "Sin asignar";
  const grupoNombre = prenda.grupo?.nombre || "General";
  const numEstampados = prenda.personalizaciones?.length ?? 0;
  const numExcepciones = prenda.excepciones?.length ?? 0;

  const tabBtn = (t: "ficha" | "estampados" | "confeccion", label: string, count?: number) => (
    <button
      type="button" onClick={() => setTab(t)}
      style={{
        padding: "8px 14px", border: "none", background: "none", fontSize: "0.8rem",
        fontWeight: 400, color: tab === t ? "var(--navy)" : "#64748b",
        borderBottom: tab === t ? "2px solid #0284c7" : "2px solid transparent", cursor: "pointer",
      }}
    >
      {label}{count !== undefined ? ` (${count})` : ""}
    </button>
  );

  return createPortal(
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCardWide} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Editar Prenda</h3>
            <p className={styles.modalSubtitle}>{nombrePersona} · {grupoNombre}</p>
          </div>
          <button type="button" className={styles.modalCloseButton} onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid #e2e8f0", padding: "0 20px" }}>
          {tabBtn("ficha", "Ficha Base")}
          {tabBtn("estampados", "Estampados", numEstampados)}
          {tabBtn("confeccion", "Confección", numExcepciones)}
        </div>

        {error && <div className={styles.modalErrorBanner} role="alert">{error}</div>}

        {tab === "ficha" && (
          <form onSubmit={handleSubmit} className={styles.modalFormCompact} style={{ padding: "16px 20px" }}>
            <div className={styles.formField}>
              <label htmlFor="prenda-apodo">Apodo</label>
              <input id="prenda-apodo" type="text" placeholder="Ej: GONZALEZ" value={nombreEnPrenda} onChange={(e) => setNombreEnPrenda(e.target.value)} className={styles.formInput} autoFocus />
            </div>

            <div className={styles.twoColsLayout} style={{ gap: "10px" }}>
              <div className={styles.formField}>
                <label htmlFor="prenda-numero">Número</label>
                <input id="prenda-numero" type="text" placeholder="Ej: 10 o S/N" value={numero} onChange={(e) => setNumero(e.target.value)} className={styles.formInput} />
              </div>
              <div className={styles.formField}>
                <label htmlFor="prenda-talla">Talla Camiseta</label>
                <select id="prenda-talla" value={tallaId} onChange={(e) => setTallaId(e.target.value)} className={styles.formInput}>
                  <option value="">Sin especificar</option>
                  {tallasDisponibles.map((t) => <option key={t.id} value={t.id}>{t.etiqueta || t.codigo}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.formField}>
              <label htmlFor="prenda-talla-short">Talla Short <span style={{ color: "#94a3b8", fontWeight: 400 }}>(si difiere de la camiseta)</span></label>
              <select id="prenda-talla-short" value={tallaShortId} onChange={(e) => setTallaShortId(e.target.value)} className={styles.formInput}>
                <option value="">= Misma que la camiseta</option>
                {tallasDisponibles.map((t) => <option key={t.id} value={t.id}>{t.etiqueta || t.codigo}</option>)}
              </select>
            </div>


            <div className={styles.twoColsLayout} style={{ gap: "10px" }}>
              <div className={styles.formField}>
                <label htmlFor="prenda-genero">Género</label>
                <select id="prenda-genero" value={genero} onChange={(e) => setGenero(e.target.value as GeneroTipo)} className={styles.formInput}>
                  {GENEROS.map((g) => <option key={g.val} value={g.val}>{g.label}</option>)}
                </select>
              </div>
              <div className={styles.formField}>
                <label htmlFor="prenda-color">Color</label>
                <select id="prenda-color" value={colorId} onChange={(e) => setColorId(e.target.value)} className={styles.formInput}>
                  <option value="">Por defecto del grupo</option>
                  {coloresDisponibles.map((c) => <option key={c.id} value={c.id}>{c.nombre} ({c.codigoHex})</option>)}
                </select>
              </div>
            </div>

            <div className={styles.twoColsLayout} style={{ gap: "10px", alignItems: "center" }}>
              <div className={styles.formField}>
                <label htmlFor="prenda-tipo">Tipo Comercial</label>
                <select
                  id="prenda-tipo"
                  value={tipoPrenda}
                  onChange={(e) => setTipoPrenda(e.target.value as "VENTA" | "OBSEQUIO" | "MUESTRA")}
                  className={styles.formInput}
                >
                  <option value="VENTA">Venta</option>
                  <option value="OBSEQUIO">Obsequio (S/ 0.00)</option>
                  <option value="MUESTRA">Muestra</option>
                </select>
              </div>

              <div className={styles.formField} style={{ justifyContent: "flex-end" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "20px" }}>
                  <input
                    id="prenda-es-arquero"
                    type="checkbox"
                    checked={esArquero}
                    onChange={(e) => setEsArquero(e.target.checked)}
                    style={{ cursor: "pointer", width: 18, height: 18, accentColor: "#0284c7" }}
                  />
                  <label htmlFor="prenda-es-arquero" style={{ fontSize: "0.88rem", fontWeight: 600, cursor: "pointer", margin: 0 }}>
                    ¿Es arquero?
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter} style={{ marginTop: "14px", padding: 0 }}>
              <button type="button" className={styles.modalCancelButton} onClick={onClose} disabled={isPending}>Cancelar</button>
              <button type="submit" className={styles.modalSubmitButton} disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar Ficha"}
              </button>
            </div>
          </form>
        )}

        {tab === "estampados" && (
          <div style={{ padding: "14px 20px" }}>
            <SeccionPersonalizacionesPrenda
              prendaId={prenda.id} pedidoId={pedidoId}
              personalizaciones={prenda.personalizaciones}
              ubicaciones={ubicacionesCatalogo}
            />
          </div>
        )}

        {tab === "confeccion" && (
          <div style={{ padding: "14px 20px", display: "grid", gap: "16px" }}>
            <SeccionExcepcionesPrenda
              prendaId={prenda.id}
              pedidoId={pedidoId}
              excepciones={prenda.excepciones}
              atributosCatalogo={atributosCatalogo}
            />
            {prenda.grupo?.configuracion && (
              <div style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Estándar del Grupo {grupoNombre ? `(${grupoNombre})` : ""}
                </span>
                <TablaConfiguracionGrupo
                  grupoNombre={grupoNombre}
                  configuracion={prenda.grupo.configuracion}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
