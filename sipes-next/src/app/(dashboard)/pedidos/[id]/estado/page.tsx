import { notFound } from "next/navigation";
import { getPedido } from "@/features/pedidos/api/pedidos.api";
import { getDatosEnvio, getResumenProduccion } from "@/features/pedidos/api/comercial.api";
import { getBloquesPedido, getVersionesPendientesAcuse } from "@/features/pedidos/api/bloques.api";
import { PedidoHeader } from "@/features/pedidos/components/PedidoHeader";
import { AlertaReaperturaTaller } from "@/features/pedidos/components/AlertaReaperturaTaller";
import { PedidoStepper } from "@/features/pedidos/components/PedidoStepper";
import { PedidoGuiaEtapa } from "@/features/pedidos/components/PedidoGuiaEtapa";
import { PedidoRevision } from "@/features/pedidos/components/PedidoRevision";
import { BarraAuditoriaPedido } from "@/features/pedidos/components/BarraAuditoriaPedido";
import shared from "@/components/ui/table/tableShared.module.css";
import { SipesApiError } from "@/lib/api/http";
import { loadData } from "@/lib/api/loadData";

export const dynamic = "force-dynamic";

interface EstadoPageProps {
  params: Promise<{ id: string }>;
}

export default async function PedidoEstadoPage({ params }: EstadoPageProps) {
  const { id } = await params;
  let pedido: Awaited<ReturnType<typeof getPedido>>;
  let envioRes;
  let resumenRes;
  let bloquesRes;
  let versionesPendientesRes;

  try {
    pedido = await getPedido(id);
    const pedidoRealId = pedido.id;

    const [envioResult, resumenResult, bloquesResult, versionesResult] =
      await Promise.all([
        loadData(() => getDatosEnvio(pedidoRealId)),
        loadData(() => getResumenProduccion(pedidoRealId)),
        loadData(() => getBloquesPedido(pedidoRealId)),
        loadData(() => getVersionesPendientesAcuse(pedidoRealId)),
      ]);
    envioRes = envioResult;
    resumenRes = resumenResult;
    bloquesRes = bloquesResult;
    versionesPendientesRes = versionesResult;
  } catch (error) {
    if (error instanceof SipesApiError && error.status === 404) notFound();
    throw error;
  }

  const datosEnvio = envioRes.data;
  const resumenProduccion = resumenRes.data;
  const bloques = bloquesRes?.data ?? [];
  const versionesPendientes = versionesPendientesRes?.data?.versiones ?? [];

  const totalPrendas = pedido.grupos.reduce((acc, g) => acc + g.cantidadContratada, 0);

  const avisos = [
    bloquesRes?.error ? `Bloques: ${bloquesRes.error}` : null,
    versionesPendientesRes?.error ? `Alertas de reapertura: ${versionesPendientesRes.error}` : null,
  ].filter((m): m is string => m !== null);

  return (
    <main>
      <PedidoHeader
        titulo="ESTADO DEL PEDIDO"
        subtitulo="Seguimiento de etapa y requisitos para avanzar"
      />
      <BarraAuditoriaPedido pedidoId={pedido.id} codigo={pedido.codigo} />
      <AlertaReaperturaTaller
        pedidoId={pedido.id}
        versionesPendientes={versionesPendientes}
      />
      {avisos.length > 0 && (
        <div className={shared.inlineWarning} role="alert">
          {avisos.join(" · ")}
        </div>
      )}

      <div style={{ margin: "0 0 var(--space-4)" }}>
        <PedidoStepper estado={pedido.estado} />
      </div>

      <PedidoGuiaEtapa
        pedido={pedido}
        datosEnvio={datosEnvio}
        totalPrendas={totalPrendas}
        resumenProduccion={resumenProduccion}
        bloques={bloques}
      />

      <PedidoRevision
        pedido={pedido}
        bloques={bloques}
        totalPrendas={totalPrendas}
      />
    </main>
  );
}
