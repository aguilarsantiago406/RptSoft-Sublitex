"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { PedidoResumen } from "@/types/pedidos";
import { obtenerPedidos } from "@/services/pedidosApi";
import { EstadoBadge } from "@/components/pedidos/EstadoBadge";
import styles from "./pedidos.module.css";

// ---------------------------------------------------------------------------
// Íconos inline
// ---------------------------------------------------------------------------

function IconBox() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2.8 3.5 5.9 10 9l6.5-3.1L10 2.8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M3.5 5.9v8.2L10 17.2l6.5-3.1V5.9M10 9v8.2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function IconShirt() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M7.2 3.2 4 5l1.3 3.1 1.2-.5v8.2h7V7.6l1.2.5L16 5l-3.2-1.8a2.8 2.8 0 0 1-5.6 0Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconGear() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconInbox() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.5 12.5 6 5.5h12l2.5 7v5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5v-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3.5 12.5h4l1.2 2.2h6.6l1.2-2.2h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4 21 19.5H3L12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 10v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16.6" r="1" fill="currentColor" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg className={styles.spin} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="var(--border-strong)" strokeWidth="2.4" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="var(--primary)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Componente de Vista
// ---------------------------------------------------------------------------

export default function ListaPedidos() {
  const [pedidos, setPedidos] = useState<PedidoResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let montado = true;

    obtenerPedidos()
      .then((data) => {
        if (!montado) return;
        setPedidos(data);
        setCargando(false);
      })
      .catch((err: Error) => {
        if (!montado) return;
        setError(err.message || "Error al consultar los pedidos");
        setCargando(false);
      });

    return () => {
      montado = false;
    };
  }, []);

  const resumen = useMemo(() => {
    const prendas = pedidos.reduce((acc, p) => acc + (p.totalPrendas ?? 0), 0);
    const enProduccion = pedidos.filter((p) => p.estado === "EN_PRODUCCION").length;
    return { total: pedidos.length, prendas, enProduccion };
  }, [pedidos]);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroMain}>
          <span className={styles.eyebrow}>SIPES · Operación</span>
          <h1 className={styles.title}>Pedidos</h1>
          <p className={styles.subtitle}>
            Gestión de pedidos y grillas de prendas
          </p>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statIcon}><IconBox /></span>
            <span className={styles.statLabel}>Total pedidos</span>
            <span className={styles.statValue}>{resumen.total}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statIcon}><IconShirt /></span>
            <span className={styles.statLabel}>Prendas</span>
            <span className={styles.statValue}>{resumen.prendas}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statIcon}><IconGear /></span>
            <span className={styles.statLabel}>En producción</span>
            <span className={styles.statValue}>{resumen.enProduccion}</span>
          </div>
        </div>
      </section>

      {cargando && (
        <div className={styles.estadoCard}>
          <span className={styles.estadoIcono}><IconSpinner /></span>
          <div className={styles.estadoTitulo}>Cargando pedidos</div>
          <p className={styles.estadoTexto}>Consultando la información desde la API…</p>
        </div>
      )}

      {error && (
        <div className={`${styles.estadoCard} ${styles.estadoError}`}>
          <span className={styles.estadoIcono}><IconAlert /></span>
          <div className={styles.estadoTitulo}>No se pudieron cargar los pedidos</div>
          <p className={styles.estadoTexto}>{error}</p>
          <p className={styles.estadoHint}>
            Verificá que el backend esté corriendo y reintentá.
          </p>
        </div>
      )}

      {!cargando && !error && pedidos.length === 0 && (
        <div className={styles.estadoCard}>
          <span className={styles.estadoIcono}><IconInbox /></span>
          <div className={styles.estadoTitulo}>Todavía no hay pedidos</div>
          <p className={styles.estadoTexto}>
            Cuando se registre un pedido, va a aparecer en esta lista.
          </p>
        </div>
      )}

      {!cargando && !error && pedidos.length > 0 && (
        <section className={styles.panel}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.theadRow}>
                  <th className={styles.th}>Código</th>
                  <th className={styles.th}>Cliente</th>
                  <th className={styles.th}>Estado</th>
                  <th className={styles.thRight}>Prendas</th>
                  <th className={styles.th}>Entrega</th>
                  <th className={styles.thAccion} />
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id} className={styles.fila}>
                    <td className={styles.tdCodigo}>{p.codigo}</td>
                    <td className={`${styles.td} ${styles.tdCliente}`}>
                      {p.cliente.nombre}
                    </td>
                    <td className={styles.td}>
                      <EstadoBadge estado={p.estado} />
                    </td>
                    <td className={styles.tdRight}>
                      {p.totalPrendas !== undefined && p.totalPrendas > 0
                        ? p.totalPrendas
                        : "—"}
                    </td>
                    <td className={`${styles.td} ${styles.tdFecha}`}>
                      {p.fechaCompromiso
                        ? new Date(p.fechaCompromiso).toLocaleDateString("es-PE", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Sin fecha"}
                    </td>
                    <td className={`${styles.td} ${styles.tdAccion}`}>
                      <Link href={`/pedidos/${p.id}`} className={styles.verLink}>
                        Ver
                        <span className={styles.verArrow} aria-hidden="true">→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.tablaFooter}>
            {pedidos.length} pedido{pedidos.length === 1 ? "" : "s"}
          </div>
        </section>
      )}
    </main>
  );
}
