import { notFound } from "next/navigation";
import { getPedido } from "@/features/pedidos/api/pedidos.api";
import { getTarifasVigentes, getDatosEnvio, getResumenProduccion } from "@/features/pedidos/api/comercial.api";
import { EstadoPedidoBadge } from "@/features/pedidos/components/EstadoPedidoBadge";
import { ProformaView } from "@/features/pedidos/components/proforma/ProformaView";
import styles from "@/features/pedidos/components/pedidos.module.css";

export const dynamic = "force-dynamic";

interface ProformaPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProformaPage({ params }: ProformaPageProps) {
  const { id } = await params;

  let pedido;
  let tarifas = [];
  let datosEnvio = null;
  let resumenProduccion = null;

  try {
    const [pedidoRes, tarifasRes, envioRes, resumenRes] = await Promise.all([
      getPedido(id),
      getTarifasVigentes(),
      getDatosEnvio(id),
      getResumenProduccion(id),
    ]);
    pedido = pedidoRes;
    tarifas = tarifasRes;
    datosEnvio = envioRes;
    resumenProduccion = resumenRes;
  } catch {
    notFound();
  }

  if (!pedido) {
    notFound();
  }

  return (
    <main>
      <header className={styles.detailHeader}>
        <div className={styles.detailHeaderMain}>
          <h1 className={styles.detailHeaderTitle}>
            PROFORMA <span className={styles.detailHeaderCode}>— {pedido.codigo}</span>
          </h1>
          <p className={styles.detailHeaderSubtitle}>
            <span>Cotización Comercial</span>
          </p>
        </div>
        <EstadoPedidoBadge estado={pedido.estado} size="lg" />
      </header>

      <ProformaView
        pedido={pedido}
        tarifas={tarifas}
        datosEnvio={datosEnvio}
        resumenProduccion={resumenProduccion}
      />
    </main>
  );
}
