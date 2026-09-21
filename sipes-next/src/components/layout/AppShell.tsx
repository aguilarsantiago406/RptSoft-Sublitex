import { Suspense, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import styles from "./layout.module.css";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <Suspense fallback={<aside className={styles.sidebarFallback} />}>
        <Sidebar />
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
