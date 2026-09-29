import { notFound } from "next/navigation";
import { getPedido, getTiposProducto, getAtributosCatalogo } from "@/features/pedidos/api/pedidos.api";
import { getDatosEnvio, getResumenProduccion } from "@/features/pedidos/api/comercial.api";
import { getBloquesPedido, getVersionesPendientesAcuse } from "@/features/pedidos/api/bloques.api";
import { getUsuarios } from "@/features/usuarios/api/usuarios.api";
import { getDisenosPedido } from "@/features/pedidos/api/disenos.api";
import { PedidoHeader } from "@/features/pedidos/components/PedidoHeader";
import { AlertaReaperturaTaller } from "@/features/pedidos/components/AlertaReaperturaTaller";
import { PedidoStepper } from "@/features/pedidos/components/PedidoStepper";
import { PedidoIdentificacion } from "@/features/pedidos/components/PedidoIdentificacion";
import { PedidoGrupos } from "@/features/pedidos/components/PedidoGrupos";
import { PedidoEnvio } from "@/features/pedidos/components/PedidoEnvio";
import { PedidoDisenoCard } from "@/features/pedidos/components/PedidoDisenoCard";
import { PedidoColores } from "@/features/pedidos/components/PedidoColores";
import { PedidoRevision } from "@/features/pedidos/components/PedidoRevision";
import { PedidoGuiaEtapa } from "@/features/pedidos/components/PedidoGuiaEtapa";
import { PedidoTabs } from "@/features/pedidos/components/PedidoTabs";
import guiaStyles from "@/features/pedidos/components/pedidoGuiaEtapa.module.css";
import { BarraAuditoriaPedido } from "@/features/pedidos/components/BarraAuditoriaPedido";
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
  let pedido: Awaited<ReturnType<typeof getPedido>>;
  let tiposProductoRes;
  let envioRes;
  let usuariosRes;
  let atributosRes;
  let disenosRes;
  let resumenRes;
  let bloquesRes;
  let versionesPendientesRes;

  try {
    pedido = await getPedido(id);
    const pedidoRealId = pedido.id;

    const [
      tiposRes,
      envioResult,
      usuariosResult,
      atributosResult,
      disenosResult,
      resumenResult,
      bloquesResult,
      versionesResult,
    ] = await Promise.all([
      loadData(() => getTiposProducto()),
      loadData(() => getDatosEnvio(pedidoRealId)),
      loadData(() => getUsuarios()),
      loadData(() => getAtributosCatalogo()),
      loadData(() => getDisenosPedido(pedidoRealId)),
      loadData(() => getResumenProduccion(pedidoRealId)),
      loadData(() => getBloquesPedido(pedidoRealId)),
      loadData(() => getVersionesPendientesAcuse(pedidoRealId)),
    ]);
    tiposProductoRes = tiposRes;
    envioRes = envioResult;
    usuariosRes = usuariosResult;
    atributosRes = atributosResult;
    disenosRes = disenosResult;
    resumenRes = resumenResult;
    bloquesRes = bloquesResult;
    versionesPendientesRes = versionesResult;
  } catch (error) {
    if (error instanceof SipesApiError && error.status === 404) notFound();
    throw error;
  }

  const tiposProducto = tiposProductoRes.data ?? [];
  const datosEnvio = envioRes.data;
  const usuarios = usuariosRes.data ?? [];
  const atributosCatalogo = atributosRes.data ?? [];
  const disenos = disenosRes.data ?? [];
  const resumenProduccion = resumenRes.data;
  const bloques = bloquesRes?.data ?? [];
  const versionesPendientes = versionesPendientesRes?.data?.versiones ?? [];

  const avisosAuxiliares = [
    tiposProductoRes.error ? `Tipos de producto: ${tiposProductoRes.error}` : null,
    envioRes.error ? `Datos de envío: ${envioRes.error}` : null,
    bloquesRes?.error ? `Bloques: ${bloquesRes.error}` : null,
    versionesPendientesRes?.error ? `Alertas de reapertura: ${versionesPendientesRes.error}` : null,
  ].filter((mensaje): mensaje is string => mensaje !== null);

  let vendedoras = (usuarios ?? [])
    .filter((u) => u.activo && (u.rol === "VENDEDORA" || u.rol === "VENDEDOR"))
    .map((u) => ({ id: u.id, nombre: u.nombre }));

  if (vendedoras.length === 0) {
    vendedoras = (usuarios ?? [])
      .filter((u) => u.activo && (u.rol === "ADMINISTRADOR" || u.rol === "COORDINADOR_OPERATIVO"))
      .map((u) => ({
        id: u.id,
        nombre: `${u.nombre} (${u.rol === "ADMINISTRADOR" ? "Admin" : "Coordinador"})`,
      }));
  }

  const totalPrendas = pedido.grupos.reduce((acc, g) => acc + g.cantidadContratada, 0);
  const etapa = pedido.estado;

  return (
    <main>
      <PedidoHeader pedido={pedido} />
      <PedidoTabs
        pedidoCodigo={pedido.codigo}
        totalPrendas={totalPrendas}
        disenoVersion={disenos[0]?.version}
      />
      <BarraAuditoriaPedido pedidoId={pedido.id} codigo={pedido.codigo} />
      <AlertaReaperturaTaller
        pedidoId={pedido.id}
        versionesPendientes={versionesPendientes}
      />
      {avisosAuxiliares.length > 0 && (
        <div className={shared.inlineWarning} role="alert">
          {avisosAuxiliares.join(" · ")}
        </div>
      )}
      <div style={{ margin: "0 0 var(--space-4)" }}>
        <PedidoStepper estado={pedido.estado} />
      </div>

      <PedidoGuiaEtapa
        pedido={pedido}
        disenos={disenos}
        datosEnvio={datosEnvio}
        totalPrendas={totalPrendas}
        resumenProduccion={resumenProduccion}
        bloques={bloques}
      />

      <div className={styles.sheetContainer}>
        <div className={styles.twoColsLayout}>
          <div style={{ position: "relative", borderRadius: "18px" }} className={etapa === "BORRADOR" ? guiaStyles.activeSectionHighlight : undefined}>
            {etapa === "BORRADOR" && <span className={guiaStyles.activeSectionBadge}>Etapa activa · Datos Iniciales</span>}
            <PedidoIdentificacion pedido={pedido} vendedoras={vendedoras} disenos={disenos} />
          </div>

          <div style={{ position: "relative", borderRadius: "18px" }} className={etapa === "EN_PRODUCCION" ? guiaStyles.activeSectionHighlight : undefined}>
            {etapa === "EN_PRODUCCION" && <span className={guiaStyles.activeSectionBadge}>Etapa activa · Logística de Despacho</span>}
            <PedidoEnvio pedidoId={pedido.id} datosEnvio={datosEnvio} />
          </div>
        </div>

        {/* BLOQUE 2: ESPECIFICACIÓN TEXTIL (GRUPOS + COLORES JUNTOS) */}
        <div style={{ position: "relative", borderRadius: "18px" }} className={etapa === "EN_CONFIGURACION" ? guiaStyles.activeSectionHighlight : undefined}>
          {etapa === "EN_CONFIGURACION" && <span className={guiaStyles.activeSectionBadge}>Etapa activa · Grupos y Colores</span>}
          <div style={{ display: "grid", gap: "16px" }}>
            <PedidoGrupos
              grupos={pedido.grupos}
              pedidoId={pedido.id}
              pedidoCodigo={pedido.codigo}
              totalPrendas={totalPrendas}
              tiposProducto={tiposProducto}
              atributosCatalogo={atributosCatalogo}
            />
            <PedidoColores colores={pedido.colores} pedidoId={pedido.id} />
          </div>
        </div>


        {/* BLOQUE 4: DISEÑO Y MOCKUPS */}
        <div id="seccion-diseno" style={{ position: "relative", borderRadius: "18px" }}>
          <PedidoDisenoCard pedidoId={pedido.id} pedidoCodigo={pedido.codigo} disenos={disenos} />
        </div>

        {/* BLOQUE 5: REVISIÓN Y CONTROL DE CALIDAD (AUDITORÍA PRE-TALLER) */}
        <div id="seccion-revision" style={{ position: "relative", borderRadius: "18px" }} className={etapa === "EN_REVISION" ? guiaStyles.activeSectionHighlight : undefined}>
          {etapa === "EN_REVISION" && <span className={guiaStyles.activeSectionBadge}>Etapa activa · Auditoría de Calidad</span>}
          <PedidoRevision
            pedido={pedido}
            bloques={bloques}
            totalPrendas={totalPrendas}
          />
        </div>
      </div>
    </main>
  );
}
