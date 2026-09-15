"use client";

import { useEffect, useState } from "react";
import type { EstadoPedido } from "@/types/pedidos";
import { leerMensajeError } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

interface ModalNuevoPedidoProps {
  abierto: boolean;
  onCerrar: () => void;
  onCreate: () => void;
}

const ESTADOS: EstadoPedido[] = [
  "BORRADOR",
  "EN_CONFIGURACION",
  "EN_RECOLECCION",
  "EN_REVISION",
  "CERRADO",
  "EN_PRODUCCION",
  "ENTREGADO",
  "CANCELADO",
];

const inputBase =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 dark:[color-scheme:dark] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500";

export function ModalNuevoPedido({ abierto, onCerrar, onCreate }: ModalNuevoPedidoProps) {
  const { agregarToast } = useToast();
  const [enviando, setEnviando] = useState(false);
  const [clienteNombre, setClienteNombre] = useState("");
  const [estado, setEstado] = useState<EstadoPedido>("BORRADOR");
  const [fechaCompromiso, setFechaCompromiso] = useState("");
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCerrar]);

  if (!abierto) return null;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;

    setEnviando(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteNombre,
          estado,
          fechaCompromiso: fechaCompromiso ? new Date(fechaCompromiso).toISOString() : null,
          observaciones,
        }),
      });

      if (!res.ok) {
        throw new Error(await leerMensajeError(res));
      }

      agregarToast("exito", `Pedido creado correctamente`);
      onCreate();
      setClienteNombre("");
      setFechaCompromiso("");
      setObservaciones("");
      setEstado("BORRADOR");
      onCerrar();
    } catch (err) {
      agregarToast(
        "error",
        err instanceof Error ? err.message : "No se pudo crear el pedido"
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Nuevo pedido"
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/80 dark:backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Nuevo pedido
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={enviar} className="space-y-4">
          <div>
            <label
              htmlFor="nuevo-cliente"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Cliente *
            </label>
            <input
              id="nuevo-cliente"
              type="text"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              placeholder="Nombre del cliente o institución"
              required
              minLength={3}
              className={inputBase}
            />
          </div>

          <div>
            <label
              htmlFor="nuevo-estado"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Estado
            </label>
            <select
              id="nuevo-estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoPedido)}
              className={`${inputBase} dark:[color-scheme:dark]`}
            >
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="nuevo-entrega"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Fecha de entrega
            </label>
            <input
              id="nuevo-entrega"
              type="date"
              value={fechaCompromiso}
              onChange={(e) => setFechaCompromiso(e.target.value)}
              className={inputBase}
            />
          </div>

          <div>
            <label
              htmlFor="nuevo-obs"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Observaciones
            </label>
            <textarea
              id="nuevo-obs"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              className={inputBase}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? "Creando…" : "Crear pedido"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}