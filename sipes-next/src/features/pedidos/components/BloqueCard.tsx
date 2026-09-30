"use client";

import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Circle, Lock, Unlock, ArrowDown, ArrowRight, AlertTriangle, Check } from "lucide-react";
import Link from "next/link";
import styles from "./pedidoRevision.module.css";

export interface BloqueCheckItem {
  id: string;
  label: string;
  ok: boolean;
  detalle?: string;
}

interface BloqueCardProps {
  titulo: string;
  icono: LucideIcon;
  cerrado: boolean;
  cerradoPor?: string | null;
  version?: number | null;
  checks: BloqueCheckItem[];
  error?: string;
  isPending: boolean;
  onCerrar: () => void;
  onReabrir: () => void;
  actionHref?: string;
  actionScrollId?: string;
  actionLabel: string;
}

export function BloqueCard({
  titulo,
  icono: Icono,
  cerrado,
  cerradoPor,
  version,
  checks,
  error,
  isPending,
  onCerrar,
  onReabrir,
  actionHref,
  actionScrollId,
  actionLabel,
}: BloqueCardProps) {
  const faltantes = checks.filter((c) => !c.ok).length;
  const todosCumplidos = faltantes === 0;

  function handleScroll() {
    if (actionScrollId) {
      document.getElementById(actionScrollId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className={styles.bloqueCard}>
      <div>
        <div className={styles.bloqueCardHeader}>
          <h3 className={styles.bloqueTitle}>
            <Icono size={17} color="var(--sky-dark)" />
            {titulo}
          </h3>
          <span className={cerrado ? styles.bloqueBadgeOk : styles.bloqueBadgePending}>
            {cerrado ? "CERRADO" : "ABIERTO"}
          </span>
        </div>

        <ol className={styles.bloqueChecklist}>
          {checks.map((item, idx) => (
            <li
              key={item.id}
              className={`${styles.checkItem} ${item.ok ? styles.checkItemOk : styles.checkItemPending}`}
            >
              <div className={styles.checkItemLeft}>
                <span className={styles.checkItemIcon}>
                  {item.ok ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                </span>
                <span className={styles.checkItemLabel}>
                  {idx + 1}. {item.label}
                </span>
              </div>
              {item.detalle && (
                <span className={styles.checkItemDetalle}>{item.detalle}</span>
              )}
            </li>
          ))}
        </ol>

        {cerrado && (
          <div className={styles.metaAuditoria} style={{ marginTop: "10px" }}>
            <Check size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
            {cerradoPor ?? "Sin autor"}{version ? ` · v${version}` : ""}
          </div>
        )}

        {error && (
          <div className={styles.alertaError} role="alert">
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: "1px" }} />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div>
        <div className={styles.bloqueActionRow}>
          {cerrado ? (
            <button
              type="button"
              className={styles.btnReabrir}
              onClick={onReabrir}
              disabled={isPending}
            >
              <Unlock size={13} /> Reabrir
            </button>
          ) : (
            <button
              type="button"
              className={styles.btnCerrar}
              onClick={onCerrar}
              disabled={isPending || !todosCumplidos}
              title={todosCumplidos ? "Cerrar y congelar bloque" : `Falta cumplir ${faltantes} requisito(s)`}
            >
              <Lock size={13} />
              {isPending ? "Validando..." : "Cerrar"}
            </button>
          )}

          {actionHref ? (
            <Link href={actionHref} className={styles.bloqueLink}>
              {actionLabel} <ArrowRight size={13} />
            </Link>
          ) : (
            <button type="button" className={styles.bloqueLink} onClick={handleScroll}>
              {actionLabel} <ArrowDown size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
