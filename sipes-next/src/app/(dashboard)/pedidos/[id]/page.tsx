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

  const totalPrendasContratadas = pedido.grupos.reduce((acc, g) => acc + g.cantidadContratada, 0);
  const cumpleMinimo = totalPrendasContratadas >= 12;
  const coloresValidos =
    pedido.colores.length > 0 && pedido.colores.every((c) => /^#([0-9A-Fa-f]{6})$/.test(c.codigoHex));

  return (
    <main>
      <header className={styles.detailHeader}>
        <div className={styles.detailHeaderMain}>
          <h1 className={styles.detailHeaderTitle}>
            DATOS DEL PEDIDO <span className={styles.detailHeaderCode}>— {pedido.codigo}</span>
          </h1>
          <p className={styles.detailHeaderSubtitle}>
            <span>Ficha técnica operativa</span>
            <span>·</span>
            <span>Cliente:</span>
            <span className={styles.detailClientTag}>{pedido.cliente.nombre}</span>
          </p>
        </div>
        <EstadoPedidoBadge estado={pedido.estado} />
      </header>

      <div className={styles.sheetContainer}>
        {/* 1 · IDENTIFICACIÓN */}
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <h2 className={styles.sectionTitle}>1 · IDENTIFICACIÓN</h2>
              <p className={styles.sectionSubtitle}>Datos generales de la orden y contacto comercial</p>
            </div>
          </div>
          <dl className={styles.dataGrid4}>
            <div>
              <dt>N° de pedido</dt>
              <dd className={styles.code}>{pedido.codigo}</dd>
            </div>
            <div>
              <dt>Fecha de registro</dt>
              <dd>{formatDate(pedido.fechaPedido)}</dd>
            </div>
            <div>
              <dt>Fecha de entrega / compromiso</dt>
              <dd>{formatDate(pedido.fechaCompromiso)}</dd>
            </div>
            <div>
              <dt>Cliente</dt>
              <dd>{pedido.cliente.nombre}</dd>
            </div>
            <div>
              <dt>Teléfono</dt>
              <dd>{pedido.cliente.telefono || "No registrado"}</dd>
            </div>
            <div>
              <dt>Ciudad / Destino</dt>
              <dd>{pedido.cliente.ciudad || "No registrada"}</dd>
            </div>
            {pedido.observaciones && (
              <div>
                <dt>Observaciones</dt>
                <dd>{pedido.observaciones}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* 2 · DISEÑO Y GRUPOS */}
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <h2 className={styles.sectionTitle}>2 · DISEÑO Y CONFIGURACIÓN DE GRUPOS</h2>
              <p className={styles.sectionSubtitle}>
                {pedido.grupos.length} grupos contratados · La configuración técnica vive en cada grupo
              </p>
            </div>
            <span className={styles.quantity}>{totalPrendasContratadas} prendas contratadas</span>
          </div>

          <div className={styles.groupList}>
            {pedido.grupos.length === 0 && <p className="notice">Este pedido todavía no tiene grupos.</p>}
            {pedido.grupos.map((grupo) => (
              <article className={styles.groupCardMinimal} key={grupo.id}>
                <div className={styles.groupCardHeader}>
                  <div className={styles.groupCardHeaderMain}>
                    <div className={styles.groupTitleRow}>
                      <h3 className={styles.groupName}>{grupo.nombre}</h3>
                      <span className={styles.productBadge}>
                        {grupo.tipoProducto?.nombre ?? "Producto no asignado"}
                      </span>
                    </div>
                    <div className={styles.groupMetaRow}>
                      <span className={styles.policyBadge}>
                        Numeración {grupo.politicaNumeracion === "UNICA" ? "Única (sin duplicados)" : "Libre"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.groupCountBlock}>
                    <span className={styles.countNumber}>{grupo.cantidadContratada}</span>
                    <span className={styles.countLabel}>prendas</span>
                  </div>
                </div>

                {grupo.tipoProducto?.componentes && (
                  <div className={styles.componentsRow}>
                    <span className={styles.componentsLabel}>Componentes por prenda:</span>
                    <div className={styles.componentsPills}>
                      {grupo.tipoProducto.componentes.camisetas > 0 && (
                        <span className={styles.pillItem}>
                          {grupo.tipoProducto.componentes.camisetas} camiseta{grupo.tipoProducto.componentes.camisetas > 1 ? "s" : ""}
                        </span>
                      )}
                      {grupo.tipoProducto.componentes.shorts > 0 && (
                        <span className={styles.pillItem}>
                          {grupo.tipoProducto.componentes.shorts} short{grupo.tipoProducto.componentes.shorts > 1 ? "s" : ""}
                        </span>
                      )}
                      {grupo.tipoProducto.componentes.medias > 0 && (
                        <span className={styles.pillItem}>
                          {grupo.tipoProducto.componentes.medias} par(es) medias
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className={styles.configSection}>
                  <span className={styles.configSectionTitle}>Especificaciones técnicas del grupo</span>
                  {grupo.configuracion.length === 0 ? (
                    <span className={styles.configEmpty}>Sin atributos específicos definidos</span>
                  ) : (
                    <div className={styles.configPillsGrid}>
                      {grupo.configuracion.map((item) => (
                        <div className={styles.configPill} key={`${item.atributo}-${item.valor}`}>
                          <span className={styles.configPillKey}>{item.atributo}</span>
                          <span className={styles.configPillVal}>{item.valor}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.groupCardFooter}>
                  <Link className={styles.secondaryButton} href={`/pedidos/${pedido.id}/prendas`}>
                    Ver prendas de {grupo.nombre} ({grupo.cantidadContratada}) →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 3 · COLORES y 7 · REVISIÓN EN 2 COLUMNAS */}
        <div className={styles.twoColsLayout}>
          {/* 3 · COLORES */}
          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeaderRow}>
              <div>
                <h2 className={styles.sectionTitle}>3 · COLORES OFICIALES</h2>
                <p className={styles.sectionSubtitle}>
                  Código hexadecimal obligatorio (Regla R-K05)
                </p>
              </div>
              <span className={styles.tagSi}>{pedido.colores.length} colores</span>
            </div>
            <div className={styles.colors}>
              {pedido.colores.length === 0 && <p className={styles.configEmpty}>Sin colores registrados.</p>}
              {pedido.colores.map((color) => (
                <div className={styles.colorItem} key={color.id}>
                  <span className={styles.colorSample} style={{ backgroundColor: color.codigoHex }} />
                  <div>
                    <strong>{color.nombre}</strong>
                    <small>
                      HEX: {color.codigoHex}
                      {color.referenciaFisica ? ` · ${color.referenciaFisica}` : ""}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 7 · REVISIÓN ANTES DE ENVIAR */}
          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeaderRow}>
              <div>
                <h2 className={styles.sectionTitle}>7 · REVISIÓN Y CONTROL DE CALIDAD</h2>
                <p className={styles.sectionSubtitle}>
                  Validaciones automáticas calculadas sobre la orden
                </p>
              </div>
            </div>
            <ul className={styles.checklist}>
              <li className={styles.checkItem}>
                <span>Total prendas contratadas</span>
                <span className={styles.checkTagOk}>{totalPrendasContratadas} contratadas</span>
              </li>
              <li className={styles.checkItem}>
                <span>Pedido mínimo alcanzado (≥ 12 unidades R-K09)</span>
                <span className={cumpleMinimo ? styles.checkTagOk : styles.checkTagWarn}>
                  {cumpleMinimo ? `CUMPLE (${totalPrendasContratadas})` : "MENOR A 12"}
                </span>
              </li>
              <li className={styles.checkItem}>
                <span>Colores con código HEX válido (R-K05)</span>
                <span className={coloresValidos ? styles.checkTagOk : styles.checkTagWarn}>
                  {coloresValidos ? "VALIDADO" : "PENDIENTE HEX"}
                </span>
              </li>
              <li className={styles.checkItem}>
                <span>Fecha compromiso posterior a fecha de pedido (R-A09)</span>
                <span className={pedido.fechaCompromiso ? styles.checkTagOk : styles.checkTagWarn}>
                  {pedido.fechaCompromiso ? "OK" : "PENDIENTE"}
                </span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
