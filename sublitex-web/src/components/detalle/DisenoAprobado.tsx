import type { PedidoDetallePresentacion } from "@/types/presentacion";

interface DisenoAprobadoProps {
  diseno: PedidoDetallePresentacion["disenoAprobado"];
}

export function DisenoAprobado({ diseno }: DisenoAprobadoProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-zinc-900">Diseño Aprobado</h2>
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className="rounded bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700">
            Mockup v{diseno.versionMockup}
          </span>
          <span>•</span>
          <span>Aprobado por: <strong className="text-zinc-700">{diseno.aprobadoPor || "Sin especificar"}</strong></span>
          <span>•</span>
          <span>{diseno.fechaAprobacion}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-4 text-sm sm:grid-cols-3 lg:grid-cols-4">
        <div>
          <span className="block text-xs font-medium uppercase text-zinc-400">Archivo Mockup</span>
          <span className="font-mono text-xs text-zinc-800 break-all">{diseno.archivoMockup || "—"}</span>
        </div>

        <div>
          <span className="block text-xs font-medium uppercase text-zinc-400">Tela Principal</span>
          <span className="font-medium text-zinc-900">{diseno.temaPrincipal}</span>
        </div>

        <div>
          <span className="block text-xs font-medium uppercase text-zinc-400">Manga</span>
          <span className="text-zinc-800">{diseno.manga}</span>
        </div>

        <div>
          <span className="block text-xs font-medium uppercase text-zinc-400">Cuello Hombres</span>
          <span className="text-zinc-800">{diseno.cuelloHombres}</span>
        </div>

        <div>
          <span className="block text-xs font-medium uppercase text-zinc-400">Cuello Damas</span>
          <span className="text-zinc-800">{diseno.cuelloDamas}</span>
        </div>

        <div>
          <span className="block text-xs font-medium uppercase text-zinc-400">Corte Hombres</span>
          <span className="text-zinc-800">{diseno.corteHombres}</span>
        </div>

        <div>
          <span className="block text-xs font-medium uppercase text-zinc-400">Corte Damas</span>
          <span className="text-zinc-800">{diseno.corteDamas}</span>
        </div>

        <div>
          <span className="block text-xs font-medium uppercase text-zinc-400">Rib Cuello / Rib Mangas</span>
          <span className="text-zinc-800">
            Cuello: {diseno.ribCuelloLabel} · Mangas: {diseno.ribMangasLabel}
          </span>
        </div>

        <div>
          <span className="block text-xs font-medium uppercase text-zinc-400">Acabado de Escudos</span>
          <span className="font-medium text-zinc-900">{diseno.acabadoEscudos}</span>
        </div>

        <div>
          <span className="block text-xs font-medium uppercase text-zinc-400">Tela del Short</span>
          <span className="text-zinc-800">{diseno.shortTela}</span>
        </div>
      </div>
    </div>
  );
}
