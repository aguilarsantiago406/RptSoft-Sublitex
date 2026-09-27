import Link from "next/link";
import { ShieldCheck, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import type { PedidoDetalle } from "../types/pedido";
import styles from "./pedidos.module.css";

interface PedidoRevisionProps {
  pedido: PedidoDetalle;
  totalPrendas: number;
  disenoAprobado?: boolean;
  datosEnvio?: { ciudad?: string | null; direccion?: string | null } | null;
}

export function PedidoRevision({
  pedido,
  totalPrendas,
  disenoAprobado = false,
  datosEnvio = null,
}: PedidoRevisionProps) {
  const cumpleMinimo = totalPrendas >= 12;
  const tieneEnvio = Boolean(datosEnvio?.ciudad || datosEnvio?.direccion);
  const tieneFechaCompromiso = Boolean(pedido.fechaCompromiso);

  return (
    <section className={styles.sectionBlock}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={18} color="var(--sky-dark)" />
            REVISIÓN Y CONTROL DE CALIDAD (AUDITORÍA PRE-TALLER)
          </h2>
          <p className={styles.sectionSubtitle}>
            Auditoría de candados y requisitos obligatorios antes de liberar la orden a confección
          </p>
        </div>
        <Link
          href={`/pedidos/${pedido.id}/proforma`}
          className={styles.linkButton}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <FileText size={16} />
          Ver Proforma Comercial →
        </Link>
      </div>

      <ul className={styles.checklist}>
        <li className={styles.checkItem}>
          <span>Candado 1: Mockup y arte aprobado por el cliente (R-H01)</span>
          <span className={disenoAprobado ? styles.checkTagOk : styles.checkTagWarn}>
            {disenoAprobado ? "APROBADO" : "PENDIENTE APROBACIÓN"}
          </span>
        </li>
        <li className={styles.checkItem}>
          <span>Candado 2: Pedido mínimo alcanzado (≥ 12 unidades R-K09)</span>
          <span className={cumpleMinimo ? styles.checkTagOk : styles.checkTagWarn}>
            {cumpleMinimo ? `CUMPLE (${totalPrendas} prendas)` : `MENOR A 12 (${totalPrendas})`}
          </span>
        </li>
        <li className={styles.checkItem}>
          <span>Candado 3: Logística y datos de despacho asignados (R-A05)</span>
          <span className={tieneEnvio ? styles.checkTagOk : styles.checkTagWarn}>
            {tieneEnvio ? "CONFIGURADO" : "DATOS PENDIENTES"}
          </span>
        </li>
        <li className={styles.checkItem}>
          <span>Candado 4: Fecha de entrega compromiso pactada (R-A09)</span>
          <span className={tieneFechaCompromiso ? styles.checkTagOk : styles.checkTagWarn}>
            {tieneFechaCompromiso ? "DEFINIDA" : "PENDIENTE"}
          </span>
        </li>
      </ul>
    </section>
  );
}
