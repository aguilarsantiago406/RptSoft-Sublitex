"use client";

import { useState } from "react";
import type { UbicacionEstampadoDto } from "@/services/contrato";

interface UbicacionesEstampadoProps {
  ubicaciones: UbicacionEstampadoDto[];
}

export function UbicacionesEstampado({ ubicaciones }: UbicacionesEstampadoProps) {
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  const copiarTexto = async (id: string, texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiadoId(id);
      setTimeout(() => setCopiadoId(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900">Ubicaciones y Textos de Estampado</h2>
        <span className="text-xs text-zinc-500">
          Textos literales oficiales para producción
        </span>
      </div>

      <div className="flex flex-col divide-y divide-zinc-100">
        {ubicaciones.map((ubicacion) => {
          const lleva = ubicacion.lleva;
          const tieneContenido = Boolean(ubicacion.contenido && ubicacion.contenido.trim().length > 0);
          const sinDefinir = lleva && !tieneContenido;

          return (
            <div
              key={ubicacion.id}
              className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
            >
              {/* Etiqueta e indicador de si lleva */}
              <div className="flex items-center gap-2 sm:w-48 sm:shrink-0">
                <span className="text-sm font-semibold text-zinc-900">
                  {ubicacion.etiqueta}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                    lleva
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {lleva ? "Lleva: Sí" : "No"}
                </span>
              </div>

              {/* Contenido literal y botón de copia */}
              <div className="flex flex-1 items-center justify-between gap-3">
                {lleva ? (
                  sinDefinir ? (
                    <span className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-800">
                      SIN DEFINIR
                    </span>
                  ) : (
                    <div className="flex flex-1 items-center justify-between gap-3 rounded-md bg-zinc-50 px-3 py-2 border border-zinc-200">
                      <p className="font-mono text-xs text-zinc-800 break-words">
                        {ubicacion.contenido}
                      </p>
                      <button
                        type="button"
                        onClick={() => copiarTexto(ubicacion.id, ubicacion.contenido!)}
                        className={`shrink-0 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                          copiadoId === ubicacion.id
                            ? "bg-emerald-600 text-white"
                            : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
                        }`}
                        title="Copiar texto exacto"
                      >
                        {copiadoId === ubicacion.id ? "✓ Copiado" : "Copiar"}
                      </button>
                    </div>
                  )
                ) : (
                  <span className="text-xs text-zinc-400 italic">No aplica</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
