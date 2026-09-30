"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Palette,
  ClipboardList,
  BadgeDollarSign,
  ArrowDown,
  ArrowRight,
  AlertTriangle,
  Lock,
  Unlock,
} from "lucide-react";
import type { PedidoDetalle } from "../types/pedido";
import type { BloquePedidoItem, TipoBloque } from "../types/bloque";
import { actionCerrarBloque, actionReabrirBloque } from "../actions/bloques.actions";
import { evaluarBloquesReales } from "../utils/bloques.utils";
import { ModalReabrirBloque } from "./ModalReabrirBloque";
import sharedStyles from "./pedidos.module.css";
import styles from "./pedidoRevision.module.css";

interface PedidoRevisionProps {
  pedido: PedidoDetalle;
  bloques?: BloquePedidoItem[];
  totalPrendas?: number;
}

const NOMBRES_BLOQUE: Record<TipoBloque, string> = {
  DISENO: "Bloque Diseño",
  LISTA: "Bloque Lista de Prendas",
  COMERCIAL: "Bloque Comercial",
};

export function PedidoRevision({
  pedido,
  bloques = [],
}: PedidoRevisionProps) {
  const [isPending, startTransition] = useTransition();
  const [bloquePendingTipo, setBloquePendingTipo] = useState<TipoBloque | null>(null);
  const [errores, setErrores] = useState<Partial<Record<TipoBloque, string>>>({});
  const [reabrirTipo, setReabrirTipo] = useState<TipoBloque | null>(null);

  const gobernanza = evaluarBloquesReales(bloques);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleCerrar(tipo: TipoBloque) {
    setErrores((prev) => ({ ...prev, [tipo]: undefined }));
    setBloquePendingTipo(tipo);

    startTransition(async () => {
      const res = await actionCerrarBloque(pedido.id, tipo);
      setBloquePendingTipo(null);
      if (!res.ok) {
        setErrores((prev) => ({ ...prev, [tipo]: res.error || "No se pudo cerrar el bloque." }));
      }
    });
  }

  async function handleConfirmReabrir(motivo: string) {
    if (!reabrirTipo) return;
    const tipo = reabrirTipo;
    setErrores((prev) => ({ ...prev, [tipo]: undefined }));
    setBloquePendingTipo(tipo);

    startTransition(async () => {
      const res = await actionReabrirBloque(pedido.id, tipo, motivo);
      setBloquePendingTipo(null);
      setReabrirTipo(null);
      if (!res.ok) {
        setErrores((prev) => ({ ...prev, [tipo]: res.error || "No se pudo reabrir el bloque." }));
      }
    });
  }

  const bDiseno = gobernanza.diseno.bloque;
  const bLista = gobernanza.lista.bloque;
  const bComercial = gobernanza.comercial.bloque;

  return (
    <section id="bloques" className={sharedStyles.sectionBlock} style={{ scrollMarginTop: "16px" }}>
      <div className={sharedStyles.sectionHeaderRow}>
        <div>
          <h2 className={sharedStyles.sectionTitle} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={20} color="var(--sky-dark)" />
            BLOQUES DEL PEDIDO
          </h2>
          <p className={sharedStyles.sectionSubtitle}>
            Los 3 deben quedar cerrados para liberar el pedido al taller.
          </p>
        </div>
      </div>

      <div className={styles.gridBloques}>
        {/* BLOQUE 1: DISEÑO */}
        <div className={styles.bloqueCard} title="R-H01, R-H02">
          <div>
            <div className={styles.bloqueCardHeader}>
              <h3 className={styles.bloqueTitle}>
                <Palette size={18} color="var(--sky-dark)" />
                {NOMBRES_BLOQUE.DISENO}
              </h3>
              <span className={gobernanza.diseno.cerrado ? styles.bloqueBadgeOk : styles.bloqueBadgePending}>
                {gobernanza.diseno.cerrado ? "CERRADO" : "ABIERTO"}
              </span>
            </div>
            <p className={styles.bloqueDescription}>Arte y mockups aprobados.</p>

            {gobernanza.diseno.cerrado && (
              <div className={styles.metaAuditoria}>
                ✓ {bDiseno?.cerradoPor?.nombre ?? "Sin autor"}
                {bDiseno?.versiones?.[0]?.numero ? ` · v${bDiseno.versiones[0].numero}` : ""}
              </div>
            )}

            {errores.DISENO && (
              <div className={styles.alertaError} role="alert">
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: "1px" }} />
                <span>{errores.DISENO}</span>
              </div>
            )}
          </div>

          <div>
            <div className={styles.bloqueActionRow}>
              {gobernanza.diseno.cerrado ? (
                <button
                  type="button"
                  className={styles.btnReabrir}
                  onClick={() => setReabrirTipo("DISENO")}
                  disabled={isPending}
                >
                  <Unlock size={13} /> Reabrir
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.btnCerrar}
                  onClick={() => handleCerrar("DISENO")}
                  disabled={isPending && bloquePendingTipo === "DISENO"}
                >
                  <Lock size={13} />
                  {isPending && bloquePendingTipo === "DISENO" ? "Validando..." : "Cerrar"}
                </button>
              )}

              <button
                type="button"
                className={styles.bloqueLink}
                onClick={() => scrollToSection("seccion-diseno")}
              >
                Ir a Mockups <ArrowDown size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* BLOQUE 2: LISTA DE PRENDAS */}
        <div className={styles.bloqueCard} title="R-B02, R-E03, R-G03, R-H03">
          <div>
            <div className={styles.bloqueCardHeader}>
              <h3 className={styles.bloqueTitle}>
                <ClipboardList size={18} color="var(--sky-dark)" />
                {NOMBRES_BLOQUE.LISTA}
              </h3>
              <span className={gobernanza.lista.cerrado ? styles.bloqueBadgeOk : styles.bloqueBadgePending}>
                {gobernanza.lista.cerrado ? "CERRADO" : "ABIERTO"}
              </span>
            </div>
            <p className={styles.bloqueDescription}>Tallas, dorsales y excepciones completos.</p>

            {gobernanza.lista.cerrado && (
              <div className={styles.metaAuditoria}>
                ✓ {bLista?.cerradoPor?.nombre ?? "Sin autor"}
                {bLista?.versiones?.[0]?.numero ? ` · v${bLista.versiones[0].numero}` : ""}
              </div>
            )}

            {errores.LISTA && (
              <div className={styles.alertaError} role="alert">
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: "1px" }} />
                <span>{errores.LISTA}</span>
              </div>
            )}
          </div>

          <div>
            <div className={styles.bloqueActionRow}>
              {gobernanza.lista.cerrado ? (
                <button
                  type="button"
                  className={styles.btnReabrir}
                  onClick={() => setReabrirTipo("LISTA")}
                  disabled={isPending}
                >
                  <Unlock size={13} /> Reabrir
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.btnCerrar}
                  onClick={() => handleCerrar("LISTA")}
                  disabled={isPending && bloquePendingTipo === "LISTA"}
                >
                  <Lock size={13} />
                  {isPending && bloquePendingTipo === "LISTA" ? "Validando..." : "Cerrar"}
                </button>
              )}

              <Link
                href={`/pedidos/${pedido.codigo}/prendas`}
                className={styles.bloqueLink}
              >
                Ir a Prendas <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* BLOQUE 3: COMERCIAL */}
        <div className={styles.bloqueCard} title="R-A09, R-H03">
          <div>
            <div className={styles.bloqueCardHeader}>
              <h3 className={styles.bloqueTitle}>
                <BadgeDollarSign size={18} color="var(--sky-dark)" />
                {NOMBRES_BLOQUE.COMERCIAL}
              </h3>
              <span className={gobernanza.comercial.cerrado ? styles.bloqueBadgeOk : styles.bloqueBadgePending}>
                {gobernanza.comercial.cerrado ? "CERRADO" : "ABIERTO"}
              </span>
            </div>
            <p className={styles.bloqueDescription}>Confirmación y adelanto registrados.</p>

            {gobernanza.comercial.cerrado && (
              <div className={styles.metaAuditoria}>
                ✓ {bComercial?.cerradoPor?.nombre ?? "Sin autor"}
                {bComercial?.versiones?.[0]?.numero ? ` · v${bComercial.versiones[0].numero}` : ""}
              </div>
            )}

            {errores.COMERCIAL && (
              <div className={styles.alertaError} role="alert">
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: "1px" }} />
                <span>{errores.COMERCIAL}</span>
              </div>
            )}
          </div>

          <div>
            <div className={styles.bloqueActionRow}>
              {gobernanza.comercial.cerrado ? (
                <button
                  type="button"
                  className={styles.btnReabrir}
                  onClick={() => setReabrirTipo("COMERCIAL")}
                  disabled={isPending}
                >
                  <Unlock size={13} /> Reabrir
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.btnCerrar}
                  onClick={() => handleCerrar("COMERCIAL")}
                  disabled={isPending && bloquePendingTipo === "COMERCIAL"}
                >
                  <Lock size={13} />
                  {isPending && bloquePendingTipo === "COMERCIAL" ? "Validando..." : "Cerrar"}
                </button>
              )}

              <Link href={`/pedidos/${pedido.codigo}/proforma`} className={styles.bloqueLink}>
                Ir a Proforma <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL REAPERTURA DE BLOQUE */}
      <ModalReabrirBloque
        isOpen={Boolean(reabrirTipo)}
        tipo={reabrirTipo}
        onClose={() => setReabrirTipo(null)}
        onConfirm={handleConfirmReabrir}
        isPending={isPending}
      />
    </section>
  );
}
