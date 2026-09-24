import styles from "./tableSkeleton.module.css";

interface TableSkeletonProps {
  rows?: number;
}

export function TableSkeleton({ rows = 5 }: TableSkeletonProps) {
  return (
    <div className={styles.card} aria-busy="true" aria-label="Cargando tabla de datos">
      {/* Cabecera simulada con anchos variados */}
      <div className={styles.tableHeaderBone}>
        <div className={`${styles.bone} ${styles.columnHeaderBone}`} style={{ width: "36px" }} />
        <div className={`${styles.bone} ${styles.columnHeaderBone}`} style={{ width: "160px" }} />
        <div className={`${styles.bone} ${styles.columnHeaderBone}`} style={{ width: "110px" }} />
        <div className={`${styles.bone} ${styles.columnHeaderBone}`} style={{ width: "90px" }} />
        <div className={`${styles.bone} ${styles.columnHeaderBone}`} style={{ width: "70px" }} />
      </div>

      {/* Filas */}
      <div className={styles.rowsList}>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className={`${styles.bone} ${styles.rowBone}`}
            style={{ animationDelay: `${index * 0.08}s` }}
          />
        ))}
      </div>
    </div>
  );
}
