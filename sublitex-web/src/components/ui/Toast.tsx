"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

export type ToastTipo = "exito" | "error" | "info";

export interface Toast {
  id: string;
  tipo: ToastTipo;
  mensaje: string;
}

interface ToastContexto {
  toasts: Toast[];
  agregarToast: (tipo: ToastTipo, mensaje: string) => void;
}

const ToastCtx = createContext<ToastContexto | null>(null);

let _uid = 0;

const COLORES: Record<ToastTipo, string> = {
  exito:
    "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-500/15 dark:text-emerald-300",
  error:
    "border-red-300 bg-red-50 text-red-800 dark:border-red-500/50 dark:bg-red-500/15 dark:text-red-300",
  info:
    "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-500/50 dark:bg-blue-500/15 dark:text-blue-300",
};

const ICONO: Record<ToastTipo, string> = {
  exito: "✓",
  error: "✕",
  info: "i",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const eliminar = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const agregarToast = useCallback(
    (tipo: ToastTipo, mensaje: string) => {
      const id = `toast-${++_uid}`;
      setToasts((prev) => [...prev, { id, tipo, mensaje }]);
      const timer = setTimeout(() => eliminar(id), 5000);
      timers.current.set(id, timer);
    },
    [eliminar]
  );

  const valor = useMemo(() => ({ toasts, agregarToast }), [toasts, agregarToast]);

  return (
    <ToastCtx.Provider value={valor}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notificaciones"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2"
      >
        {toasts.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => eliminar(t.id)}
            className={`pointer-events-auto flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium shadow-lg transition-opacity hover:opacity-80 ${COLORES[t.tipo]}`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                t.tipo === "exito"
                  ? "bg-emerald-600 dark:bg-emerald-500"
                  : t.tipo === "error"
                  ? "bg-red-600 dark:bg-red-500"
                  : "bg-blue-600 dark:bg-blue-500"
              }`}
              aria-hidden="true"
            >
              {ICONO[t.tipo]}
            </span>
            {t.mensaje}
          </button>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast(): ToastContexto {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}