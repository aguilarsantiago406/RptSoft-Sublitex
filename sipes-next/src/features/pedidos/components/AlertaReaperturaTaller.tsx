"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import type { VersionPendienteAcuseItem } from "../types/bloque";
import { actionAcusarReciboVersion } from "../actions/bloques.actions";
import styles from "./alertaReapertura.module.css";

interface AlertaReaperturaTallerProps {
  pedidoId: string;
  versionesPendientes: VersionPendienteAcuseItem[];
  userRol?: string;
}

const NOMBRES_BLOQUE: Record<string, string> = {
  DISENO: "Diseño",
  LISTA: "Lista de Prendas",
  COMERCIAL: "Comercial",
};

export function AlertaReaperturaTaller({
  pedidoId,
  versionesPendientes,
  userRol,
}: AlertaReaperturaTallerProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [versionProcesandoId, setVersionProcesandoId] = useState<string | null>(null);

  if (!versionesPendientes || versionesPendientes.length === 0) {
    return null;
  }

  function handleAcusar(versionId: string) {
    setErrorMsg(null);
    setVersionProcesandoId(versionId);

    // Determinar área según rol del usuario si aplica
    let area: "DISENO" | "PRODUCCION" | undefined = undefined;
    if (userRol === "DISENO") area = "DISENO";
    else if (userRol === "PRODUCCION") area = "PRODUCCION";

    startTransition(async () => {
      const res = await actionAcusarReciboVersion(pedidoId, versionId, area);
      setVersionProcesandoId(null);
      if (!res.ok) {
        setErrorMsg(res.error || "No se pudo registrar el acuse de recibo.");
      }
    });
  }

  return (
    <div className={styles.alertaContainer} role="region" aria-label="Alertas de Reapertura">
      {errorMsg && <div className={styles.alertaErrorLocal}>{errorMsg}</div>}

      {versionesPendientes.map((v) => {
        const bloqueNombre = NOMBRES_BLOQUE[v.tipoBloque] || v.tipoBloque;
        const estaProcesando = isPending && versionProcesandoId === v.id;

        return (
          <div key={v.id} className={styles.alertaCard}>
            <div className={styles.alertaHeader}>
              <div className={styles.tituloWrapper}>
                <AlertTriangle size={22} color="#d97706" />
                <h3 className={styles.titulo}>
                  Alerta Operativa: Reapertura de {bloqueNombre}
                </h3>
              </div>
              <span className={styles.versionBadge}>Versión #{v.numero}</span>
            </div>

            <div className={styles.motivoBox}>
              <span className={styles.motivoLabel}>Motivo de Reapertura:</span>
              <span>{v.motivoReapertura || "Sin motivo registrado"}</span>
            </div>

            <div className={styles.metaInfo}>
              <span>
                Reabierto por: {v.creadoPor?.nombre || "Usuario"} (
                {v.creadoPor?.rol || "Sistema"})
              </span>
              <span>
                Fecha: {new Date(v.creadoEn).toLocaleString("es-PE")}
              </span>
            </div>

            <div className={styles.pillsRow}>
              {v.acusadoDisenoEn ? (
                <span className={styles.pillOk}>
                  <CheckCircle2 size={14} />
                  Acusado por Diseño
                </span>
              ) : (
                <span className={styles.pillPending}>
                  <Clock size={14} />
                  Pendiente de acuse por Diseño
                </span>
              )}

              {v.acusadoProduccionEn ? (
                <span className={styles.pillOk}>
                  <CheckCircle2 size={14} />
                  Acusado por Taller / Producción
                </span>
              ) : (
                <span className={styles.pillPending}>
                  <Clock size={14} />
                  Pendiente de acuse por Taller / Producción
                </span>
              )}
            </div>

            {/* BOTÓN DE ACUSE */}
            <button
              type="button"
              className={styles.btnAcusar}
              onClick={() => handleAcusar(v.id)}
              disabled={estaProcesando}
            >
              <CheckCircle2 size={16} />
              {estaProcesando
                ? "Sellando Acuse..."
                : `Confirmar Acuse de Recibo en Taller (Versión #${v.numero})`}
            </button>
          </div>
        );
      })}
    </div>
  );
}
