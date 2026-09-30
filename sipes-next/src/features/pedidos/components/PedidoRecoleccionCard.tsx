import type { ResumenProduccionItem } from "../api/comercial.api";
import styles from "./pedidos.module.css";

interface PedidoRecoleccionCardProps {
  totalPrendas: number;
  resumen?: ResumenProduccionItem | null;
}

/* Avance de la recolección: métricas y barra de progreso. Sin encabezado
   propio, la section ya lo titula y el dato no se duplica. */
export function PedidoRecoleccionCard({
  totalPrendas,
  resumen = null,
}: PedidoRecoleccionCardProps) {
  const contratadas = resumen?.totales?.cantidadContratada ?? totalPrendas;
  const registradas = resumen?.totales?.prendasRegistradas ?? 0;
  const faltantes = resumen?.totales?.prendasFaltantes ?? Math.max(contratadas - registradas, 0);
  const porcentaje = contratadas > 0 ? Math.min(Math.round((registradas / contratadas) * 100), 100) : 0;
  const estaCompleto = contratadas > 0 && faltantes === 0;

  return (
    <div className={styles.recoleccion}>
      <div className={styles.recoleccionMetricas}>
        <div className={styles.recoleccionMetrica}>
          <span className={styles.recoleccionMetricaLabel}>Contratadas</span>
          <span className={styles.recoleccionMetricaValor}>{contratadas}</span>
        </div>

        <div className={`${styles.recoleccionMetrica} ${styles.recoleccionMetricaOk}`}>
          <span className={styles.recoleccionMetricaLabel}>Registradas</span>
          <span className={styles.recoleccionMetricaValor}>{registradas}</span>
        </div>

        <div
          className={`${styles.recoleccionMetrica} ${estaCompleto ? "" : styles.recoleccionMetricaAlerta}`}
        >
          <span className={styles.recoleccionMetricaLabel}>Faltantes</span>
          <span className={styles.recoleccionMetricaValor}>{faltantes}</span>
        </div>
      </div>

      <div className={styles.recoleccionProgreso}>
        <div className={styles.recoleccionProgresoRow}>
          <span>{estaCompleto ? "Lista de prendas 100% completada" : "Avance de recolección de tallas"}</span>
          <span className={estaCompleto ? styles.recoleccionProgresoOk : styles.recoleccionProgresoPct}>
            {porcentaje}%
          </span>
        </div>
        <div className={styles.recoleccionProgresoTrack}>
          <div
            className={`${styles.recoleccionProgresoBar} ${estaCompleto ? styles.recoleccionProgresoBarOk : ""}`}
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>
    </div>
  );
}
