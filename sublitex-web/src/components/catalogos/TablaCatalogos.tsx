import type { CatalogosDto } from "@/services/contrato";

interface TablaCatalogosProps {
  catalogos: CatalogosDto;
}

export function TablaCatalogos({ catalogos }: TablaCatalogosProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* 1. Productos y Componentes Físicos (R-K03) */}
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-zinc-900">
            Productos y Componentes Físicos (Regla R-K03)
          </h3>
          <p className="text-xs text-zinc-500">
            Piezas físicas multiplicadas para corte y confección en taller
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-[11px] font-bold uppercase text-zinc-500">
                <th className="py-2.5 pr-4">Producto</th>
                <th className="py-2.5 px-3 text-right">Precio Base</th>
                <th className="py-2.5 px-3 text-center">Camisetas</th>
                <th className="py-2.5 px-3 text-center">Shorts</th>
                <th className="py-2.5 px-3 text-center">Medias</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {catalogos.productos.map((prod) => (
                <tr key={prod.id} className="hover:bg-zinc-50/50">
                  <td className="py-2.5 pr-4 font-semibold text-zinc-900">{prod.nombre}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-800">
                    S/ {prod.precioBase.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-zinc-700">
                    {prod.componentes.camisetas}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-zinc-700">
                    {prod.componentes.shorts}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-zinc-700">
                    {prod.componentes.medias}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid de Catálogos de Tarifas y Recargos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tallas y Recargos */}
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
          <h3 className="text-base font-bold text-zinc-900">Tallas y Recargos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-[11px] font-bold uppercase text-zinc-500">
                  <th className="py-2">Talla</th>
                  <th className="py-2 text-center">Tipo</th>
                  <th className="py-2 text-right">Recargo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {catalogos.tallas.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50/50">
                    <td className="py-2 font-mono font-semibold text-zinc-900">{t.etiqueta}</td>
                    <td className="py-2 text-center text-xs text-zinc-500">{t.tipo}</td>
                    <td className="py-2 text-right font-mono text-xs font-bold text-zinc-800">
                      {t.recargo > 0 ? `+S/ ${t.recargo.toFixed(2)}` : "Sin recargo"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Telas y Recargos */}
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
          <h3 className="text-base font-bold text-zinc-900">Telas Oficiales</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-[11px] font-bold uppercase text-zinc-500">
                  <th className="py-2">Tela</th>
                  <th className="py-2 text-right">Recargo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {catalogos.telas.map((tela) => (
                  <tr key={tela.id} className="hover:bg-zinc-50/50">
                    <td className="py-2 font-semibold text-zinc-900">{tela.nombre}</td>
                    <td className="py-2 text-right font-mono text-xs font-bold text-zinc-800">
                      {tela.recargo > 0 ? `+S/ ${tela.recargo.toFixed(2)}` : "Sin recargo"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cuellos y Recargos */}
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
          <h3 className="text-base font-bold text-zinc-900">Cuellos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-[11px] font-bold uppercase text-zinc-500">
                  <th className="py-2">Cuello</th>
                  <th className="py-2 text-right">Recargo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {catalogos.cuellos.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50/50">
                    <td className="py-2 font-semibold text-zinc-900">{c.nombre}</td>
                    <td className="py-2 text-right font-mono text-xs font-bold text-zinc-800">
                      {c.recargo > 0 ? `+S/ ${c.recargo.toFixed(2)}` : "Sin recargo"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Acabados de Escudos */}
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
          <h3 className="text-base font-bold text-zinc-900">Acabados de Escudos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-[11px] font-bold uppercase text-zinc-500">
                  <th className="py-2">Acabado</th>
                  <th className="py-2 text-right">Recargo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {catalogos.acabados.map((a) => (
                  <tr key={a.id} className="hover:bg-zinc-50/50">
                    <td className="py-2 font-semibold text-zinc-900">{a.nombre}</td>
                    <td className="py-2 text-right font-mono text-xs font-bold text-zinc-800">
                      {a.recargo > 0 ? `+S/ ${a.recargo.toFixed(2)}` : "Sin recargo"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Listas Cerradas (Géneros, Cortes, Mangas, Modalidades) */}
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-zinc-900">Listas Cerradas del Sistema</h3>
          <p className="text-xs text-zinc-500">
            Opciones canónicas no modificables por vendedora
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-zinc-100 pt-4 text-xs">
          <div>
            <span className="block font-bold text-zinc-400 uppercase">Géneros</span>
            <ul className="mt-1 space-y-1 text-zinc-700">
              {catalogos.listas.generos.map((g) => (
                <li key={g}>• {g}</li>
              ))}
            </ul>
          </div>

          <div>
            <span className="block font-bold text-zinc-400 uppercase">Cortes</span>
            <ul className="mt-1 space-y-1 text-zinc-700">
              {catalogos.listas.cortes.map((c) => (
                <li key={c}>• {c}</li>
              ))}
            </ul>
          </div>

          <div>
            <span className="block font-bold text-zinc-400 uppercase">Mangas</span>
            <ul className="mt-1 space-y-1 text-zinc-700">
              {catalogos.listas.mangas.map((m) => (
                <li key={m}>• {m}</li>
              ))}
            </ul>
          </div>

          <div>
            <span className="block font-bold text-zinc-400 uppercase">Modalidades Entrega</span>
            <ul className="mt-1 space-y-1 text-zinc-700">
              {catalogos.listas.modalidadesEntrega.map((mod) => (
                <li key={mod}>• {mod}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
