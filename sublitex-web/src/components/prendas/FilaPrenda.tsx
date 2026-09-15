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

export interface FilaPrendaProps {
  prenda: PrendaItem;
  index: number;
  colores: ColorPedido[];
  tarifas: Tarifa[];
  catalogo: CatalogoCompleto;
  valorHeredadoDe?: (atributo: string) => string | undefined;
  dorsalDuplicado?: boolean;
  onActualizarPrenda: (idPrenda: string, update: UpdatePrenda) => void;
  onEliminarFila?: (idPrenda: string) => void;
}

const ATRIBUTOS_CONFIG = ["CORTE", "CUELLO", "TELA", "ACABADO"] as const;

const td =
  "border border-slate-200 px-2 py-1 text-slate-800 dark:border-slate-700/60 dark:text-slate-200";
const tdCenter =
  "border border-slate-200 px-2 py-1 text-center text-slate-800 dark:border-slate-700/60 dark:text-slate-200";
const tdRight =
  "border border-slate-200 px-2 py-1 text-right tabular-nums text-slate-800 dark:border-slate-700/60 dark:text-slate-200";

const input =
  "w-full rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400/30 dark:[color-scheme:dark] dark:border-slate-700/60 dark:bg-slate-800/90 dark:text-slate-100 dark:placeholder:text-slate-500";

const select =
  "rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] text-slate-800 outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-400/30 dark:[color-scheme:dark] dark:border-slate-700/60 dark:bg-slate-800/90 dark:text-slate-100";

