import { notFound } from "next/navigation";
import { getPedido } from "@/features/pedidos/api/pedidos.api";
import { getDisenosPedido } from "@/features/pedidos/api/disenos.api";
import { PedidoDiseno } from "@/features/pedidos/components/PedidoDiseno";
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
      <div className={styles.detailHeader} style={{ marginBottom: "20px" }}>
        <div className={styles.detailHeaderMain}>
          <h1 className={styles.detailHeaderTitle}>TALLER DE DISEÑO &amp; MOCKUPS</h1>
          <p className={styles.detailHeaderSubtitle}>
            <span>Mockups y Aprobación de Arte</span>
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1000px" }}>
        <PedidoDiseno pedidoId={pedido.id} disenos={disenos} />
      </div>
    </main>
  );
}
