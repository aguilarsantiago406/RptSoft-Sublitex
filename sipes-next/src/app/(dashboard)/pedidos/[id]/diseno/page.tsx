import { notFound } from "next/navigation";
import { Palette } from "lucide-react";
import { getPedido } from "@/features/pedidos/api/pedidos.api";
import { getDisenosPedido } from "@/features/pedidos/api/disenos.api";
import { PedidoDiseno } from "@/features/pedidos/components/PedidoDiseno";
import { PedidoTabs } from "@/features/pedidos/components/PedidoTabs";
import { EstadoPedidoBadge } from "@/features/pedidos/components/EstadoPedidoBadge";
import { loadData } from "@/lib/api/loadData";
import { SipesApiError } from "@/lib/api/http";
import styles from "@/features/pedidos/components/pedidos.module.css";

export const dynamic = "force-dynamic";

interface DisenoPageProps {
  params: Promise<{ id: string }>;
}

export default async function DisenoPage({ params }: DisenoPageProps) {
  const { id } = await params;

  let pedido: Awaited<ReturnType<typeof getPedido>>;
  let disenosRes;

  try {
    pedido = await getPedido(id);
    const pedidoRealId = pedido.id;
    disenosRes = await loadData(() => getDisenosPedido(pedidoRealId));
  } catch (error) {
    if (error instanceof SipesApiError && error.status === 404) notFound();
    throw error;
  }

  if (!pedido) {
    notFound();
  }

  const disenos = disenosRes.data ?? [];

  return (
    <main>
      <div className={styles.detailHeader} style={{ marginBottom: "14px" }}>
        <div className={styles.detailHeaderMain}>
          <h1 className={styles.detailHeaderTitle} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Palette size={26} color="var(--sky-dark)" />
            TALLER DE DISEÑO & MOCKUPS <span className={styles.detailHeaderCode}>— {pedido.codigo}</span>
          </h1>
          <p className={styles.detailHeaderSubtitle}>
            <span>Mockups y Aprobación de Arte</span>
          </p>
        </div>
        <div className={styles.detailHeaderRight}>
          <EstadoPedidoBadge estado={pedido.estado} size="lg" />
        </div>
      </div>

      <PedidoTabs pedidoCodigo={pedido.codigo} disenoVersion={disenos[0]?.version} />

      <div style={{ maxWidth: "1000px" }}>
        <PedidoDiseno pedidoId={pedido.id} disenos={disenos} />
      </div>
    </main>
  );
}
