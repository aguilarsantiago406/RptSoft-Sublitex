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
import { FilaPrenda } from "./FilaPrenda";
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

const columnasHeaders = [
  "#",
  "Nombre en prenda",
  "Nombre de la persona",
  "Producto",
  "Talla",
  "Número",
  "Color",
  "Género",
  "Corte",
  "Cuello",
  "Tela",
  "Acabado escudo",
  "Arquero",
  "Tipo",
  "Personalización especial",
  "Precio base",
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
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.theadRow}>
            {columnasHeaders.map((col) => (
              <th key={col} className={styles.th}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {prendas.map((prenda, i) => (
            <FilaPrenda
              key={prenda.id}
              prenda={prenda}
              index={i}
              colores={colores}
              tarifas={tarifas}
              catalogo={catalogo}
              onActualizarPrenda={onActualizarPrenda}
            />
          ))}
        </tbody>
        <TotalesPrendas totales={totales} />
      </table>
    </div>
  );
}