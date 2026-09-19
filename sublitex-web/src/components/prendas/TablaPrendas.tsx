"use client";

import { useMemo, useState } from "react";
import type { CatalogosDto } from "@/services/contrato";
import type { PrendaPresentacion } from "@/types/presentacion";
import { FilaPrenda } from "@/components/prendas/FilaPrenda";
import { BarraBom } from "@/components/prendas/BarraBom";
import { EditorPrenda } from "@/components/prendas/EditorPrenda";

interface TablaPrendasProps {
  prendas: PrendaPresentacion[];
  catalogos: CatalogosDto;
  onRecargar?: () => void;
}

export function TablaPrendas({ prendas, catalogos, onRecargar }: TablaPrendasProps) {
  const [busqueda, setBusqueda] = useState("");
  const [soloIncompletas, setSoloIncompletas] = useState(false);
  const [prendaEditando, setPrendaEditando] = useState<PrendaPresentacion | null>(null);

  const prendasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return prendas.filter((p) => {
      const coincideTexto =
        q === "" ||
        p.nombreEnPrenda.toLowerCase().includes(q) ||
        p.nombrePersona.toLowerCase().includes(q) ||
        (p.numero && p.numero.toLowerCase().includes(q));

      const coincideFiltro = !soloIncompletas || p.queFalta.length > 0;

      return coincideTexto && coincideFiltro;
    });
  }, [prendas, busqueda, soloIncompletas]);

  const incompletasTotal = useMemo(
    () => prendas.filter((p) => p.queFalta.length > 0).length,
    [prendas],
  );

  const handleGuardado = () => {
    setPrendaEditando(null);
    if (onRecargar) {
      onRecargar();
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Barra BOM superior (R-K03) */}
      <BarraBom prendas={prendas} />

      {/* Controles de búsqueda y filtros */}
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3 sm:max-w-md">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre en prenda, persona o dorsal..."
            aria-label="Buscar en prendas"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 cursor-pointer">
            <input
              type="checkbox"
              checked={soloIncompletas}
              onChange={(e) => setSoloIncompletas(e.target.checked)}
              className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
            />
            <span>Solo incompletas ({incompletasTotal})</span>
          </label>
          <span className="text-xs text-zinc-400">
            Mostrando {prendasFiltradas.length} de {prendas.length} prendas
          </span>
        </div>
      </div>

      {/* Tabla con scroll horizontal para 26 columnas */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse min-w-[2100px]">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              <th className="px-3 py-3 text-center">N°</th>
              <th className="px-3 py-3">Nombre en Prenda</th>
              <th className="px-3 py-3">Persona</th>
              <th className="px-3 py-3">Producto</th>
              <th className="px-3 py-3 text-center">Talla</th>
              <th className="px-3 py-3 text-center">Dorsal</th>
              <th className="px-3 py-3">Color</th>
              <th className="px-3 py-3 text-center">Género</th>
              <th className="px-3 py-3 text-center">Corte</th>
              <th className="px-3 py-3 text-center">Cuello</th>
              <th className="px-3 py-3 text-center">Tela</th>
              <th className="px-3 py-3 text-center">Escudo</th>
              <th className="px-3 py-3 text-center">Acabado</th>
              <th className="px-3 py-3 text-center">Arquero</th>
              <th className="px-3 py-3 text-center">Tipo</th>
              <th className="px-3 py-3">Personalización</th>
              <th className="px-3 py-3 text-right">Base</th>
              <th className="px-3 py-3 text-right">Rec. Talla</th>
              <th className="px-3 py-3 text-right">Rec. Tela</th>
              <th className="px-3 py-3 text-right">Rec. Cuello</th>
              <th className="px-3 py-3 text-right">Rec. Acab.</th>
              <th className="px-3 py-3 text-right bg-zinc-100/60 font-black">P. Unitario</th>
              <th className="px-2 py-3 text-center">Cam.</th>
              <th className="px-2 py-3 text-center">Sho.</th>
              <th className="px-2 py-3 text-center">Med.</th>
              <th className="px-3 py-3">Qué Falta</th>
              <th className="px-3 py-3 text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {prendasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={27} className="p-8 text-center text-sm text-zinc-500">
                  No se encontraron prendas que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              prendasFiltradas.map((prenda, idx) => (
                <FilaPrenda
                  key={prenda.id}
                  prenda={prenda}
                  indice={idx}
                  onEditar={() => setPrendaEditando(prenda)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de edición de ficha mínima (PATCH) */}
      {prendaEditando && (
        <EditorPrenda
          prenda={prendaEditando}
          catalogos={catalogos}
          onCerrar={() => setPrendaEditando(null)}
          onGuardado={handleGuardado}
        />
      )}
    </div>
  );
}
