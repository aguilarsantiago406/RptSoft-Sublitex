import { notFound } from "next/navigation";
import { getPedido } from "@/features/pedidos/api/pedidos.api";
import { PedidoHeader } from "@/features/pedidos/components/PedidoHeader";
import { PedidoIdentificacion } from "@/features/pedidos/components/PedidoIdentificacion";
import { PedidoGrupos } from "@/features/pedidos/components/PedidoGrupos";
import { PedidoColores } from "@/features/pedidos/components/PedidoColores";
import { PedidoRevision } from "@/features/pedidos/components/PedidoRevision";
import styles from "@/features/pedidos/components/pedidos.module.css";
import { SipesApiError } from "@/lib/api/http";

export const dynamic = "force-dynamic";

interface PedidoPageProps {
  params: Promise<{ id: string }>;
}

export default async function PedidoDetallePage({ params }: PedidoPageProps) {
  const { id } = await params;
  let pedido;

  try {
    pedido = await getPedido(id);
  } catch (error) {
    if (error instanceof SipesApiError && error.status === 404) notFound();
    throw error;
  }

  const totalPrendas = pedido.grupos.reduce((acc, g) => acc + g.cantidadContratada, 0);

  return (
    <main>
      <PedidoHeader pedido={pedido} />
      <div className={styles.sheetContainer}>
        <PedidoIdentificacion pedido={pedido} />
        <PedidoGrupos grupos={pedido.grupos} pedidoId={pedido.id} totalPrendas={totalPrendas} />
        <div className={styles.twoColsLayout}>
          <PedidoColores colores={pedido.colores} pedidoId={pedido.id} />
          <PedidoRevision pedido={pedido} totalPrendas={totalPrendas} />
        </div>
      </div>
    </main>
  );
}
