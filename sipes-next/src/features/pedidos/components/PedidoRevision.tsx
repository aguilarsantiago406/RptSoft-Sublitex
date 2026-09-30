"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  Palette,
  ClipboardList,
  BadgeDollarSign,
  ArrowDown,
  ArrowRight,
  CheckCircle,
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
    <section className={sharedStyles.sectionBlock}>
      <div className={sharedStyles.sectionHeaderRow}>
        <div>
          <h2 className={sharedStyles.sectionTitle} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={20} color="var(--sky-dark)" />
            GOBERNANZA DE BLOQUES OPERATIVOS (BASE DE DATOS)
          </h2>
          <p className={sharedStyles.sectionSubtitle}>
            Control formal de los 3 candados de negocio en el backend antes de liberar a taller.
          </p>
        </div>
        <Link
          href={`/pedidos/${pedido.codigo}/proforma`}
          className={sharedStyles.linkButton}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <FileText size={16} />
          Ver Proforma Comercial →
        </Link>
      </div>

      <div className={styles.gridBloques}>
        {/* BLOQUE 1: DISEÑO */}
        <div className={styles.bloqueCard}>
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
            <p style={{ margin: "6px 0 10px", fontSize: "0.78rem", color: "var(--muted)" }}>
              Aprobación final del arte y mockups gráficos (R-H01, R-H02).
            </p>

            {gobernanza.diseno.cerrado ? (
              <div className={styles.metaAuditoria}>
                ✓ Cerrado formalmente {bDiseno?.cerradoPor?.nombre ? `por ${bDiseno.cerradoPor.nombre}` : ""}
                {bDiseno?.versiones?.[0]?.numero ? ` · Versión #${bDiseno.versiones[0].numero}` : ""}
              </div>
            ) : (
              <div className={styles.metaAuditoria}>
                Estado: Abierto para edición y subida de propuestas gráficas.
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
                  <Unlock size={13} /> Reabrir Bloque
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.btnCerrar}
                  onClick={() => handleCerrar("DISENO")}
                  disabled={isPending && bloquePendingTipo === "DISENO"}
                >
                  <Lock size={13} />
                  {isPending && bloquePendingTipo === "DISENO" ? "Validando..." : "Cerrar Bloque"}
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
        <div className={styles.bloqueCard}>
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
            <p style={{ margin: "6px 0 10px", fontSize: "0.78rem", color: "var(--muted)" }}>
              Asignación 100% de tallas, dorsales y excepciones (R-B02, R-H03).
            </p>

            {gobernanza.lista.cerrado ? (
              <div className={styles.metaAuditoria}>
                ✓ Cerrado formalmente {bLista?.cerradoPor?.nombre ? `por ${bLista.cerradoPor.nombre}` : ""}
                {bLista?.versiones?.[0]?.numero ? ` · Versión #${bLista.versiones[0].numero}` : ""}
              </div>
            ) : (
              <div className={styles.metaAuditoria}>
                Estado: Abierto. Se exige completar la cantidad contratada de cada grupo antes del cierre.
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
                  <Unlock size={13} /> Reabrir Bloque
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.btnCerrar}
                  onClick={() => handleCerrar("LISTA")}
                  disabled={isPending && bloquePendingTipo === "LISTA"}
                >
                  <Lock size={13} />
                  {isPending && bloquePendingTipo === "LISTA" ? "Validando..." : "Cerrar Bloque"}
                </button>
              )}

              <Link
                href={`/pedidos/${pedido.codigo}/prendas`}
                className={styles.bloqueLink}
              >
                Ir a Matriz de Prendas <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* BLOQUE 3: COMERCIAL */}
        <div className={styles.bloqueCard}>
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
            <p style={{ margin: "6px 0 10px", fontSize: "0.78rem", color: "var(--muted)" }}>
              Confirmación comercial, adelanto 50% y fecha pactada (R-A09, R-K06).
            </p>

            {gobernanza.comercial.cerrado ? (
              <div className={styles.metaAuditoria}>
                ✓ Cerrado formalmente {bComercial?.cerradoPor?.nombre ? `por ${bComercial.cerradoPor.nombre}` : ""}
                {bComercial?.versiones?.[0]?.numero ? ` · Versión #${bComercial.versiones[0].numero}` : ""}
              </div>
            ) : (
              <div className={styles.metaAuditoria}>
                Estado: Abierto. Requiere confirmación comercial con adelanto registrado.
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
                  <Unlock size={13} /> Reabrir Bloque
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.btnCerrar}
                  onClick={() => handleCerrar("COMERCIAL")}
                  disabled={isPending && bloquePendingTipo === "COMERCIAL"}
                >
                  <Lock size={13} />
                  {isPending && bloquePendingTipo === "COMERCIAL" ? "Validando..." : "Cerrar Bloque"}
                </button>
              )}

              <Link href={`/pedidos/${pedido.codigo}/proforma`} className={styles.bloqueLink}>
                Ver Proforma →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ESTADO CONSOLIDADO PRE-TALLER */}
      {gobernanza.listoParaProduccion ? (
        <div className={styles.readinessBannerOk} role="status">
          <CheckCircle size={20} />
          <div>
            <strong>✓ Candados verificados en base de datos: Pedido listo para producción</strong>
            <div style={{ fontSize: "0.8rem", marginTop: "2px" }}>
              Los 3 bloques operativos (Diseño, Lista y Comercial) están CERRADOS. Podés liberar la orden a taller desde la Guía de Etapa superior.
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.readinessBannerPending} role="alert">
          <AlertTriangle size={20} />
          <div>
            <strong>Producción retenida por candados operativos</strong>
            <div style={{ fontSize: "0.8rem", marginTop: "2px" }}>
              En la base de datos, los siguientes bloques siguen en estado ABIERTO:{" "}
              <strong>{gobernanza.bloquesPendientes.map((t) => NOMBRES_BLOQUE[t]).join(", ")}</strong>.
              Deben cerrarse formalmente antes de liberar la ficha a corte.
            </div>
          </div>
        </div>
      )}

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
