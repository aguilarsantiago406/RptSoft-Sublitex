"use client";

import { useEffect, useState } from "react";
import type { ResumenProduccion } from "@/types/pedidos";
import { leerMensajeError } from "@/lib/api";

interface ResumenProduccionProps {
  pedidoId: string;
}

const tarjeta =
  "rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-md dark:shadow-none";

const valorPrincipal =
  "text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50";

const etiqueta =
  "text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400";

export function PanelResumenProduccion({ pedidoId }: ResumenProduccionProps) {
  const [resumen, setResumen] = useState<ResumenProduccion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let montado = true;

    fetch(`/api/pedidos/${pedidoId}/resumen-produccion`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await leerMensajeError(res));
        return res.json() as Promise<ResumenProduccion>;
      })
      .then((data) => {
        if (montado) {
          setResumen(data);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (montado) setError(err.message);
      })
      .finally(() => {
        if (montado) setCargando(false);
      });

    return () => {
      montado = false;
    };
  }, [pedidoId]);

  return (
    <section
      aria-label="Resumen de producción"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-md dark:shadow-none"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Resumen de producción
        </h2>
        {resumen && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Grupo: {resumen.grupoNombre}
          </span>
        )}
      </div>

      {cargando && (
        <div className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Calculando piezas desde el BOM de la grilla…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-300">
          Error al cargar el resumen: {error}
        </div>
      )}

      {!cargando && !error && resumen && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className={tarjeta}>
              <p className={etiqueta}>Prendas</p>
              <p className={valorPrincipal}>{resumen.totalPrendas}</p>
            </div>
            <div className={tarjeta}>
              <p className={etiqueta}>Camisetas</p>
              <p className={valorPrincipal}>{resumen.camisetas}</p>
            </div>
            <div className={tarjeta}>
              <p className={etiqueta}>Shorts</p>
              <p className={valorPrincipal}>{resumen.shorts}</p>
            </div>
            <div className={tarjeta}>
              <p className={etiqueta}>Medias</p>
              <p className={valorPrincipal}>{resumen.medias}</p>
            </div>
          </div>

          {resumen.porTalla.length > 0 && (
            <div>
              <p className={`${etiqueta} mb-2`}>Desglose por talla</p>
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full border-collapse text-xs text-slate-800 dark:text-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-[10px] uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <th className="border border-slate-200 px-2.5 py-1.5 text-left dark:border-slate-700/60">
                        Talla
                      </th>
                      <th className="border border-slate-200 px-2.5 py-1.5 text-right dark:border-slate-700/60">
                        Prendas
                      </th>
                      <th className="border border-slate-200 px-2.5 py-1.5 text-right dark:border-slate-700/60">
                        Camisetas
                      </th>
                      <th className="border border-slate-200 px-2.5 py-1.5 text-right dark:border-slate-700/60">
                        Shorts
                      </th>
                      <th className="border border-slate-200 px-2.5 py-1.5 text-right dark:border-slate-700/60">
                        Medias
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.porTalla.map((t, i) => (
                      <tr
                        key={t.talla}
                        className={
                          i % 2 === 0
                            ? "bg-white dark:bg-slate-900"
                            : "bg-slate-50 dark:bg-slate-800/50"
                        }
                      >
                        <td className="border border-slate-200 px-2.5 py-1.5 font-semibold dark:border-slate-700/60">
                          {t.talla}
                        </td>
                        <td className="border border-slate-200 px-2.5 py-1.5 text-right tabular-nums dark:border-slate-700/60">
                          {t.prendas}
                        </td>
                        <td className="border border-slate-200 px-2.5 py-1.5 text-right tabular-nums dark:border-slate-700/60">
                          {t.camisetas}
                        </td>
                        <td className="border border-slate-200 px-2.5 py-1.5 text-right tabular-nums dark:border-slate-700/60">
                          {t.shorts}
                        </td>
                        <td className="border border-slate-200 px-2.5 py-1.5 text-right tabular-nums dark:border-slate-700/60">
                          {t.medias}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                Piezas físicas calculadas desde el BOM de cada prenda (R-K03), nunca escritas a
                mano.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}