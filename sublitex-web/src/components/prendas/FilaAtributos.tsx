"use client";

import React from "react";
import type {
  CatalogoCompleto,
  PrendaItem,
  UpdatePrenda,
} from "@/types/prendas";
import { valorEfectivo } from "@/domain/calculoPrecios";
import { CeldaEditable } from "./CeldaEditable";
import styles from "./TablaPrendas.module.css";

export interface FilaAtributosProps {
  prenda: PrendaItem;
  index: number;
  catalogo: CatalogoCompleto;
  onActualizarPrenda: (idPrenda: string, update: UpdatePrenda) => void;
}

const ATRIBUTOS_CONFIG = ["CORTE", "CUELLO", "TELA", "ACABADO"] as const;

export function FilaAtributos({
  prenda,
  index,
  catalogo,
  onActualizarPrenda,
}: FilaAtributosProps) {
  const esObsequioOMuestra = prenda.tipoPrenda !== "VENTA";
  const rowClass = esObsequioOMuestra
    ? styles.filaObsequio
    : index % 2 === 0
    ? styles.filaPar
    : styles.filaImpar;

  const totalExcepciones = prenda.valores.filter(
    (v) => v.origen === "EXCEPCION"
  ).length;

  return (
    <tr className={rowClass}>
      <td className={styles.tdIndex}>{index + 1}</td>

      {/* Referencia: nombre en prenda */}
      <td className={styles.tdNombrePrenda}>
        <span className={styles.nombreRef}>{prenda.nombreEnPrenda || "—"}</span>
        {totalExcepciones > 0 && (
          <span className={styles.badgeExcepciones}>
            {totalExcepciones} exc.
          </span>
        )}
      </td>

      {/* Corte, Cuello, Tela, Acabado */}
      {ATRIBUTOS_CONFIG.map((atributo) => {
        const efectivo = valorEfectivo(prenda, atributo);
        const opciones =
          catalogo.atributos.find((a) => a.codigo === atributo)?.valores ?? [];

        return (
          <CeldaEditable
            key={atributo}
            atributo={atributo}
            valor={efectivo?.valor ?? ""}
            opciones={opciones}
            esExcepcion={efectivo?.origen === "EXCEPCION"}
            disabled={!efectivo}
            onCambio={(attr, val) =>
              onActualizarPrenda(prenda.id, {
                tipo: "valor",
                atributo: attr,
                valor: val,
              })
            }
          />
        );
      })}
    </tr>
  );
}