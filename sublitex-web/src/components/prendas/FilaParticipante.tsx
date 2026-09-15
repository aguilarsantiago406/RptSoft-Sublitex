"use client";

import React from "react";
import type {
  CatalogoCompleto,
  ColorPedido,
  PrendaItem,
  UpdatePrenda,
} from "@/types/prendas";
import { CeldaEditable } from "./CeldaEditable";
import styles from "./TablaPrendas.module.css";

export interface FilaParticipanteProps {
  prenda: PrendaItem;
  index: number;
  colores: ColorPedido[];
  catalogo: CatalogoCompleto;
  onActualizarPrenda: (idPrenda: string, update: UpdatePrenda) => void;
}

export function FilaParticipante({
  prenda,
  index,
  colores,
  catalogo,
  onActualizarPrenda,
}: FilaParticipanteProps) {
  const esObsequioOMuestra = prenda.tipoPrenda !== "VENTA";

  const tallas =
    catalogo.tallasPorProducto.find((tp) => tp.productoCodigo === prenda.producto)?.tallas ?? [];

  const rowClass = esObsequioOMuestra ? styles.filaObsequio : index % 2 === 0 ? styles.filaPar : styles.filaImpar;

  return (
    <tr className={rowClass}>
      {/* # */}
      <td className={styles.tdIndex}>{index + 1}</td>

      {/* Nombre en prenda */}
      <td className={styles.tdNombrePrenda}>
        <input
          type="text"
          value={prenda.nombreEnPrenda}
          onChange={(e) =>
            onActualizarPrenda(prenda.id, {
              tipo: "texto",
              campo: "nombreEnPrenda",
              valor: e.target.value.toUpperCase(),
            })
          }
          placeholder="EN PRENDA"
          className={`${styles.input} ${styles.inputBold}`}
        />
      </td>

      {/* Nombre de la persona */}
      <td className={styles.tdNombrePersona}>
        <input
          type="text"
          value={prenda.nombrePersona}
          onChange={(e) =>
            onActualizarPrenda(prenda.id, {
              tipo: "texto",
              campo: "nombrePersona",
              valor: e.target.value,
            })
          }
          placeholder="Nombre completo"
          className={styles.input}
        />
      </td>

      {/* Producto */}
      <td className={styles.td}>
        <select
          value={prenda.producto}
          onChange={(e) =>
            onActualizarPrenda(prenda.id, {
              tipo: "texto",
              campo: "producto",
              valor: e.target.value,
            })
          }
          className={styles.select}
        >
          {catalogo.productos.map((p) => (
            <option key={p.codigo} value={p.codigo}>
              {p.nombre}
            </option>
          ))}
        </select>
      </td>

      {/* Talla */}
      <td className={styles.tdCenter}>
        <select
          value={prenda.talla}
          onChange={(e) =>
            onActualizarPrenda(prenda.id, {
              tipo: "texto",
              campo: "talla",
              valor: e.target.value,
            })
          }
          className={`${styles.select} ${styles.selectTalla}`}
        >
          {tallas.map((t) => (
            <option key={t.codigo} value={t.codigo}>
              {t.etiqueta}
            </option>
          ))}
        </select>
      </td>

      {/* Número */}
      <td className={styles.tdNumero}>
        <input
          type="text"
          value={prenda.numero}
          onChange={(e) =>
            onActualizarPrenda(prenda.id, {
              tipo: "texto",
              campo: "numero",
              valor: e.target.value,
            })
          }
          placeholder="S/N"
          className={`${styles.input} ${styles.inputNumero}`}
        />
      </td>

      {/* Color */}
      <td className={styles.td}>
        <div className={styles.colorWrapper}>
          {prenda.color && (
            <span
              className={styles.colorSwatch}
              style={{ backgroundColor: prenda.color.codigoHex }}
            />
          )}
          <select
            value={prenda.color?.id ?? ""}
            onChange={(e) => {
              const color = colores.find((c) => c.id === e.target.value);
              if (color) {
                onActualizarPrenda(prenda.id, { tipo: "color", color });
              }
            }}
            className={styles.select}
          >
            {colores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </td>

      {/* Género */}
      <td className={styles.td}>
        <select
          value={prenda.genero}
          onChange={(e) =>
            onActualizarPrenda(prenda.id, {
              tipo: "texto",
              campo: "genero",
              valor: e.target.value,
            })
          }
          className={styles.select}
        >
          {catalogo.generos.map((g) => (
            <option key={g} value={g}>
              {g === "SIN_ESPECIFICAR" ? "SIN ESPECIFICAR" : g}
            </option>
          ))}
        </select>
      </td>

      {/* Arquero */}
      <td className={styles.tdCenter}>
        <input
          type="checkbox"
          checked={prenda.esArquero}
          onChange={(e) =>
            onActualizarPrenda(prenda.id, {
              tipo: "booleano",
              campo: "esArquero",
              valor: e.target.checked,
            })
          }
          className={styles.checkbox}
        />
      </td>

      {/* Tipo */}
      <td className={styles.td}>
        <select
          value={prenda.tipoPrenda}
          onChange={(e) =>
            onActualizarPrenda(prenda.id, {
              tipo: "texto",
              campo: "tipoPrenda",
              valor: e.target.value,
            })
          }
          className={`${styles.select} ${
            esObsequioOMuestra ? styles.selectTipoObsequio : styles.selectTipoVenta
          }`}
        >
          {catalogo.tiposPrenda.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </td>

      {/* Personalización */}
      <td className={styles.tdPersonalizacion}>
        {prenda.personalizaciones.length > 0 ? (
          prenda.personalizaciones.map((p) => (
            <span key={p.ubicacion} className={styles.personalizacionItem}>
              {p.ubicacion}: {p.contenido}
            </span>
          ))
        ) : (
          <span className={styles.sinPersonalizacion}>Sin personalización</span>
        )}
      </td>
    </tr>
  );
}