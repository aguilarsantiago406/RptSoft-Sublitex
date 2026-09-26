import { notFound } from "next/navigation";
import { getPedido, getTiposProducto } from "@/features/pedidos/api/pedidos.api";
import { getDatosEnvio } from "@/features/pedidos/api/comercial.api";
import { PedidoHeader } from "@/features/pedidos/components/PedidoHeader";
import { PedidoStepper } from "@/features/pedidos/components/PedidoStepper";
import { PedidoIdentificacion } from "@/features/pedidos/components/PedidoIdentificacion";
import { PedidoGrupos } from "@/features/pedidos/components/PedidoGrupos";
import { PedidoEnvio } from "@/features/pedidos/components/PedidoEnvio";
import { PedidoColores } from "@/features/pedidos/components/PedidoColores";
import { PedidoRevision } from "@/features/pedidos/components/PedidoRevision";
import styles from "@/features/pedidos/components/pedidos.module.css";
import shared from "@/components/ui/table/tableShared.module.css";
import { SipesApiError } from "@/lib/api/http";
import { loadData } from "@/lib/api/loadData";

export const dynamic = "force-dynamic";

interface PedidoPageProps {
  params: Promise<{ id: string }>;
}

export default async function PedidoDetallePage({ params }: PedidoPageProps) {
  const { id } = await params;
  let pedido;
  let tiposProductoRes;
  let envioRes;

  try {
    const [pedidoRes, tiposRes, envioResult] = await Promise.all([
      getPedido(id),
      loadData(() => getTiposProducto()),
      loadData(() => getDatosEnvio(id)),
    ]);
    pedido = pedidoRes;
    tiposProductoRes = tiposRes;
    envioRes = envioResult;
  } catch (error) {
    if (error instanceof SipesApiError && error.status === 404) notFound();
    throw error;
  }

  const tiposProducto = tiposProductoRes.data ?? [];
  const datosEnvio = envioRes.data;

  const avisosAuxiliares = [
    tiposProductoRes.error ? `Tipos de producto: ${tiposProductoRes.error}` : null,
    envioRes.error ? `Datos de envío: ${envioRes.error}` : null,
  ].filter((mensaje): mensaje is string => mensaje !== null);

  const totalPrendas = pedido.grupos.reduce((acc, g) => acc + g.cantidadContratada, 0);

  return (
    <main>
      <PedidoHeader pedido={pedido} />
      {avisosAuxiliares.length > 0 && (
        <div className={shared.inlineWarning} role="alert">
          {avisosAuxiliares.join(" · ")}
        </div>
      )}
      <div style={{ margin: "0 0 var(--space-5)" }}>
        <PedidoStepper estado={pedido.estado} />
      </div>
      <div className={styles.sheetContainer}>
        <PedidoIdentificacion pedido={pedido} />
        <PedidoGrupos
          grupos={pedido.grupos}
          pedidoId={pedido.id}
          totalPrendas={totalPrendas}
          tiposProducto={tiposProducto}
        />
        <PedidoEnvio pedidoId={pedido.id} datosEnvio={datosEnvio} />
        <div className={styles.twoColsLayout}>
          <PedidoColores colores={pedido.colores} pedidoId={pedido.id} />
          <PedidoRevision pedido={pedido} totalPrendas={totalPrendas} />
        </div>
      </div>
    </main>
  );
}
