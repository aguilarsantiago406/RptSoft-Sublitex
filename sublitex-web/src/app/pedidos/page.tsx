import { ListaPedidos } from "@/components/pedidos/ListaPedidos";

export const metadata = {
  title: "Pedidos de Confección · SIPES Sublitex",
  description: "Bandeja de pedidos de confección y sublimación deportiva",
};

export default function PedidosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Pedidos de Confección
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Selecciona un pedido para revisar su cabecera, prendas y proforma comercial.
        </p>
      </div>

      <ListaPedidos />
    </div>
  );
}
