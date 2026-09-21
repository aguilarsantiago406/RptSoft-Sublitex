import Link from "next/link";
import { notFound } from "next/navigation";
import { getPedido } from "@/features/pedidos/api/pedidos.api";
import { EstadoPedidoBadge } from "@/features/pedidos/components/EstadoPedidoBadge";
import styles from "@/features/pedidos/components/pedidos.module.css";
import { SipesApiError } from "@/lib/api/http";
import { formatDate } from "@/lib/format/date";

export const dynamic = "force-dynamic";

export default async function PedidoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let pedido;

  try {
    pedido = await getPedido(id);
  } catch (error) {
    if (error instanceof SipesApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <main>
      <Link className="backLink" href="/pedidos">← Volver a pedidos</Link>
      <header className="pageHeader">
        <div>
          <h1>{pedido.codigo}</h1>
          <p>{pedido.cliente.nombre}</p>
        </div>
        <EstadoPedidoBadge estado={pedido.estado} />
      </header>

      <div className={styles.detailGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}><h2>Grupos del pedido</h2><span>{pedido.grupos.length}</span></div>
          <div className={styles.groupList}>
            {pedido.grupos.length === 0 && <p className="notice">Este pedido todavía no tiene grupos.</p>}
            {pedido.grupos.map((grupo) => (
              <article className={styles.groupCard} key={grupo.id}>
                <div className={styles.groupTop}>
                  <div><h3>{grupo.nombre}</h3><p>{grupo.tipoProducto?.nombre ?? "Producto por definir"} · Numeración {grupo.politicaNumeracion.toLowerCase()}</p></div>
                  <span className={styles.quantity}>{grupo.cantidadContratada} prendas</span>
                </div>
                <div className={styles.configList}>
                  {grupo.configuracion.map((item) => <span className={styles.config} key={`${item.atributo}-${item.valor}`}>{item.atributo}: {item.valor}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className={styles.groupList}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}><h2>Datos del pedido</h2></div>
            <dl className={styles.dataList}>
              <div><dt>Fecha del pedido</dt><dd>{formatDate(pedido.fechaPedido)}</dd></div>
              <div><dt>Fecha compromiso</dt><dd>{formatDate(pedido.fechaCompromiso)}</dd></div>
              <div><dt>Ciudad</dt><dd>{pedido.cliente.ciudad || "No registrada"}</dd></div>
              <div><dt>Teléfono</dt><dd>{pedido.cliente.telefono || "No registrado"}</dd></div>
            </dl>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}><h2>Colores oficiales</h2><span>{pedido.colores.length}</span></div>
            <div className={styles.colors}>
              {pedido.colores.length === 0 && <p>Sin colores registrados.</p>}
              {pedido.colores.map((color) => (
                <div className={styles.colorItem} key={color.id}>
                  <span className={styles.colorSample} style={{ backgroundColor: color.codigoHex }} />
                  <div><strong>{color.nombre}</strong><small>{color.codigoHex}</small></div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