export function FilaPrenda({
  prenda,
  index,
  colores,
  tarifas,
  catalogo,
  valorHeredadoDe,
  dorsalDuplicado,
  onActualizarPrenda,
  onEliminarFila,
}: FilaPrendaProps) {
  const precio = calcularPrecio(prenda, tarifas);
  const piezas = calcularPiezas(prenda.producto, catalogo);
  const faltantes = validarPrenda(prenda, catalogo);
  const esObsequioOMuestra = prenda.tipoPrenda !== "VENTA";

  const tallas =
    catalogo.tallasPorProducto.find((tp) => tp.productoCodigo === prenda.producto)?.tallas ?? [];

  const rowClass = esObsequioOMuestra
    ? "bg-blue-50 dark:bg-sky-950/40"
    : index % 2 === 0
    ? "bg-white dark:bg-slate-900"
    : "bg-slate-50 dark:bg-slate-800/50";

  return (
    <tr className={rowClass}>
      {/* 1. # */}
      <td className="border border-slate-200 px-2 py-1 text-center text-slate-500 dark:border-slate-700/60 dark:text-slate-400">
        {index + 1}
      </td>

      {/* 2. Nombre en prenda */}
      <td className="border border-slate-200 px-2 py-1 dark:border-slate-700/60">
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
          className={`${input} min-w-[110px] font-bold`}
        />
      </td>

      {/* 3. Nombre de la persona */}
      <td className="border border-slate-200 px-2 py-1 dark:border-slate-700/60">
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
          className={`${input} min-w-[130px]`}
        />
      </td>

      {/* 4. Producto */}
      <td className={td}>
        <select
          value={prenda.producto}
          onChange={(e) =>
            onActualizarPrenda(prenda.id, {
              tipo: "texto",
              campo: "producto",
              valor: e.target.value,
            })
          }
          className={select}
        >
          {catalogo.productos.map((p) => (
            <option key={p.codigo} value={p.codigo}>
              {p.nombre}
            </option>
          ))}
        </select>
      </td>

      {/* 5. Talla */}
      <td className={tdCenter}>
        <select
          value={prenda.talla}
          onChange={(e) =>
            onActualizarPrenda(prenda.id, {
              tipo: "texto",
              campo: "talla",
              valor: e.target.value,
            })
          }
          className={`${select} min-w-[46px] text-center font-semibold`}
        >
          {tallas.map((t) => (
            <option key={t.codigo} value={t.codigo}>
              {t.etiqueta}
            </option>
          ))}
        </select>
      </td>

      {/* 6. Número */}
      <td className={dorsalDuplicado ? "border border-red-400 bg-red-50 dark:border-red-500/60 dark:bg-red-500/10" : tdCenter}>
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
          title={dorsalDuplicado ? "Dorsal repetido en el grupo" : "Dorsal"}
          className={`${input} min-w-[48px] text-center ${
            dorsalDuplicado
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/40 dark:border-red-500/70"
              : ""
          }`}
        />
        {dorsalDuplicado && (
          <span className="block text-center text-[9px] font-bold text-red-600 dark:text-red-400">
            repetido
          </span>
        )}
      </td>

      {/* 7. Color */}
      <td className={td}>
        <div className="flex items-center gap-1">
          {prenda.color && (
            <span
              className="h-3 w-3 shrink-0 rounded border border-slate-400 dark:border-slate-500"
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
            className={select}
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
      <td className={td}>
        <select
          value={prenda.genero}
          onChange={(e) =>
            onActualizarPrenda(prenda.id, {
              tipo: "texto",
              campo: "genero",
              valor: e.target.value,
            })
          }
          className={select}
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
            valorHeredado={valorHeredadoDe?.(atributo)}
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
      <td className={tdCenter}>
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
          className="h-3.5 w-3.5 cursor-pointer accent-emerald-700 dark:accent-emerald-400"
        />
      </td>

      {/* 14. Tipo */}
      <td className={td}>
        <select
          value={prenda.tipoPrenda}
          onChange={(e) =>
            onActualizarPrenda(prenda.id, {
              tipo: "texto",
              campo: "tipoPrenda",
              valor: e.target.value,
            })
          }
          className={`${select} font-semibold ${
            esObsequioOMuestra
              ? "text-amber-700 dark:text-amber-300"
              : "text-emerald-700 dark:text-emerald-300"
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
      <td className="border border-slate-200 px-2 py-1 dark:border-slate-700/60">
        {prenda.personalizaciones.length > 0 ? (
          prenda.personalizaciones.map((p) => (
            <span
              key={p.ubicacion}
              className="block text-xs italic text-blue-800 dark:text-blue-300"
            >
              {p.ubicacion}: {p.contenido}
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Sin personalización
          </span>
        )}
      </td>

      {/* 16. Precio base */}
      <td className={tdRight}>{precio.precioBase.toFixed(2)}</td>

      {/* 17–20. Recargos */}
      <td className={`${tdRight} ${precio.recTalla > 0 ? "font-semibold text-amber-700 dark:text-amber-300" : "text-slate-400 dark:text-slate-500"}`}>
        {precio.recTalla > 0 ? `+${precio.recTalla.toFixed(2)}` : "0"}
      </td>
      <td className={`${tdRight} ${precio.recTela > 0 ? "font-semibold text-amber-700 dark:text-amber-300" : "text-slate-400 dark:text-slate-500"}`}>
        {precio.recTela > 0 ? `+${precio.recTela.toFixed(2)}` : "0"}
      </td>
      <td className={`${tdRight} ${precio.recCuello > 0 ? "font-semibold text-amber-700 dark:text-amber-300" : "text-slate-400 dark:text-slate-500"}`}>
        {precio.recCuello > 0 ? `+${precio.recCuello.toFixed(2)}` : "0"}
      </td>
      <td className={`${tdRight} ${precio.recAcabado > 0 ? "font-semibold text-amber-700 dark:text-amber-300" : "text-slate-400 dark:text-slate-500"}`}>
        {precio.recAcabado > 0 ? `+${precio.recAcabado.toFixed(2)}` : "0"}
      </td>

      {/* 21. PRECIO UNIT. */}
      <td
        className={`${tdRight} ${
          esObsequioOMuestra
            ? "font-bold text-slate-500 dark:text-slate-400"
            : "font-bold text-slate-900 dark:text-slate-50"
        }`}
      >
        S/ {precio.precioUnitario.toFixed(2)}
      </td>

      {/* 22–24. Piezas físicas */}
      <td className={tdCenter}>{piezas.camisetas}</td>
      <td className={tdCenter}>{piezas.shorts}</td>
      <td className={tdCenter}>{piezas.medias}</td>

      {/* 25. Qué falta */}
      <td className={`${td} ${
        dorsalDuplicado
          ? "font-bold text-red-700 dark:text-red-400"
          : faltantes.length > 0
          ? "font-bold text-red-700 dark:text-red-400"
          : "text-emerald-700 dark:text-emerald-400"
      }`}>
        {faltantes.length > 0 ? faltantes.join(", ") : dorsalDuplicado ? "dorsal repetido" : "✓"}
      </td>

      {/* 26. Acciones de fila */}
      <td className="border border-slate-200 px-2 py-1 text-center dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => onEliminarFila?.(prenda.id)}
          title="Eliminar esta fila de la grilla"
          aria-label={`Eliminar fila ${index + 1}`}
          className="flex h-5 w-5 items-center justify-center rounded text-slate-400 transition-colors hover:bg-red-100 hover:text-red-700 dark:text-slate-500 dark:hover:bg-red-500/20 dark:hover:text-red-400"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}