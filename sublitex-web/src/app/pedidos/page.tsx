"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { EstadoPedido, PedidoResumen } from "@/types/pedidos";
import styles from "./pedidos.module.css";

// ---------------------------------------------------------------------------
// Estilos de estado
// ---------------------------------------------------------------------------

const ESTADO_LABEL: Record<EstadoPedido, string> = {
  BORRADOR: "Borrador",
  EN_CONFIGURACION: "En configuración",
  EN_RECOLECCION: "En recolección",
  EN_REVISION: "En revisión",
  CERRADO: "Cerrado",
  EN_PRODUCCION: "En producción",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const ESTADO_CLASE: Record<EstadoPedido, string> = {
  BORRADOR: styles.estadoBorrador,
  EN_CONFIGURACION: styles.estadoConfiguracion,
  EN_RECOLECCION: styles.estadoRecoleccion,
  EN_REVISION: styles.estadoRevision,
  CERRADO: styles.estadoCerrado,
  EN_PRODUCCION: styles.estadoProduccion,
  ENTREGADO: styles.estadoEntregado,
  CANCELADO: styles.estadoCancelado,
};

// ---------------------------------------------------------------------------
// Componente de Vista
// ---------------------------------------------------------------------------

export default function ListaPedidos() {
  const [pedidos, setPedidos] = useState<PedidoResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pedidos")
      .then((res) => {
        if (!res.ok) throw new Error("Error al consultar /api/pedidos");
        return res.json();
      })
      .then((data: PedidoResumen[]) => {
        setPedidos(data);
        setCargando(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setCargando(false);
      });
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pedidos</h1>
          <p className={styles.subtitle}>Gestión de pedidos y grillas de prendas</p>
        </div>
        <button className={styles.nuevoBtn}>+ Nuevo pedido</button>
      </div>

      {cargando && (
        <div className={styles.cargando}>
          <span className={styles.spinner} />
          Cargando pedidos desde la API...
        </div>
      )}

      {error && (
        <div className={styles.errorBox}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {!cargando && !error && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.theadRow}>
                <th className={styles.th}>Código</th>
                <th className={styles.th}>Cliente</th>
                <th className={styles.th}>Estado</th>
                <th className={styles.thCenter}>Prendas</th>
                <th className={styles.th}>Entrega</th>
                <th className={styles.th} />
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p, i) => (
                <tr
                  key={p.id}
                  className={i % 2 === 0 ? styles.filaPar : styles.filaImpar}
                >
                  <td className={styles.tdCodigo}>{p.codigo}</td>
                  <td className={`${styles.td} ${styles.tdCliente}`}>
                    {p.cliente.nombre}
                  </td>
                  <td className={styles.td}>
                    <span className={`${styles.estadoBadge} ${ESTADO_CLASE[p.estado]}`}>
                      {ESTADO_LABEL[p.estado]}
                    </span>
                  </td>
                  <td className={styles.tdCenter}>
                    {p.totalPrendas > 0 ? p.totalPrendas : "—"}
                  </td>
                  <td className={`${styles.td} ${p.fechaCompromiso ? "" : styles.tdSinFecha}`}>
                    {p.fechaCompromiso
                      ? new Date(p.fechaCompromiso).toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Sin fecha"}
                  </td>
                  <td className={styles.td}>
                    <Link href={`/pedidos/${p.id}`} className={styles.verBtn}>
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}