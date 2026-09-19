"use client";

import { useMemo, useState } from "react";
import { obtenerListaPedidos, ErrorApi } from "@/services/cliente";
import { adaptarListaPedidos } from "@/services/adaptador";
import { useAsync } from "@/components/ui/use-async";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilaPedido } from "@/components/pedidos/FilaPedido";
import { FiltroEstado, type FiltroEstadoValor } from "@/components/pedidos/FiltroEstado";
import type { PedidoListaPresentacion } from "@/types/presentacion";

export function ListaPedidos() {
  const { datos, error, cargando, recargar } = useAsync(obtenerListaPedidos);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoValor>("Todos");

  const pedidosPresentacion: PedidoListaPresentacion[] = useMemo(() => {
    if (!datos) return [];
    return adaptarListaPedidos(datos);
  }, [datos]);

  const pedidosFiltrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    return pedidosPresentacion.filter((pedido) => {
      const coincideTexto =
        query === "" ||
        pedido.codigo.toLowerCase().includes(query) ||
        pedido.clienteGrupo.toLowerCase().includes(query);

      const coincideEstado =
        filtroEstado === "Todos" || pedido.estado === filtroEstado;

      return coincideTexto && coincideEstado;
    });
  }, [pedidosPresentacion, busqueda, filtroEstado]);

  return (
    <div className="flex flex-col gap-5">
      {/* Barra de control: Buscador y Filtro por estado */}
      <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código (ej. SUB-000842) o cliente..."
            aria-label="Buscar pedidos"
            className="w-full rounded-md border border-zinc-300 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>
        <FiltroEstado valor={filtroEstado} onCambio={setFiltroEstado} />
      </div>

      {/* Estados asíncronos */}
      {cargando && <Spinner />}

      {error && (
        <ErrorBanner
          error={
            error instanceof ErrorApi
              ? error
              : new ErrorApi("R-CONTRATO", error.message, 502)
          }
          alReintentar={recargar}
        />
      )}

      {/* Lista de resultados */}
      {!cargando && !error && (
        <>
          {pedidosFiltrados.length === 0 ? (
            <EmptyState mensaje="No se encontraron pedidos con los criterios especificados." />
          ) : (
            <div className="flex flex-col gap-2">
              {/* Encabezado de columnas */}
              <div
                className="hidden grid-cols-[minmax(120px,1.2fr)_minmax(180px,2fr)_minmax(150px,1.5fr)_110px_130px] items-center gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:grid"
                aria-hidden="true"
              >
                <span>Código</span>
                <span>Cliente / Grupo</span>
                <span>Producto Principal</span>
                <span>Fecha</span>
                <span>Estado</span>
              </div>

              {/* Filas */}
              <div className="flex flex-col gap-2" role="feed" aria-label="Lista de pedidos">
                {pedidosFiltrados.map((pedido) => (
                  <FilaPedido key={pedido.id} pedido={pedido} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
