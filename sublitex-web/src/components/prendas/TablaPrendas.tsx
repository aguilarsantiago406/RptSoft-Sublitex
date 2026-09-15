"use client";

import React from "react";
import type {
  CatalogoCompleto,
  ColorPedido,
  PrendaItem,
  Tarifa,
  TotalesPedido,
  UpdatePrenda,
} from "@/types/prendas";
import { FilaParticipante } from "./FilaParticipante";
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

const columnasParticipante = [
  "#",
  "Nombre en prenda",
  "Persona",
  "Producto",
  "Talla",
  "Número",
  "Color",
  "Género",
  "Arquero",
  "Tipo",
  "Personalización",
];

const columnasAtributos = [
  "#",
  "Prenda",
  "Corte",
  "Cuello",
  "Tela",
  "Acabado escudo",
];

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
  return (
    <div className={styles.grilla}>
      {/* 1 — Participantes y prendas */}
      <section className={styles.seccion}>
        <header className={styles.seccionHeader}>
          <h3 className={styles.seccionTitulo}>Participantes y prendas</h3>
          <p className={styles.seccionSubtitulo}>
            Identidad, producto, talla, número y tipo
          </p>
        </header>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.stickyHeader}>
              <tr className={styles.theadRow}>
                {columnasParticipante.map((col) => (
                  <th key={col} className={styles.th}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prendas.map((prenda, i) => (
                <FilaParticipante
                  key={prenda.id}
                  prenda={prenda}
                  index={i}
                  colores={colores}
                  catalogo={catalogo}
                  onActualizarPrenda={onActualizarPrenda}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2 — Atributos de confección */}
      <section className={styles.seccion}>
        <header className={styles.seccionHeader}>
          <h3 className={styles.seccionTitulo}>Atributos de confección</h3>
          <p className={styles.seccionSubtitulo}>
            Valores efectivos: lo que cada prenda hereda del grupo o excepciona
          </p>
        </header>
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
      </section>

      {/* 3 — Precios y producción */}
      <section className={styles.seccion}>
        <header className={styles.seccionHeader}>
          <h3 className={styles.seccionTitulo}>Precios y producción</h3>
          <p className={styles.seccionSubtitulo}>
            Tarifa oficial (R-K10) y piezas físicas por producto (R-K03)
          </p>
        </header>
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
      </section>
    </div>
  );
}