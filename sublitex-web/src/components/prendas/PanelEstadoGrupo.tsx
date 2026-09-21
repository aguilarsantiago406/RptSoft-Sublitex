"use client";

import React, { useMemo } from "react";
import type { CatalogoCompleto, PrendaItem } from "@/types/prendas";
import { resumirGrupo } from "@/domain/resumenGrupo";
import type { EstadoDiscrepancia } from "@/domain/resumenGrupo";
import styles from "./PanelEstadoGrupo.module.css";

export interface PanelEstadoGrupoProps {
  prendas: PrendaItem[];
  catalogo: CatalogoCompleto;
  cantidadContratada: number;
  politicaNumeracion?: string;
}

type EstadoTarjeta = "ok" | "aviso" | "error" | "info";

/** R-I09: scroll hasta la tarjeta del participante que pide corrección. */
function irAPrenda(prendaId: string) {
  document
    .getElementById(prendaId)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function PanelEstadoGrupo({
  prendas,
  catalogo,
  cantidadContratada,
  politicaNumeracion,
}: PanelEstadoGrupoProps) {
  // Todo es derivado del estado actual (R-I06): se recalcula en cada render.
  const resumen = useMemo(
    () =>
      resumirGrupo(prendas, catalogo, cantidadContratada, politicaNumeracion),
    [prendas, catalogo, cantidadContratada, politicaNumeracion]
  );

  const nExcepciones = resumen.excepcionesPorAtributo.reduce(
    (acc, a) => acc + a.total,
    0
  );

  return (
    <section className={styles.panel}>
      <header className={styles.panelHeader}>
        <h3 className={styles.panelTitulo}>Estado del grupo</h3>
        <p className={styles.panelSubtitulo}>
          {prendas.length} prendas · {resumen.prendasIncompletas.length}{" "}
          incompletas · {nExcepciones} excepciones
        </p>
      </header>

      <div className={styles.estadoGrid}>
        {/* R-B02/R-H03 — discrepancia contra lo contratado */}
        <TarjetaEstado
          titulo="Contratadas"
          estado={estadoDiscrepancia(resumen.discrepancia.estado)}
        >
          <div className={styles.valor}>
            {resumen.discrepancia.registrado} de {resumen.discrepancia.contratado}
          </div>
          {resumen.discrepancia.diferencia !== 0 && (
            <div className={styles.detalle}>
              {resumen.discrepancia.diferencia > 0
                ? `+${resumen.discrepancia.diferencia} de más`
                : `${resumen.discrepancia.diferencia} faltan`}
            </div>
          )}
        </TarjetaEstado>

        {/* R-E03 — ficha mínima: nombre en prenda + número + talla */}
        <TarjetaEstado
          titulo="Prendas incompletas"
          estado={resumen.prendasIncompletas.length > 0 ? "aviso" : "ok"}
        >
          <div className={styles.valor}>{resumen.prendasIncompletas.length}</div>
          {resumen.prendasIncompletas.length > 0 && (
            <ul className={styles.lista}>
              {resumen.prendasIncompletas.slice(0, 4).map((p) => (
                <li key={p.prendaId}>
                  <button
                    className={styles.btnCorregir}
                    onClick={() => irAPrenda(p.prendaId)}
                    title={`Ir a ${p.referencia || "la prenda"}`}
                  >
                    {p.referencia || "(sin nombre)"}: {p.faltantes.join(", ")}
                  </button>
                </li>
              ))}
              {resumen.prendasIncompletas.length > 4 && (
                <li className={styles.mas}>
                  +{resumen.prendasIncompletas.length - 4} más
                </li>
              )}
            </ul>
          )}
        </TarjetaEstado>

        {/* R-C07 — resumen de excepciones por atributo, con acceso al detalle */}
        <TarjetaEstado
          titulo="Excepciones por atributo"
          estado={resumen.excepcionesPorAtributo.length > 0 ? "info" : "ok"}
        >
          {resumen.excepcionesPorAtributo.length === 0 ? (
            <div className={styles.valor}>—</div>
          ) : (
            <ul className={styles.chips}>
              {resumen.excepcionesPorAtributo.map((a) => (
                <li key={a.atributo} className={styles.chipWrap}>
                  <details className={styles.chipDetails}>
                    <summary className={styles.chip}>
                      {a.nombreAtributo} · {a.total}
                    </summary>
                    <ul className={styles.chipBody}>
                      {a.porValor.map((v) => (
                        <li key={v.valor}>
                          {v.cantidad} {v.valor} — {v.cantidad} prenda
                          {v.cantidad === 1 ? "" : "s"}
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </TarjetaEstado>

        {/* R-G05 — repetidos como información; politica no-LIBRE sube a AVISO */}
        <TarjetaEstado
          titulo="Dorsales repetidos"
          estado={
            resumen.numerosRepetidos.length === 0
              ? "ok"
              : resumen.numerosRepetidos.some((r) => r.severidad === "AVISO")
                ? "aviso"
                : "info"
          }
        >
          {resumen.numerosRepetidos.length === 0 ? (
            <div className={styles.valor}>—</div>
          ) : (
            <ul className={styles.lista}>
              {resumen.numerosRepetidos.map((r) => (
                <li key={r.numero}>
                  N.º {r.numero} ×{r.cantidad}
                  <span className={styles.detalle}>
                    {" "}
                    — {r.cantidad} prendas (INFO)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </TarjetaEstado>

        {/* R-K03 — producción por producto, BOM multiplicado */}
        <TarjetaEstado titulo="Producción por producto">
          <ul className={styles.lista}>
            {resumen.produccionPorProducto.map((pp) => (
              <li key={pp.productoCodigo} className={styles.producto}>
                <span className={styles.productoNombre}>
                  {pp.nombre} ×{pp.cantidad}
                </span>
                <span className={styles.productoPiezas}>
                  CAM {pp.piezas.camisetas} · SHORT {pp.piezas.shorts} · MEDIA{" "}
                  {pp.piezas.medias}
                </span>
              </li>
            ))}
          </ul>
        </TarjetaEstado>

        {/* R-F03 — personalización sin ubicación del catálogo */}
        {resumen.personalizacionesInvalidas.length > 0 && (
          <TarjetaEstado
            titulo="Personalizaciones inválidas"
            estado="error"
          >
            <ul className={styles.lista}>
              {resumen.personalizacionesInvalidas.slice(0, 4).map((p, i) => (
                <li key={i}>
                  <button
                    className={styles.btnCorregir}
                    onClick={() => irAPrenda(p.prendaId)}
                  >
                    {p.ubicacion}: {p.contenido}
                  </button>
                </li>
              ))}
              {resumen.personalizacionesInvalidas.length > 4 && (
                <li className={styles.mas}>
                  +{resumen.personalizacionesInvalidas.length - 4} más
                </li>
              )}
            </ul>
          </TarjetaEstado>
        )}
      </div>
    </section>
  );
}

function estadoDiscrepancia(estado: EstadoDiscrepancia): EstadoTarjeta {
  return estado === "COINCIDE" ? "ok" : "aviso";
}

// =============================================================================
// Tarjeta de estado interna
// =============================================================================

interface TarjetaEstadoProps {
  titulo: string;
  estado?: EstadoTarjeta;
  children: React.ReactNode;
}

function IconoEstado({ estado }: { estado: EstadoTarjeta }) {
  switch (estado) {
    case "aviso":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M8 2.6 14 13.4H2L8 2.6Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M8 6.8v2.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="8" cy="11.4" r="0.9" fill="currentColor" />
        </svg>
      );
    case "error":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.4" />
          <path d="M8 5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="8" cy="11.4" r="0.9" fill="currentColor" />
        </svg>
      );
    case "info":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M8.2 7H8a.6.6 0 0 0-.6.6v3.2"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="8" cy="4.6" r="0.9" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M5.2 8.2l2 2 3.6-4.2"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

function TarjetaEstado({ titulo, estado = "ok", children }: TarjetaEstadoProps) {
  return (
    <div
      className={`${styles.tarjeta} ${styles[`tarjeta_${estado}`]}`}
    >
      <div className={styles.tarjetaTituloRow}>
        <span className={`${styles.tarjetaIcono} ${styles[`icono_${estado}`]}`}>
          <IconoEstado estado={estado} />
        </span>
        <span className={styles.tarjetaTitulo}>{titulo}</span>
      </div>
      {children}
    </div>
  );
}