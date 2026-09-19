import { DetallePedido } from "@/components/detalle/DetallePedido";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Detalle de Pedido · SIPES Sublitex",
  description: "Ficha comercial, diseño aprobado, prendas y proforma",
};

export default async function PedidoDetallePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-6">
      <DetallePedido pedidoId={id} />
    </div>
  );
}
