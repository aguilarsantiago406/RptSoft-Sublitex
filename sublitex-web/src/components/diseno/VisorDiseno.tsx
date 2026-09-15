"use client";

import { useState } from "react";
import type { ColorPedido, Personalizacion } from "@/types/prendas";
import type { DisenoPedido, EstadoAprobacionDiseno } from "@/types/pedidos";

type Vista = "FRONTAL" | "DORSAL";

const APROBACION: Record<
  EstadoAprobacionDiseno,
  { etiqueta: string; chip: string; dot: string }
> = {
  PENDIENTE_REVISION: {
    etiqueta: "Pendiente de revisión",
    chip: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  APROBADO: {
    etiqueta: "Aprobado",
    chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
    dot: "bg-emerald-600 dark:bg-emerald-400",
  },
  POR_CORREGIR: {
    etiqueta: "Por corregir",
    chip: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
    dot: "bg-red-600 dark:bg-red-400",
  },
};

function esClaro(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

const card =
  "rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-md";

export function VisorDiseno({
  diseno,
  colores,
  nombreEnPrenda,
  numero,
  personalizaciones,
}: {
  diseno: DisenoPedido;
  colores: ColorPedido[];
  nombreEnPrenda: string;
  numero: string;
  personalizaciones: Personalizacion[];
}) {
  const [vista, setVista] = useState<Vista>("FRONTAL");
  const [colorId, setColorId] = useState(colores[0]?.id ?? "");

  const color = colores.find((c) => c.id === colorId);
  const relleno = color?.codigoHex ?? "#F7F4F2";
  const tinta = esClaro(relleno) ? "#0f172a" : "#f8fafc";
  const aprobacion = APROBACION[diseno.estadoAprobacion];

  const personalizacionesVisibles = personalizaciones
    .filter((p) =>
      vista === "FRONTAL"
        ? p.ubicacion.toUpperCase().includes("DELANTERO") ||
          !p.ubicacion.toUpperCase().includes("ESPALDA")
        : p.ubicacion.toUpperCase().includes("ESPALDA") ||
          p.ubicacion.toUpperCase().includes("DORSAL")
    )
    .map((p) => p.contenido);

  return (
    <section
      aria-label="Bloque de diseño y mockup"
      className={`${card} p-4`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Diseño &amp; Mockup
        </h2>
        <span
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${aprobacion.chip}`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${aprobacion.dot}`}
            aria-hidden="true"
          />
          {aprobacion.etiqueta}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="flex flex-col items-center gap-3">
          {/* Selector de vista */}
          <div
            role="tablist"
            aria-label="Vista del diseño"
            className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-800/60"
          >
            {(["FRONTAL", "DORSAL"] as Vista[]).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={vista === v}
                onClick={() => setVista(v)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  vista === v
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {v === "FRONTAL" ? "vista frontal" : "vista dorsal"}
              </button>
            ))}
          </div>

          <svg
            viewBox="0 0 200 220"
            role="img"
            aria-label={`Diseño del uniforme — vista ${vista === "FRONTAL" ? "frontal" : "dorsal"}`}
            className="w-full max-w-[260px] drop-shadow-sm"
          >
            {/* Cuerpo de la prenda */}
            <path
              d="M100 22 C120 22 137 32 140 50 L162 44 C168 42 172 48 168 53 L150 72 C150 76 156 78 156 82 L140 84 L140 178 C140 182 136 186 132 186 L68 186 C64 186 60 182 60 178 L60 84 L44 82 C44 78 50 76 50 72 L32 53 C28 48 32 42 38 44 L60 50 C63 32 80 22 100 22 Z"
              fill={relleno}
              stroke={tinta}
              strokeWidth="2"
            />
            {/* Cuello */}
            <path
              d="M84 26 Q100 44 116 26"
              fill="none"
              stroke={tinta}
              strokeWidth="3"
              opacity="0.9"
            />

            {vista === "FRONTAL" ? (
              <>
                {/* Escudo en pecho izquierdo */}
                <circle cx="72" cy="70" r="9" fill="none" stroke={tinta} strokeWidth="1.5" />
                <text
                  x="72"
                  y="74"
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill={tinta}
                >
                  ESC
                </text>
                {/* Nombre en pecho */}
                <text
                  x="100"
                  y="120"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="700"
                  fill={tinta}
                  letterSpacing="1"
                >
                  {(nombreEnPrenda || "EN PRENDA").slice(0, 10)}
                </text>
              </>
            ) : (
              <>
                {/* Nombre sobre el dorsal */}
                <text
                  x="100"
                  y="95"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill={tinta}
                  letterSpacing="1"
                >
                  {(nombreEnPrenda || "EN PRENDA").slice(0, 10)}
                </text>
                {/* Dorsal */}
                <text
                  x="100"
                  y="150"
                  textAnchor="middle"
                  fontSize="44"
                  fontWeight="900"
                  fill={tinta}
                >
                  {numero || "?"}
                </text>
              </>
            )}

            {/* Personalizaciones visibles en la vista actual */}
            {personalizacionesVisibles.map((contenido, i) => (
              <text
                key={i}
                x="100"
                y={vista === "FRONTAL" ? 165 - i * 12 : 175 - i * 12}
                textAnchor="middle"
                fontSize="8"
                opacity="0.85"
                fill={tinta}
              >
                {contenido.slice(0, 18)}
              </text>
            ))}
          </svg>

          <p className="max-w-[280px] text-center text-[11px] text-slate-500 dark:text-slate-400">
            {diseno.instrucciones}
          </p>
        </div>

        {/* Muestrario dinámico con HEX */}
        <div className="w-full lg:w-56">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Muestrario de color
          </p>
          <div className="flex flex-row flex-wrap gap-2 lg:flex-col">
            {colores.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColorId(c.id)}
                aria-pressed={colorId === c.id}
                className={`group flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                  colorId === c.id
                    ? "border-emerald-500 bg-slate-50 dark:border-emerald-400/60 dark:bg-slate-800"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                }`}
              >
                <span
                  className="h-6 w-6 shrink-0 rounded-md border border-slate-300 dark:border-slate-600"
                  style={{ backgroundColor: c.codigoHex }}
                  aria-hidden="true"
                />
                <span className="leading-tight">
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {c.nombre}
                  </span>
                  <span className="block font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    {c.codigoHex}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-500">
            Diseñado por {diseno.trabajadoPor} ·{" "}
            {new Date(diseno.ultimaActualizacion).toLocaleDateString("es-PE", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </section>
  );
}