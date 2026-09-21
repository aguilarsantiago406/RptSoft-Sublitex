"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./layout.module.css";

interface PedidoSidebarProps {
  pedidoId: string;
}

export function PedidoSidebar({ pedidoId }: PedidoSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const basePath = `/pedidos/${pedidoId}`;

  const navItems = [
    {
      label: "Datos del pedido",
      href: basePath,
      icon: "DP",
      isActive: pathname === basePath,
    },
    {
      label: "Prendas",
      href: `${basePath}/prendas`,
      icon: "PR",
      isActive: pathname.startsWith(`${basePath}/prendas`),
    },
    {
      label: "Proforma",
      href: `${basePath}/proforma`,
      icon: "PF",
      isActive: pathname.startsWith(`${basePath}/proforma`),
    },
  ];

  return (
    <>
      <button className={styles.menuButton} onClick={() => setOpen(true)} aria-label="Abrir menú">
        ☰
      </button>
      {open && <button className={styles.backdrop} onClick={() => setOpen(false)} aria-label="Cerrar menú" />}
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>S</span>
          <div>
            <strong>SIPES</strong>
            <small>Contexto Pedido</small>
          </div>
        </div>

        <div style={{ marginBottom: "18px", padding: "0 10px" }}>
          <Link
            href="/pedidos"
            onClick={() => setOpen(false)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#9eb1bd",
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            ← Volver a pedidos
          </Link>
        </div>

        <nav className={styles.nav} aria-label="Navegación del pedido">
          <div className={styles.navSection}>
            <p>Secciones del pedido</p>
            {navItems.map((item) => (
              <Link
                className={`${styles.navItem} ${item.isActive ? styles.active : ""}`}
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.avatar}>CO</span>
          <div>
            <strong>Coordinación</strong>
            <small>Operación interna</small>
          </div>
        </div>
      </aside>
    </>
  );
}
