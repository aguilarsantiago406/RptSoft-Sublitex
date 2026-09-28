import { Package, Truck, CheckCircle2, Shirt } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import type { PedidoResumen, EstadoPedido } from "../types/pedido";
import styles from "./pedidos.module.css";

const inProgress: EstadoPedido[] = ["BORRADOR", "EN_CONFIGURACION", "EN_RECOLECCION", "EN_REVISION"];
const closed: EstadoPedido[] = ["CERRADO", "EN_PRODUCCION", "ENTREGADO"];

export function PedidosKpis({ pedidos }: { pedidos: PedidoResumen[] }) {
  const total = pedidos.length;
  const enCurso = pedidos.filter((p) => inProgress.includes(p.estado)).length;
  const completados = pedidos.filter((p) => closed.includes(p.estado)).length;
  const prendas = pedidos.reduce((sum, p) => sum + (p.totalPrendas ?? 0), 0);

  return (
    <div className={styles.kpiGrid} role="list">
      <StatCard label="Pedidos" value={total} icon={Package} accent="slate" />
      <StatCard label="En curso" value={enCurso} icon={Truck} accent="sky" />
      <StatCard label="Completados" value={completados} icon={CheckCircle2} accent="green" />
      <StatCard label="Prendas" value={prendas} icon={Shirt} accent="violet" />
    </div>
  );
}