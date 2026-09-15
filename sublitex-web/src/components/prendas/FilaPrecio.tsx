"use client";

import React from "react";
import type {
  CatalogoCompleto,
  PrendaItem,
  Tarifa,
} from "@/types/prendas";
import { calcularPiezas } from "@/domain/calculoPiezas";
import { calcularPrecio } from "@/domain/calculoPrecios";
import { validarPrenda } from "@/domain/validacionPrenda";
import styles from "./TablaPrendas.module.css";

export interface FilaPrecioProps {
  prenda: PrendaItem;
  index: number;
  tarifas: Tarifa[];
  catalogo: CatalogoCompleto;
}

export function FilaPrecio({
  prenda,
  index,
  tarifas,
  catalogo,
}: FilaPrecioProps) {
  const precio = calcularPrecio(prenda, tarifas);
  const piezas = calcularPiezas(prenda.producto, catalogo);
  const faltantes = validarPrenda(prenda, catalogo);
  const esObsequioOMuestra = prenda.tipoPrenda !== "VENTA";

  const rowClass = esObsequioOMuestra
    ? styles.filaObsequio
    : index % 2 === 0
    ? styles.filaPar
    : styles.filaImpar;

  return (
    <tr className={rowClass}>
      <td className={styles.tdIndex}>{index + 1}</td>

      {/* Referencia: nombre en prenda */}
      <td className={styles.tdNombrePrenda}>
        <span className={styles.nombreRef}>{prenda.nombreEnPrenda || "—"}</span>
      </td>

      {/* Precio base */}
      <td className={styles.tdRight}>S/ {precio.precioBase.toFixed(2)}</td>

      {/* Recargos */}
      <td className={`${styles.tdRight} ${precio.recTalla > 0 ? styles.recargoActivo : styles.recargoInactivo}`}>
        {precio.recTalla > 0 ? `+${precio.recTalla.toFixed(2)}` : "0"}
      </td>
      <td className={`${styles.tdRight} ${precio.recTela > 0 ? styles.recargoActivo : styles.recargoInactivo}`}>
        {precio.recTela > 0 ? `+${precio.recTela.toFixed(2)}` : "0"}
      </td>
      <td className={`${styles.tdRight} ${precio.recCuello > 0 ? styles.recargoActivo : styles.recargoInactivo}`}>
        {precio.recCuello > 0 ? `+${precio.recCuello.toFixed(2)}` : "0"}
      </td>
      <td className={`${styles.tdRight} ${precio.recAcabado > 0 ? styles.recargoActivo : styles.recargoInactivo}`}>
        {precio.recAcabado > 0 ? `+${precio.recAcabado.toFixed(2)}` : "0"}
      </td>

      {/* PRECIO UNIT. */}
      <td
        className={`${styles.tdRight} ${
          esObsequioOMuestra ? styles.precioUnitarioObsequio : styles.precioUnitarioVenta
        }`}
      >
        S/ {precio.precioUnitario.toFixed(2)}
      </td>

      {/* Piezas físicas */}
      <td className={styles.tdCenter}>{piezas.camisetas}</td>
      <td className={styles.tdCenter}>{piezas.shorts}</td>
      <td className={styles.tdCenter}>{piezas.medias}</td>

      {/* Qué falta */}
      <td className={`${styles.td} ${faltantes.length > 0 ? styles.faltantesError : styles.faltantesOk}`}>
        {faltantes.length > 0 ? faltantes.join(", ") : "✓"}
      </td>
    </tr>
  );
}