import type { PrendaPresentacion } from "@/types/presentacion";
import { calcularBom, desglosarProductos } from "@/domain/bom";

interface BarraBomProps {
  prendas: PrendaPresentacion[];
}

export function BarraBom({ prendas }: BarraBomProps) {
  const prendasParaBom = prendas.map((p) => ({
    tipoProductoId: p.tipoProductoId,
    nombre: p.productoNombre,
    componentes: {
      camisetas: p.camisetas,
      shorts: p.shorts,
      medias: p.medias,
    },
  }));

  const bom = calcularBom(prendasParaBom);
  const desglose = desglosarProductos(prendasParaBom);
  const importeTotal = prendas.reduce((acc, p) => acc + p.precioUnitario, 0);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-900 p-5 text-white shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Desglose Físico de Producción (BOM · Regla R-K03)
          </span>
          <h3 className="text-lg font-bold text-white">
            {bom.totalPrendas} Prendas Registradas
          </h3>
        </div>

        <div className="text-right">
          <span className="block text-xs font-medium uppercase text-zinc-400">
            Importe Estimado (Sin IGV)
          </span>
          <span className="font-mono text-xl font-bold text-emerald-400">
            S/ {importeTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Piezas físicas calculadas (Multiplicando por componentes de producto) */}
      <div className="grid grid-cols-3 gap-3 border-t border-zinc-800 pt-3">
        <div className="rounded-lg bg-zinc-800/80 p-3 text-center border border-zinc-700/50">
          <span className="block text-xs font-medium text-zinc-400 uppercase">
            Camisetas
          </span>
          <span className="font-mono text-2xl font-black text-white">
            {bom.piezas.camisetas}
          </span>
          <span className="block text-[11px] text-zinc-400">piezas a cortar</span>
        </div>

        <div className="rounded-lg bg-zinc-800/80 p-3 text-center border border-zinc-700/50">
          <span className="block text-xs font-medium text-zinc-400 uppercase">
            Shorts
          </span>
          <span className="font-mono text-2xl font-black text-white">
            {bom.piezas.shorts}
          </span>
          <span className="block text-[11px] text-zinc-400">piezas a confeccionar</span>
        </div>

        <div className="rounded-lg bg-zinc-800/80 p-3 text-center border border-zinc-700/50">
          <span className="block text-xs font-medium text-zinc-400 uppercase">
            Medias
          </span>
          <span className="font-mono text-2xl font-black text-white">
            {bom.piezas.medias}
          </span>
          <span className="block text-[11px] text-zinc-400">pares</span>
        </div>
      </div>

      {/* Resumen por tipo de producto */}
      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800/60 pt-3 text-xs text-zinc-300">
        <span className="font-medium text-zinc-400">Desglose comercial:</span>
        {desglose.map((prod) => (
          <span
            key={prod.tipoProductoId}
            className="rounded bg-zinc-800 px-2 py-0.5 font-medium text-zinc-200"
          >
            {prod.cantidad} × {prod.nombre}
          </span>
        ))}
      </div>
    </div>
  );
}
