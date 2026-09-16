"use client";

import React from "react";
import type {
  CatalogoCompleto,
  ColorPedido,
  PrendaItem,
  UpdatePrenda,
} from "@/types/prendas";
import styles from "./TablaPrendas.module.css";

export interface TarjetaParticipanteProps {
  prenda: PrendaItem;
  index: number;
  colores: ColorPedido[];
  catalogo: CatalogoCompleto;
  onActualizarPrenda: (idPrenda: string, update: UpdatePrenda) => void;
}

export function TarjetaParticipante({
  prenda,
  index,
  colores,
  catalogo,
  onActualizarPrenda,
}: TarjetaParticipanteProps) {
  const esObsequioOMuestra = prenda.tipoPrenda !== "VENTA";
  const excepciones = prenda.valores.filter((v) => v.origen === "EXCEPCION").length;

  const tallas =
    catalogo.tallasPorProducto.find((tp) => tp.productoCodigo === prenda.producto)?.tallas ?? [];

  const cardClass = [
    styles.card,
    esObsequioOMuestra ? styles.cardObsequio : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClass}>
      {/* Header: índice + nombre en prenda + excepciones */}
      <header className={styles.cardHeader}>
        <span className={styles.cardIndex}>{index + 1}</span>
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
          className={`${styles.input} ${styles.inputBold} ${styles.cardNombre}`}
        />
        {excepciones > 0 && (
          <span className={styles.badgeExcepciones} title="Excepciones de confección">
            {excepciones} exc.
          </span>
        )}
      </header>

      {/* Persona */}
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
        className={`${styles.input} ${styles.cardPersona}`}
      />

      {/* Datos principales */}
      <div className={styles.cardFields}>
        <label className={styles.cardField}>
          <span className={styles.cardFieldLabel}>Producto</span>
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
        </label>

        <label className={styles.cardField}>
          <span className={styles.cardFieldLabel}>Talla</span>
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
        </label>

        <label className={styles.cardField}>
          <span className={styles.cardFieldLabel}>Número</span>
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
            className={`${styles.input} ${styles.inputNumero} ${styles.inputCard}`}
          />
        </label>

        <label className={styles.cardField}>
          <span className={styles.cardFieldLabel}>Género</span>
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
        </label>
      </div>

      {/* Color */}
      <div className={styles.cardColor}>
        <span className={styles.cardFieldLabel}>Color</span>
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
      </div>

      {/* Footer: tipo + arquero */}
      <footer className={styles.cardFooter}>
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
          title="Tipo de prenda"
        >
          {catalogo.tiposPrenda.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <label className={styles.cardArquero}>
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
          Arquero
        </label>
      </footer>

      {/* Personalización */}
      {prenda.personalizaciones.length > 0 ? (
        <div className={styles.cardPersonalizacion}>
          {prenda.personalizaciones.map((p) => (
            <span key={p.ubicacion}>
              {p.ubicacion}: {p.contenido}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}