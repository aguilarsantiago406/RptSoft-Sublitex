import Link from "next/link";
import type { GrupoPedido } from "../types/pedido";
import styles from "./pedidos.module.css";

interface PedidoGruposProps {
  grupos: GrupoPedido[];
  pedidoId: string;
  totalPrendas: number;
}

export function PedidoGrupos({ grupos, pedidoId, totalPrendas }: PedidoGruposProps) {
  return (
    <section className={styles.sectionBlock}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitle}>2 · DISEÑO Y CONFIGURACIÓN DE GRUPOS</h2>
          <p className={styles.sectionSubtitle}>
            {grupos.length} grupos contratados · La configuración técnica vive en cada grupo
          </p>
        </div>
        <span className={styles.quantity}>{totalPrendas} prendas contratadas</span>
      </div>

      <div className={styles.groupList}>
        {grupos.length === 0 && <p className="notice">Este pedido todavía no tiene grupos.</p>}
        {grupos.map((grupo) => (
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
              <Link className={styles.secondaryButton} href={`/pedidos/${pedidoId}/prendas`}>
                Ver prendas de {grupo.nombre} ({grupo.cantidadContratada}) →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
