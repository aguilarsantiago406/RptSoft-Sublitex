"use client";

import React, { useMemo, useState } from "react";
import type {
  CatalogoCompleto,
  ColorPedido,
  PrendaItem,
  Tarifa,
  TotalesPedido,
  UpdatePrenda,
} from "@/types/prendas";
import { TarjetaParticipante } from "./TarjetaParticipante";
import { FilaAtributos } from "./FilaAtributos";
import { FilaPrecio } from "./FilaPrecio";
import { TotalesPrendas } from "./TotalesPrendas";
import styles from "./TablaPrendas.module.css";

export interface TablaPrendasProps {
  prendas: PrendaItem[];
  colores: ColorPedido[];
  tarifas: Tarifa[];
  catalogo: CatalogoCompleto;
  totales: TotalesPedido;
  onActualizarPrenda: (idPrenda: string, update: UpdatePrenda) => void;
}

const columnasAtributos = ["#", "Prenda", "Corte", "Cuello", "Tela", "Acabado escudo"];

const columnasPrecio = [
  "#",
  "Prenda",
  "Base",
  "Rec. talla",
  "Rec. tela",
  "Rec. cuello",
  "Rec. acabado",
  "PRECIO UNIT.",
  "Camisetas",
  "Shorts",
  "Medias",
  "Qué falta",
];

export function TablaPrendas({
  prendas,
  colores,
  tarifas,
  catalogo,
  totales,
  onActualizarPrenda,
}: TablaPrendasProps) {
  const [abierto, setAbierto] = useState<Record<string, boolean>>({
    atributos: false,
    precios: false,
  });

  const resumenTarjetas = useMemo(() => {
    const excepciones = prendas.reduce(
      (acc, p) => acc + p.valores.filter((v) => v.origen === "EXCEPCION").length,
      0
    );
    const obsequios = prendas.filter((p) => p.tipoPrenda !== "VENTA").length;
    return { excepciones, obsequios };
  }, [prendas]);

  const toggle = (clave: string) =>
    setAbierto((prev) => ({ ...prev, [clave]: !prev[clave] }));

  return (
    <div className={styles.grilla}>
      {/* 1 — Participantes: tarjetas */}
      <section className={styles.seccion}>
        <header className={styles.seccionHeader}>
          <h3 className={styles.seccionTitulo}>Participantes y prendas</h3>
          <p className={styles.seccionSubtitulo}>
            {prendas.length} prendas
            {resumenTarjetas.excepciones > 0 &&
              ` · ${resumenTarjetas.excepciones} excepciones`}
            {resumenTarjetas.obsequios > 0 &&
              ` · ${resumenTarjetas.obsequios} obsequio/muestra`}
          </p>
        </header>
        <div className={styles.tarjetas}>
          {prendas.map((prenda, i) => (
            <TarjetaParticipante
              key={prenda.id}
              prenda={prenda}
              index={i}
              colores={colores}
              catalogo={catalogo}
              onActualizarPrenda={onActualizarPrenda}
            />
          ))}
        </div>
      </section>

      {/* 2 — Atributos de confección (colapsable) */}
      <SeccionColapsable
        titulo="Atributos de confección"
        subtitulo="Corte, cuello, tela y acabado de cada prenda"
        abierto={!!abierto.atributos}
        onToggle={() => toggle("atributos")}
        resumen={`${resumenTarjetas.excepciones} excepción${resumenTarjetas.excepciones === 1 ? "" : "es"}`}
      >
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.stickyHeader}>
              <tr className={styles.theadRow}>
                {columnasAtributos.map((col) => (
                  <th key={col} className={styles.th}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prendas.map((prenda, i) => (
                <FilaAtributos
                  key={prenda.id}
                  prenda={prenda}
                  index={i}
                  catalogo={catalogo}
                  onActualizarPrenda={onActualizarPrenda}
                />
              ))}
            </tbody>
          </table>
        </div>
      </SeccionColapsable>

      {/* 3 — Precios y producción (colapsable) */}
      <SeccionColapsable
        titulo="Precios y producción"
        subtitulo="Tarifa oficial (R-K10) y piezas físicas por producto (R-K03)"
        abierto={!!abierto.precios}
        onToggle={() => toggle("precios")}
        resumen={`S/ ${totales.importeTotal.toFixed(2)}`}
      >
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.stickyHeader}>
              <tr className={styles.theadRow}>
                {columnasPrecio.map((col) => (
                  <th key={col} className={styles.th}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prendas.map((prenda, i) => (
                <FilaPrecio
                  key={prenda.id}
                  prenda={prenda}
                  index={i}
                  tarifas={tarifas}
                  catalogo={catalogo}
                />
              ))}
            </tbody>
            <TotalesPrendas totales={totales} />
          </table>
        </div>
      </SeccionColapsable>
    </div>
  );
}

// =============================================================================
// Sección plegable
// =============================================================================

interface SeccionColapsableProps {
  titulo: string;
  subtitulo: string;
  abierto: boolean;
  onToggle: () => void;
  resumen?: string;
  children: React.ReactNode;
}

function SeccionColapsable({
  titulo,
  subtitulo,
  abierto,
  onToggle,
  resumen,
  children,
}: SeccionColapsableProps) {
  return (
    <section className={`${styles.seccion} ${styles.seccionColapsable}`}>
      <button
        className={`${styles.seccionHeader} ${styles.seccionHeaderBtn}`}
        onClick={onToggle}
        aria-expanded={abierto}
      >
        <span className={styles.seccionTitulo}>{titulo}</span>
        <span className={styles.seccionDerecha}>
          {resumen && <span className={styles.seccionResumen}>{resumen}</span>}
          <span className={styles.chevron}>{abierto ? "▾" : "▸"}</span>
        </span>
      </button>
      <p className={styles.seccionSubtituloAside}>{subtitulo}</p>
      <div
        className={`${styles.seccionCuerpo} ${
          abierto ? styles.seccionCuerpoAbierto : ""
        }`}
        hidden={!abierto}
      >
        {children}
      </div>
    </section>
  );
}