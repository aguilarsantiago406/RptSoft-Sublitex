import { PedidosTable } from "@/features/pedidos/components/PedidosTable";
import { PedidosFiltros } from "@/features/pedidos/components/PedidosFiltros";
import { NuevoPedidoHeaderAction } from "@/features/pedidos/components/NuevoPedidoHeaderAction";
import { getPedidos, getClientes } from "@/features/pedidos/api/pedidos.api";

export const dynamic = "force-dynamic";

interface PedidosPageProps {
  searchParams: Promise<{ estado?: string }>;
}

export default async function PedidosPage({ searchParams }: PedidosPageProps) {
  const params = await searchParams;
  const [pedidos, clientes] = await Promise.all([
    getPedidos({ estado: params.estado }),
    getClientes().catch(() => []),
  ]);

  return (
    <main>
      <header className="pageHeader">
        <div>
          <h1>Pedidos</h1>
          <p>{pedidos.length} pedidos registrados en el sistema.</p>
        </div>
        <NuevoPedidoHeaderAction clientes={clientes} />
      </header>
      <PedidosFiltros estadoActual={params.estado} />
      <PedidosTable pedidos={pedidos} />
    </main>
  );
}
