import Link from "next/link";
import { Eye } from "lucide-react";
import type { PedidoDetalle } from "../types/pedido";
import type { DisenoItem } from "../types/diseno";
import styles from "./pedidos.module.css";

interface PedidoVistaPreviaProps {
  pedido: PedidoDetalle;
  disenos: DisenoItem[];
}

export function PedidoVistaPrevia({ pedido, disenos }: PedidoVistaPreviaProps) {
  const disenoActivo = disenos.find((d) => d.estado === "APROBADO") ?? disenos[0] ?? null;
  const prendaBase = pedido.grupos[0]?.tipoProducto?.nombre ?? null;

  return (
    <section className={`${styles.sectionBlock} ${styles.sectionBlockCompacta}`}>
      <div className={styles.sectionHeaderRow}>
        <div className={styles.sectionTitleRow}>
          <span className={styles.cardIcon}>
            <Eye size={16} />
          </span>
          <h2 className={styles.sectionTitle}>Vista previa</h2>
        </div>
        <Link className={styles.cardActionGhost} href={`/pedidos/${pedido.codigo}/diseno`}>
          Abrir diseño
        </Link>
      </div>

      <div className={styles.mockupBody}>
        {disenoActivo?.imagenUrl || disenoActivo?.archivoUrl ? (
          <div className={styles.mockupPreview}>
            <img
              src={disenoActivo.imagenUrl ?? disenoActivo.archivoUrl ?? ""}
              alt={`Mockup del diseño v${disenoActivo.version}`}
            />
            <span
              className={
                disenoActivo.estado === "APROBADO"
                  ? styles.mockupPreviewTagAprobado
                  : styles.mockupPreviewTag
              }
            >
              v{disenoActivo.version}
            </span>
          </div>
        ) : (
          <div className={styles.mockupPreviewEmpty}>Sin mockup</div>
        )}

        <div className={styles.mockupSideInfo}>
          <div className={styles.mockupSideTitle}>
            {prendaBase ? `${prendaBase}${pedido.grupos[0] ? ` · ${pedido.grupos[0].nombre}` : ""}` : "Sin prenda base"}
          </div>
          <div className={styles.mockupSideDesc}>
            {disenoActivo
              ? `Versión ${disenoActivo.version} · ${disenoActivo.estado.toLowerCase()}`
              : "Todavía no hay versiones de diseño cargadas."}
          </div>
        </div>
      </div>
    </section>
  );
}
