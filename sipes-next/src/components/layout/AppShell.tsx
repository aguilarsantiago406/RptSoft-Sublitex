"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MainSidebar } from "./MainSidebar";
import { PedidoSidebar } from "./PedidoSidebar";
import styles from "./layout.module.css";

const routeLabels: Record<string, string> = {
  "/pedidos": "Pedidos",
  "/clientes": "Clientes",
  "/catalogos": "Catálogos",
  "/usuarios": "Usuarios",
};

function toCrumb(pathname: string): { root: string; page: string } {
  const parts = pathname.split("/").filter(Boolean);
  const root = parts[0] ? `/${parts[0]}` : "";
  const rootLabel = routeLabels[root] ?? parts[0] ?? "";
  if (parts.length <= 1) return { root: rootLabel, page: "" };

  // /pedidos/[id] → root "Pedidos", page = código o subsección
  if (parts[0] === "pedidos" && parts.length === 2) return { root: "Pedidos", page: "" };
  if (parts[0] === "pedidos" && parts.length >= 3) {
    const section = parts[2];
    const sectionLabel =
      section === "prendas" ? "Prendas" : section === "participantes" ? "Participantes" : section === "proforma" ? "Proforma" : section;
    return { root: "Pedidos", page: sectionLabel };
  }
  return { root: rootLabel, page: parts.slice(1).join(" / ") };
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Si la ruta activa empieza con /pedidos/[id] (excepto /pedidos/nuevo), activa PedidoSidebar
  const match = pathname.match(/^\/pedidos\/([^/]+)/);
  const isPedidoContext = Boolean(match && match[1] !== "nuevo");
  const pedidoId = isPedidoContext ? match![1] : "";

  const crumb = toCrumb(pathname);

  return (
    <div className={styles.shell}>
      <Suspense fallback={<aside className={styles.sidebarFallback} />}>
        {isPedidoContext ? <PedidoSidebar pedidoId={pedidoId} /> : <MainSidebar />}
      </Suspense>
      <div className={styles.workspace}>
        <div className={styles.topbar}>
          <div className={styles.topbarTitle}>
            {crumb.root && <span className={styles.topbarCrumbRoot}>{crumb.root}</span>}
            {crumb.page && (
              <span key={`${pathname}-crumb`} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span className={styles.topbarCrumbSep}>/</span>
                <span className={styles.topbarCrumbActive}>{crumb.page}</span>
              </span>
            )}
          </div>
        </div>
        <div key={pathname} className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
