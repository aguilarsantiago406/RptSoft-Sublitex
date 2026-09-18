"use client";

import React from "react";
import type {
  CatalogoCompleto,
  ColorPedido,
  PrendaItem,
  Tarifa,
  UpdatePrenda,
} from "@/types/prendas";
import { calcularPiezas } from "@/domain/calculoPiezas";
import { calcularPrecio, valorEfectivo } from "@/domain/calculoPrecios";
import { validarPrenda } from "@/domain/validacionPrenda";
import { CeldaEditable } from "./CeldaEditable";
import styles from "./TablaPrendas.module.css";

export interface FilaPrendaProps {
  prenda: PrendaItem;
  index: number;
  colores: ColorPedido[];
  tarifas: Tarifa[];
  catalogo: CatalogoCompleto;
  onActualizarPrenda: (idPrenda: string, update: UpdatePrenda) => void;
}

const ATRIBUTOS_CONFIG = ["CORTE", "CUELLO", "TELA", "ACABADO"] as const;

export function FilaPrenda({
  prenda,
  index,
  colores,
  tarifas,
  catalogo,
  onActualizarPrenda,
}: FilaPrendaProps) {
  const precio = calcularPrecio(prenda, tarifas);
  const piezas = calcularPiezas(prenda.producto, catalogo);
  const faltantes = validarPrenda(prenda, catalogo);
  const esObsequioOMuestra = prenda.tipoPrenda !== "VENTA";

  const tallas =
    catalogo.tallasPorProducto.find((tp) => tp.productoCodigo === prenda.producto)?.tallas ?? [];

  const rowClass = esObsequioOMuestra
    ? styles.filaObsequio
    : index % 2 === 0
    ? styles.filaPar
    : styles.filaImpar;

  return (
    <tr className={rowClass}>
      {/* 1. # */}
      <td className={styles.tdIndex}>{index + 1}</td>

      {/* 2. Nombre en prenda */}
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

      {/* 3. Nombre de la persona */}
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

      {/* 4. Producto */}
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

      {/* 5. Talla */}
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

      {/* 6. Número */}
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

      {/* 7. Color */}
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

      {/* 8. Género */}
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

      {/* 9–12. Corte, Cuello, Tela, Acabado */}
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

      {/* 13. Arquero */}
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

      {/* 14. Tipo */}
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

      {/* 15. Personalización */}
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

      {/* 16. Precio base */}
      <td className={styles.tdRight}>{precio.precioBase.toFixed(2)}</td>

      {/* 17–20. Recargos */}
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

      {/* 21. PRECIO UNIT. */}
      <td
        className={`${styles.tdRight} ${
          esObsequioOMuestra ? styles.precioUnitarioObsequio : styles.precioUnitarioVenta
        }`}
      >
        S/ {precio.precioUnitario.toFixed(2)}
      </td>

      {/* 22–24. Piezas físicas */}
      <td className={styles.tdCenter}>{piezas.camisetas}</td>
      <td className={styles.tdCenter}>{piezas.shorts}</td>
      <td className={styles.tdCenter}>{piezas.medias}</td>

      {/* 25. Qué falta */}
      <td className={`${styles.td} ${faltantes.length > 0 ? styles.faltantesError : styles.faltantesOk}`}>
        {faltantes.length > 0 ? faltantes.join(", ") : "✓"}
      </td>
    </tr>
  );
}
