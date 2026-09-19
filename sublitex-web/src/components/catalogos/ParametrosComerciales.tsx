import type { ParametrosComercialesDto } from "@/services/contrato";

interface ParametrosComercialesProps {
  parametros: ParametrosComercialesDto;
}

export function ParametrosComerciales({ parametros }: ParametrosComercialesProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div>
        <h2 className="text-base font-bold text-zinc-900">
          Parámetros Comerciales Oficiales
        </h2>
        <p className="text-xs text-zinc-500">
          Políticas comerciales del taller Sublitex SIMS (Sprint 1)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 border-t border-zinc-100 pt-4">
        <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-200/80">
          <span className="block text-xs font-semibold text-zinc-500 uppercase">
            Tasa IGV
          </span>
          <span className="font-mono text-lg font-black text-zinc-900">
            {(parametros.igv * 100).toFixed(0)}%
          </span>
          <span className="block text-[11px] text-zinc-400">Precios base sin IGV</span>
        </div>

        <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-200/80">
          <span className="block text-xs font-semibold text-zinc-500 uppercase">
            Adelanto Estándar
          </span>
          <span className="font-mono text-lg font-black text-zinc-900">
            {(parametros.adelantoEstandar * 100).toFixed(0)}%
          </span>
          <span className="block text-[11px] text-zinc-400">Para iniciar confección</span>
        </div>

        <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-200/80">
          <span className="block text-xs font-semibold text-zinc-500 uppercase">
            Adelanto Excepcional
          </span>
          <span className="font-mono text-lg font-black text-zinc-900">
            {(parametros.adelantoExcepcional * 100).toFixed(0)}%
          </span>
          <span className="block text-[11px] text-zinc-400">Con visto bueno admin</span>
        </div>

        <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-200/80">
          <span className="block text-xs font-semibold text-zinc-500 uppercase">
            Pedido Mínimo
          </span>
          <span className="font-mono text-lg font-black text-zinc-900">
            {parametros.pedidoMinimo} unid.
          </span>
          <span className="block text-[11px] text-zinc-400">Solo unidades de venta</span>
        </div>

        <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-200/80">
          <span className="block text-xs font-semibold text-zinc-500 uppercase">
            Validez Proforma
          </span>
          <span className="font-mono text-lg font-black text-zinc-900">
            {parametros.validezProformaDias} días
          </span>
          <span className="block text-[11px] text-zinc-400">Desde emisión</span>
        </div>
      </div>
    </div>
  );
}
