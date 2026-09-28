import { TableSkeleton } from "@/components/ui/TableSkeleton";
import styles from "@/features/pedidos/components/pedidos.module.css";

export default function PedidoDetalleLoading() {
  return (
    <main>
      <header className={styles.detailHeader}>
        <div className={styles.detailHeaderMain}>
          <h1 className={styles.detailHeaderTitle}>DATOS DEL PEDIDO</h1>
          <p className={styles.detailHeaderSubtitle}>
            <span>Ficha técnica operativa</span>
          </p>
        </div>
      </header>

      <TableSkeleton rows={6} />
    </main>
  );
}
