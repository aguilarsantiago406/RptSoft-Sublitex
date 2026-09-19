import type { PedidoEstadoDto } from "@/services/contrato";

const COLORES: Record<PedidoEstadoDto, string> = {
  Borrador: "bg-zinc-100 text-zinc-700 border-zinc-300",
  "En Revisión": "bg-amber-100 text-amber-800 border-amber-300",
  Confirmado: "bg-blue-100 text-blue-800 border-blue-300",
  "En Producción": "bg-emerald-100 text-emerald-800 border-emerald-300",
};

export function Badge({ estado }: { estado: PedidoEstadoDto }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${COLORES[estado] ?? "bg-zinc-100 text-zinc-700 border-zinc-300"}`}>
      {estado}
    </span>
  );
}