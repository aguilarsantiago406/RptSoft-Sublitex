"use client";

import type { PedidoEstadoDto } from "@/services/contrato";

export type FiltroEstadoValor = PedidoEstadoDto | "Todos";

const ESTADOS: readonly FiltroEstadoValor[] = [
  "Todos",
  "Borrador",
  "En Revisión",
  "Confirmado",
  "En Producción",
];

interface FiltroEstadoProps {
  valor: FiltroEstadoValor;
  onCambio: (estado: FiltroEstadoValor) => void;
}

export function FiltroEstado({ valor, onCambio }: FiltroEstadoProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtro por estado de pedido">
      {ESTADOS.map((estado) => {
        const activo = valor === estado;
        return (
          <button
            key={estado}
            type="button"
            onClick={() => onCambio(estado)}
            aria-pressed={activo}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activo
                ? "bg-zinc-900 text-white shadow-xs"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            {estado}
          </button>
        );
      })}
    </div>
  );
}
