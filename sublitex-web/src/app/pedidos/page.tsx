"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { EstadoPedido, PedidoResumen } from "@/types/pedidos";
import { ESTADO_LABEL, ESTADO_BADGE, ESTADOS_PEDIDO } from "@/lib/estados";
import { leerMensajeError } from "@/lib/api";
import { ModalNuevoPedido } from "@/components/pedidos/ModalNuevoPedido";

export default function ListaPedidos() {
  const [pedidos, setPedidos] = useState<PedidoResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | "TODOS">("TODOS");
  const [modalAbierto, setModalAbierto] = useState(false);

  const [recargando, setRecargando] = useState(false);

  function cargar() {
    setRecargando(true);
    fetch("/api/pedidos")
      .then((res) => {
        if (!res.ok) return leerMensajeError(res).then((m) => { throw new Error(m); });
        return res.json() as Promise<PedidoResumen[]>;
      })
      .then((data) => {
        setPedidos(data);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => {
        setCargando(false);
        setRecargando(false);
      });
  }

  useEffect(() => {
    let montado = true;
    (async () => {
      try {
        const res = await fetch("/api/pedidos");
        if (!res.ok) throw new Error(await leerMensajeError(res));
        const data = (await res.json()) as PedidoResumen[];
        if (montado) {
          setPedidos(data);
          setError(null);
        }
      } catch (err) {
        if (montado) setError(err instanceof Error ? err.message : "Error inesperado");
      } finally {
        if (montado) setCargando(false);
      }
    })();
    return () => {
      montado = false;
    };
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return pedidos.filter((p) => {
      const coincideBusqueda =
        !q ||
        p.codigo.toLowerCase().includes(q) ||
        p.cliente.nombre.toLowerCase().includes(q);
      const coincideEstado =
        filtroEstado === "TODOS" || p.estado === filtroEstado;
      return coincideBusqueda && coincideEstado;
    });
  }, [pedidos, busqueda, filtroEstado]);

  return (
    <main className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Pedidos
        </h1>
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          + Nuevo pedido
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por código o cliente…"
          className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400/30 dark:[color-scheme:dark] dark:border-slate-700/60 dark:bg-slate-800/90 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as EstadoPedido | "TODOS")}
          aria-label="Filtrar por estado"
          className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-400/30 dark:[color-scheme:dark] dark:border-slate-700/60 dark:bg-slate-800/90 dark:text-slate-100"
        >
          <option value="TODOS">Todos los estados</option>
          {ESTADOS_PEDIDO.map((e) => (
            <option key={e} value={e}>
              {ESTADO_LABEL[e]}
            </option>
          ))}
        </select>
        {(busqueda || filtroEstado !== "TODOS") && (
          <button
            type="button"
            onClick={() => {
              setBusqueda("");
              setFiltroEstado("TODOS");
            }}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Limpiar
          </button>
        )}
        {recargando && (
          <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
            Actualizando…
          </span>
        )}
      </div>

      {cargando && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 dark:backdrop-blur-md dark:text-slate-400">
          Cargando pedidos desde la API…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-300">
          Error: {error}
        </div>
      )}

      {!cargando && !error && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 dark:backdrop-blur-md dark:shadow-none">
          {filtrados.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Sin resultados con los filtros seleccionados.
            </div>
          ) : (
            <table className="w-full border-collapse text-sm text-slate-800 dark:text-slate-200">
              <thead>
                <tr className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-900/90 dark:text-slate-300">
                  <th className="px-4 py-2.5">Código</th>
                  <th className="px-4 py-2.5">Cliente</th>
                  <th className="px-4 py-2.5">Estado</th>
                  <th className="px-4 py-2.5 text-center">Prendas</th>
                  <th className="px-4 py-2.5">Entrega</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p, i) => {
                  const { chip, dot } = ESTADO_BADGE[p.estado];
                  return (
                    <tr
                      key={p.id}
                      className={`border-b border-slate-200 transition-colors hover:bg-slate-50 dark:border-slate-700/60 dark:hover:bg-slate-800/60 ${
                        i % 2 === 0
                          ? "bg-white dark:bg-transparent"
                          : "bg-slate-50 dark:bg-slate-800/40"
                      }`}
                    >
                      <td className="px-4 py-2.5 font-mono font-semibold">
                        {p.codigo}
                      </td>
                      <td className="px-4 py-2.5">{p.cliente.nombre}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${chip}`}
                        >
                          <span
                            className={`inline-block h-1.5 w-1.5 rounded-full ring-1 ring-black/5 dark:ring-white/10 ${dot}`}
                            aria-hidden="true"
                          />
                          {ESTADO_LABEL[p.estado]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center tabular-nums">
                        {p.totalPrendas > 0 ? p.totalPrendas : "—"}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-slate-600 dark:text-slate-300">
                        {p.fechaCompromiso
                          ? new Date(p.fechaCompromiso).toLocaleDateString("es-PE", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Sin fecha"}
                      </td>
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/pedidos/${p.id}`}
                          className="inline-block rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      <ModalNuevoPedido
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onCreate={cargar}
      />
    </main>
  );
}