"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ChangeEvent } from "react";
import type { EstadoPedido } from "../types/pedido";
import styles from "./pedidos.module.css";

const ESTADOS_DISPONIBLES: Array<{ label: string; value: EstadoPedido }> = [
  { label: "Borrador", value: "BORRADOR" },
  { label: "En Configuración", value: "EN_CONFIGURACION" },
  { label: "En Recolección", value: "EN_RECOLECCION" },
  { label: "En Revisión", value: "EN_REVISION" },
  { label: "En Producción", value: "EN_PRODUCCION" },
  { label: "Cerrado", value: "CERRADO" },
  { label: "Entregado", value: "ENTREGADO" },
  { label: "Cancelado", value: "CANCELADO" },
];

export function PedidosFiltros({ estadoActual }: { estadoActual?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleEstadoChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nuevoEstado = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (nuevoEstado) {
      params.set("estado", nuevoEstado);
    } else {
      params.delete("estado");
    }

    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  };

  return (
    <div className={styles.filtersBar}>
      <label className={styles.filterLabel} htmlFor="filtro-estado">
        <span>Filtrar por estado:</span>
        <select
          id="filtro-estado"
          className={styles.filterSelect}
          value={estadoActual ?? ""}
          onChange={handleEstadoChange}
        >
          <option value="">Todos los estados</option>
          {ESTADOS_DISPONIBLES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
