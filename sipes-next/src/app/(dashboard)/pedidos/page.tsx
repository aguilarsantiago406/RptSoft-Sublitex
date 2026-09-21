import { PedidosTable } from "@/features/pedidos/components/PedidosTable";
import { PedidosFiltros } from "@/features/pedidos/components/PedidosFiltros";
import { getPedidos } from "@/features/pedidos/api/pedidos.api";

export const dynamic = "force-dynamic";

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const params = await searchParams;
  const pedidos = await getPedidos({ estado: params.estado });

  return (
    <main>
      <header className="pageHeader">
        <div>
          <h1>Pedidos</h1>
          <p>{pedidos.length} pedidos obtenidos del backend SIPES.</p>
        </div>
        <button className="primaryButton" type="button" disabled title="Se habilitará al implementar el formulario">
          + Nuevo pedido
        </button>
      </header>
      <PedidosFiltros estadoActual={params.estado} />
      <PedidosTable pedidos={pedidos} />
    </main>
  );
}
