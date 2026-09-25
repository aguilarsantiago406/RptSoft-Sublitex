import { Suspense } from "react";
import { PedidosTable } from "@/features/pedidos/components/PedidosTable";
import { PedidosFiltros } from "@/features/pedidos/components/PedidosFiltros";
import { NuevoPedidoHeaderAction } from "@/features/pedidos/components/NuevoPedidoHeaderAction";
import { getPedidos, getClientes } from "@/features/pedidos/api/pedidos.api";
import { getUsuarios } from "@/features/usuarios/api/usuarios.api";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

export const dynamic = "force-dynamic";

interface PedidosPageProps {
  searchParams: Promise<{ estado?: string }>;
}

async function PedidosTableAsync({ estado }: { estado?: string }) {
  const pedidos = await getPedidos({ estado }).catch(() => []);
  return <PedidosTable pedidos={pedidos} />;
}

export default async function PedidosPage({ searchParams }: PedidosPageProps) {
  const params = await searchParams;
  const [clientes, usuarios] = await Promise.all([
    getClientes().catch(() => []),
    getUsuarios().catch(() => []),
  ]);

  const vendedoras = (usuarios ?? [])
    .filter((u) => u.activo && (u.rol === "VENDEDORA" || u.rol === "VENDEDOR"))
    .map((u) => ({ id: u.id, nombre: u.nombre }));

  return (
    <main>
      <header className="pageHeader">
        <div>
          <h1>Pedidos</h1>
          <p>Gestión operativa y seguimiento de pedidos en taller.</p>
        </div>
        <NuevoPedidoHeaderAction clientes={clientes} vendedoras={vendedoras} />
      </header>

      <PedidosFiltros estadoActual={params.estado} />

      <Suspense key={params.estado ?? "ALL"} fallback={<TableSkeleton rows={6} />}>
        <PedidosTableAsync estado={params.estado} />
      </Suspense>
    </main>
  );
}
