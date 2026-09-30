import { notFound } from "next/navigation";
import { getPedido, getTiposProducto, getAtributosCatalogo } from "@/features/pedidos/api/pedidos.api";
import { getDatosEnvio } from "@/features/pedidos/api/comercial.api";
import { getDisenosPedido } from "@/features/pedidos/api/disenos.api";
import { getUsuarios } from "@/features/usuarios/api/usuarios.api";
import { PedidoHeader } from "@/features/pedidos/components/PedidoHeader";
import { PedidoIdentificacion } from "@/features/pedidos/components/PedidoIdentificacion";
import { PedidoGrupos } from "@/features/pedidos/components/PedidoGrupos";
import { PedidoEnvio } from "@/features/pedidos/components/PedidoEnvio";
import { PedidoColores } from "@/features/pedidos/components/PedidoColores";
import { PedidoVistaPrevia } from "@/features/pedidos/components/PedidoVistaPrevia";
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
  let atributosRes;
  let disenosRes;
  let usuariosRes;

  try {
    pedido = await getPedido(id);
    const pedidoRealId = pedido.id;

    const [tiposRes, envioResult, atributosResult, disenosResult, uRes] = await Promise.all([
      loadData(() => getTiposProducto()),
      loadData(() => getDatosEnvio(pedidoRealId)),
      loadData(() => getAtributosCatalogo()),
      loadData(() => getDisenosPedido(pedidoRealId)),
      loadData(() => getUsuarios()),
    ]);
    tiposProductoRes = tiposRes;
    envioRes = envioResult;
    atributosRes = atributosResult;
    disenosRes = disenosResult;
    usuariosRes = uRes;
  } catch (error) {
    if (error instanceof SipesApiError && error.status === 404) notFound();
    throw error;
  }

  const tiposProducto = tiposProductoRes.data ?? [];
  const datosEnvio = envioRes.data;
  const atributosCatalogo = atributosRes.data ?? [];
  const disenos = disenosRes.data ?? [];
  const usuarios = usuariosRes?.data ?? [];

  let vendedoras = usuarios
    .filter((u) => u.activo && (u.rol === "VENDEDORA" || u.rol === "VENDEDOR"))
    .map((u) => ({ id: u.id, nombre: u.nombre }));

  if (vendedoras.length === 0) {
    vendedoras = usuarios
      .filter((u) => u.activo && (u.rol === "ADMINISTRADOR" || u.rol === "COORDINADOR_OPERATIVO"))
      .map((u) => ({ id: u.id, nombre: u.nombre }));
  }

  const avisos = [
    tiposProductoRes.error ? `Tipos de producto: ${tiposProductoRes.error}` : null,
    envioRes.error ? `Datos de envío: ${envioRes.error}` : null,
  ].filter((m): m is string => m !== null);

  const totalPrendas = pedido.grupos.reduce((acc, g) => acc + g.cantidadContratada, 0);

  return (
    <main className={styles.paginaPedido}>
      <PedidoHeader />
      {avisos.length > 0 && (
        <div className={shared.inlineWarning} role="alert">
          {avisos.join(" · ")}
        </div>
      )}

      <div className={styles.sheetContainer}>
        <div className={styles.splitRow}>
          <PedidoIdentificacion pedido={pedido} vendedoras={vendedoras} />
          <PedidoEnvio pedidoId={pedido.id} datosEnvio={datosEnvio} />
        </div>
        <PedidoGrupos
          grupos={pedido.grupos}
          pedidoId={pedido.id}
          totalPrendas={totalPrendas}
          tiposProducto={tiposProducto}
          atributosCatalogo={atributosCatalogo}
        />

        <div className={styles.splitRow}>
          <PedidoColores colores={pedido.colores} pedidoId={pedido.id} />
          <PedidoVistaPrevia pedido={pedido} disenos={disenos} />
        </div>
      </div>
    </main>
  );
}
