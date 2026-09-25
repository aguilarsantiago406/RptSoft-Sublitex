import { notFound } from "next/navigation";
import { getPedido, getTiposProducto, getAtributosCatalogo } from "@/features/pedidos/api/pedidos.api";
import { getDatosEnvio } from "@/features/pedidos/api/comercial.api";
import { getUsuarios } from "@/features/usuarios/api/usuarios.api";
import { PedidoHeader } from "@/features/pedidos/components/PedidoHeader";
import { PedidoIdentificacion } from "@/features/pedidos/components/PedidoIdentificacion";
import { PedidoGrupos } from "@/features/pedidos/components/PedidoGrupos";
import { PedidoEnvio } from "@/features/pedidos/components/PedidoEnvio";
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
  let tiposProducto = [];
  let datosEnvio;
  let usuarios = [];
  let atributosCatalogo = [];

  try {
    const [pedidoRes, tiposRes, envioRes, usuariosRes, atributosRes] = await Promise.all([
      getPedido(id),
      getTiposProducto().catch(() => []),
      getDatosEnvio(id).catch(() => null),
      getUsuarios().catch(() => []),
      getAtributosCatalogo().catch(() => []),
    ]);
    pedido = pedidoRes;
    tiposProducto = tiposRes;
    datosEnvio = envioRes;
    usuarios = usuariosRes;
    atributosCatalogo = atributosRes;
  } catch (error) {
    if (error instanceof SipesApiError && error.status === 404) notFound();
    throw error;
  }

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

  return (
    <main>
      <PedidoHeader pedido={pedido} />
      <div className={styles.sheetContainer}>
        <PedidoIdentificacion pedido={pedido} vendedoras={vendedoras} />
        <PedidoGrupos
          grupos={pedido.grupos}
          pedidoId={pedido.id}
          totalPrendas={totalPrendas}
          tiposProducto={tiposProducto}
          atributosCatalogo={atributosCatalogo}
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
