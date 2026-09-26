import { Suspense } from "react";
import { PedidosTable } from "@/features/pedidos/components/PedidosTable";
import { PedidosKpis } from "@/features/pedidos/components/PedidosKpis";
import { PedidosFiltros } from "@/features/pedidos/components/PedidosFiltros";
import { NuevoPedidoHeaderAction } from "@/features/pedidos/components/NuevoPedidoHeaderAction";
import { getPedidos, getClientes } from "@/features/pedidos/api/pedidos.api";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import shared from "@/components/ui/table/tableShared.module.css";
import { loadData } from "@/lib/api/loadData";

export const dynamic = "force-dynamic";

interface PedidosPageProps {
  searchParams: Promise<{ estado?: string }>;
}

async function PedidosTableAsync({ estado }: { estado?: string }) {
  const { data, error } = await loadData(() => getPedidos({ estado }));
  return <PedidosTable pedidos={data ?? []} error={error} />;
}

export default async function PedidosPage({ searchParams }: PedidosPageProps) {
  const params = await searchParams;
  const clientesResult = await loadData(() => getClientes());
  const clientes = clientesResult.data ?? [];

  return (
    <main>
      <header className="pageHeader">
        <div>
          <h1>Pedidos</h1>
          <p>Gestión operativa y seguimiento de pedidos en taller.</p>
        </div>
        <NuevoPedidoHeaderAction clientes={clientes} />
      </header>

      {clientesResult.error && (
        <div className={shared.inlineWarning} role="alert">
          {`Clientes: ${clientesResult.error}`}
        </div>
      )}

      <Suspense key={`kpis-${params.estado ?? "ALL"}`} fallback={<div className="kpiPlaceholder" aria-hidden="true" />}>
        <PedidosKpisAsync estado={params.estado} />
      </Suspense>

      <PedidosFiltros estadoActual={params.estado} />

      <Suspense key={params.estado ?? "ALL"} fallback={<TableSkeleton rows={6} />}>
        <PedidosTableAsync estado={params.estado} />
      </Suspense>
    </main>
  );
}

async function PedidosKpisAsync({ estado }: { estado?: string }) {
  const { data } = await loadData(() => getPedidos({ estado }));
  return <PedidosKpis pedidos={data ?? []} />;
}
