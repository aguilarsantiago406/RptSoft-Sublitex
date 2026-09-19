import type { EnvioProvinciaDto } from "@/services/contrato";

interface EnvioProvinciaProps {
  envio: EnvioProvinciaDto;
  modalidadEntrega: string;
}

interface CampoRotulado {
  label: string;
  valor: string | null | undefined;
}

export function EnvioProvincia({ envio, modalidadEntrega }: EnvioProvinciaProps) {
  const campos: CampoRotulado[] = [
    { label: "1. Nombre Completo", valor: envio.nombreCompleto },
    { label: "2. DNI", valor: envio.dni },
    { label: "3. Celular", valor: envio.celular },
    { label: "4. Ciudad / Destino", valor: envio.ciudadDestino },
    { label: "5. Agencia", valor: envio.agencia },
    { label: "6. Referencia Agencia", valor: envio.referencia },
    { label: "7. Correo Electrónico", valor: envio.correo },
  ];

  const faltantes = campos.filter((c) => !c.valor || c.valor.trim().length === 0);
  const estaCompleto = faltantes.length === 0;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-zinc-900">
            Rotulado de Envío a Provincia
          </h2>
          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
            Modalidad: {modalidadEntrega}
          </span>
        </div>

        <div>
          {estaCompleto ? (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              ✓ Rotulado Completo (7/7)
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
              ⚠ Faltan {faltantes.length} datos de rotulado
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Datos obligatorios para el rotulado de caja y despacho por agencia de transporte.
      </p>

      <div className="grid grid-cols-1 gap-3 border-t border-zinc-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
        {campos.map((campo) => {
          const presente = Boolean(campo.valor && campo.valor.trim().length > 0);

          return (
            <div
              key={campo.label}
              className={`flex flex-col gap-1 rounded-lg border p-3 ${
                presente
                  ? "border-zinc-200 bg-zinc-50/50"
                  : "border-amber-300 bg-amber-50/50"
              }`}
            >
              <span className="text-xs font-medium text-zinc-500 uppercase">
                {campo.label}
              </span>

              {presente ? (
                <span className="font-semibold text-zinc-900 break-words">
                  {campo.valor}
                </span>
              ) : (
                <span className="font-bold text-amber-800 text-xs">
                  PENDIENTE (Dato faltante)
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
