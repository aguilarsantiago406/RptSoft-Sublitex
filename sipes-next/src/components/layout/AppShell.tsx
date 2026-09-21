"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MainSidebar } from "./MainSidebar";
import { PedidoSidebar } from "./PedidoSidebar";
import styles from "./layout.module.css";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Si la ruta activa empieza con /pedidos/[id] (excepto /pedidos/nuevo), activa PedidoSidebar
  const match = pathname.match(/^\/pedidos\/([^/]+)/);
  const isPedidoContext = Boolean(match && match[1] !== "nuevo");
  const pedidoId = isPedidoContext ? match![1] : "";

  return (
    <div className={styles.shell}>
      <Suspense fallback={<aside className={styles.sidebarFallback} />}>
        {isPedidoContext ? <PedidoSidebar pedidoId={pedidoId} /> : <MainSidebar />}
      </Suspense>
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <span>Sistema de pedidos</span>
            <strong>Operación Sublitex</strong>
          </div>
          <span className={styles.sprint}>Sprint 1</span>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
