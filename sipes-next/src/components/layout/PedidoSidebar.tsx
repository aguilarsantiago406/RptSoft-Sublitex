"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ClipboardList, Users, Shirt, FileText } from "lucide-react";
import { actionLogout } from "@/features/auth/actions/auth.actions";
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
      icon: ClipboardList,
      isActive: pathname === basePath,
    },
    {
      label: "Participantes",
      href: `${basePath}/participantes`,
      icon: Users,
      isActive: pathname.startsWith(`${basePath}/participantes`),
    },
    {
      label: "Prendas",
      href: `${basePath}/prendas`,
      icon: Shirt,
      isActive: pathname.startsWith(`${basePath}/prendas`),
    },
    {
      label: "Proforma",
      href: `${basePath}/proforma`,
      icon: FileText,
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
          <Link href="/pedidos" style={{ display: "inline-flex", alignItems: "center" }}>
            <Image
              src="/logo.png"
              alt="Sublitex"
              width={170}
              height={32}
              priority
              className={styles.brandLogo}
              style={{ width: "auto", height: "auto" }}
            />
          </Link>
        </div>

        <div style={{ marginBottom: "18px", padding: "0 10px" }}>
          <Link
            href="/pedidos"
            onClick={() => setOpen(false)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--sky-dark)",
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
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  className={`${styles.navItem} ${item.isActive ? styles.active : ""}`}
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpen(false)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.avatar}>CO</span>
          <div>
            <strong>Coordinación</strong>
            <small>Operación interna</small>
          </div>
        </div>
        <button
          className={styles.logoutButton}
          type="button"
          onClick={() => {
            void actionLogout().finally(() => {
              window.location.assign("/login");
            });
          }}
        >
          Cerrar sesión
        </button>
      </aside>
    </>
  );
}
