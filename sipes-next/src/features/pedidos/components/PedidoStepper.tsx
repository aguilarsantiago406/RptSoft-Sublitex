import { Check, FileText, SlidersHorizontal, Inbox, ScanSearch, ClipboardCheck, Factory, PackageCheck, XCircle } from "lucide-react";
import type { EstadoPedido } from "../types/pedido";
import styles from "./pedidoStepper.module.css";

interface StepperStep {
  estado: EstadoPedido;
  label: string;
  icon: typeof FileText;
}

const MAIN_PATH: StepperStep[] = [
  { estado: "BORRADOR", label: "Borrador", icon: FileText },
  { estado: "EN_CONFIGURACION", label: "Configuración", icon: SlidersHorizontal },
  { estado: "EN_RECOLECCION", label: "Recolección", icon: Inbox },
  { estado: "EN_REVISION", label: "Revisión", icon: ScanSearch },
  { estado: "CERRADO", label: "Cerrado", icon: ClipboardCheck },
  { estado: "EN_PRODUCCION", label: "Producción", icon: Factory },
  { estado: "ENTREGADO", label: "Entregado", icon: PackageCheck },
];

const pathIndex = new Map(MAIN_PATH.map((step, index) => [step.estado, index]));

export function PedidoStepper({ estado }: { estado: EstadoPedido }) {
  if (estado === "CANCELADO") {
    return (
      <div className={styles.canceledCard} role="status">
        <span className={styles.canceledIcon}>
          <XCircle size={20} />
        </span>
        <div>
          <strong>Pedido cancelado</strong>
          <span>El pedido salió del flujo de producción.</span>
        </div>
      </div>
    );
  }

  const current = pathIndex.get(estado) ?? 0;

  return (
    <ol className={styles.stepper} aria-label="Progreso del pedido">
      {MAIN_PATH.map((step, index) => {
        const Icon = step.icon;
        const done = index < current;
        const active = index === current;
        const stateClass = done ? styles.done : active ? styles.active : styles.pending;
        return (
          <li key={step.estado} className={`${styles.step} ${stateClass}`}>
            <span className={`${styles.circle} ${done ? styles.circleDone : active ? styles.circleActive : ""}`}>
              {done ? <Check size={14} strokeWidth={3} /> : <Icon size={14} />}
            </span>
            <span className={styles.label}>{step.label}</span>
            {index < MAIN_PATH.length - 1 && (
              <span className={`${styles.connector} ${done ? styles.connectorDone : ""}`} aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}