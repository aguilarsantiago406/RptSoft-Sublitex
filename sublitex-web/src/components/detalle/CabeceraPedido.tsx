import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { IdentificacionPedidoDto, PedidoEstadoDto } from "@/services/contrato";

interface CabeceraPedidoProps {
  codigo: string;
  estado: PedidoEstadoDto;
  identificacion: IdentificacionPedidoDto;
}

export function CabeceraPedido({ codigo, estado, identificacion }: CabeceraPedidoProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
      {/* Barra superior de navegación y estado */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/pedidos"
            className="inline-flex items-center text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
          >
            ← Volver a Pedidos
          </Link>
          <span className="text-zinc-300">|</span>
          <span className="font-mono text-lg font-bold tracking-tight text-zinc-900">{codigo}</span>
          <Badge estado={estado} />
        </div>

        <div className="text-xs text-zinc-500">
          Versión Hoja: <span className="font-semibold text-zinc-700">v{identificacion.versionHoja}</span> (
          {identificacion.fechaVersion})
        </div>
      </div>

      {/* Grid de Identificación Comercial */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-zinc-100 pt-4 text-sm sm:grid-cols-3 lg:grid-cols-5">
        <div>
          <span className="block text-xs font-medium text-zinc-400 uppercase">Cliente / Grupo</span>
          <span className="font-semibold text-zinc-900">{identificacion.clienteGrupo}</span>
        </div>

        <div>
          <span className="block text-xs font-medium text-zinc-400 uppercase">RUC / DNI</span>
          <span className="text-zinc-800">{identificacion.rucDni || "—"}</span>
        </div>

        <div>
          <span className="block text-xs font-medium text-zinc-400 uppercase">Coordinador</span>
          <span className="text-zinc-800">{identificacion.coordinadorCliente || "—"}</span>
        </div>

        <div>
          <span className="block text-xs font-medium text-zinc-400 uppercase">Teléfono</span>
          <span className="text-zinc-800">{identificacion.telefono || "—"}</span>
        </div>

        <div>
          <span className="block text-xs font-medium text-zinc-400 uppercase">Vendedora</span>
          <span className="text-zinc-800">{identificacion.vendedora || "—"}</span>
        </div>

        <div>
          <span className="block text-xs font-medium text-zinc-400 uppercase">Fecha Registro</span>
          <span className="text-zinc-700">{identificacion.fecha}</span>
        </div>

        <div>
          <span className="block text-xs font-medium text-zinc-400 uppercase">Fecha Entrega</span>
          <span className="font-medium text-zinc-900">{identificacion.fechaEntrega || "Sin definir"}</span>
        </div>

        <div>
          <span className="block text-xs font-medium text-zinc-400 uppercase">Modalidad</span>
          <span className="text-zinc-800">{identificacion.modalidadEntrega}</span>
        </div>

        <div>
          <span className="block text-xs font-medium text-zinc-400 uppercase">Ciudad</span>
          <span className="text-zinc-800">{identificacion.ciudad}</span>
        </div>

        <div>
          <span className="block text-xs font-medium text-zinc-400 uppercase">N° Pedido Taller</span>
          <span className="font-mono text-zinc-700">{identificacion.numero || "—"}</span>
        </div>
      </div>
    </div>
  );
}
