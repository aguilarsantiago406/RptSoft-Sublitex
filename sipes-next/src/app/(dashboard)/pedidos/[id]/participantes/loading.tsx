import { TableSkeleton } from "@/components/ui/TableSkeleton";
import styles from "@/features/pedidos/components/pedidos.module.css";

export default function ParticipantesLoading() {
  return (
    <main>
      <header className={styles.detailHeader}>
        <div className={styles.detailHeaderMain}>
          <h1 className={styles.detailHeaderTitle}>PARTICIPANTES</h1>
          <p className={styles.detailHeaderSubtitle}>
            <span>Gestión de Participantes</span>
          </p>
        </div>
      </header>

      <TableSkeleton rows={6} />
    </main>
  );
}

