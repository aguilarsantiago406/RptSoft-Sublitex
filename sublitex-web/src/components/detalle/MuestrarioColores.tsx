import type { ColorPedidoDto } from "@/services/contrato";

interface MuestrarioColoresProps {
  colores: ColorPedidoDto[];
}

export function MuestrarioColores({ colores }: MuestrarioColoresProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900">Muestrario de Colores</h2>
        <span className="text-xs text-zinc-500">{colores.length} colores declarados</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {colores.map((color) => {
          const tieneHex = Boolean(color.codigoHex && color.codigoHex.trim().length > 0);

          return (
            <div
              key={color.id}
              className={`flex items-center gap-3.5 rounded-lg border p-3 ${
                tieneHex
                  ? "border-zinc-200 bg-zinc-50/50"
                  : "border-amber-300 bg-amber-50/40"
              }`}
            >
              {/* Muestra visual del color */}
              <div
                className="h-9 w-9 shrink-0 rounded-md border border-zinc-300 shadow-2xs"
                style={
                  tieneHex
                    ? { backgroundColor: color.codigoHex! }
                    : {
                        background:
                          "repeating-linear-gradient(45deg, #f3f4f6, #f3f4f6 4px, #e5e7eb 4px, #e5e7eb 8px)",
                      }
                }
                title={tieneHex ? color.codigoHex! : "Sin código HEX"}
                aria-label={`Muestra de color ${color.nombre}`}
              />

              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-zinc-900">
                    {color.nombre}
                  </span>
                  {tieneHex ? (
                    <span className="font-mono text-xs font-medium text-zinc-600">
                      {color.codigoHex}
                    </span>
                  ) : (
                    <span
                      className="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-900"
                      title="Regla R-K05: Color sin código hexadecimal"
                    >
                      SIN CÓDIGO (R-K05)
                    </span>
                  )}
                </div>

                {color.referencia && (
                  <span className="truncate text-xs text-zinc-500">
                    Ref: {color.referencia}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
