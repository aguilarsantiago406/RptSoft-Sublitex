"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./layout.module.css";

const sections = [
  {
    label: "Operación",
    items: [
      { label: "Pedidos", href: "/pedidos", icon: "PD" },
      { label: "Clientes", icon: "CL" },
      { label: "Producción", icon: "PR" },
    ],
  },
  {
    label: "Configuración",
    items: [
      { label: "Catálogos", icon: "CA" },
      { label: "Usuarios", icon: "US" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className={styles.menuButton} onClick={() => setOpen(true)} aria-label="Abrir menú">☰</button>
      {open && <button className={styles.backdrop} onClick={() => setOpen(false)} aria-label="Cerrar menú" />}
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>S</span>
          <div><strong>SIPES</strong><small>Sublitex</small></div>
        </div>

        <nav className={styles.nav} aria-label="Navegación principal">
          {sections.map((section) => (
            <div className={styles.navSection} key={section.label}>
              <p>{section.label}</p>
              {section.items.map((item) => {
                const active = item.href ? pathname.startsWith(item.href) : false;
                return item.href ? (
                  <Link
                    className={`${styles.navItem} ${active ? styles.active : ""}`}
                    href={item.href}
                    key={item.label}
                    onClick={() => setOpen(false)}
                  >
                    <span className={styles.navIcon}>{item.icon}</span><span>{item.label}</span>
                  </Link>
                ) : (
                  <span className={`${styles.navItem} ${styles.disabled}`} key={item.label} aria-disabled="true">
                    <span className={styles.navIcon}>{item.icon}</span><span>{item.label}</span><small>Próximo</small>
                  </span>
                );
              })}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.avatar}>CO</span>
          <div><strong>Coordinación</strong><small>Operación interna</small></div>
        </div>
      </aside>
    </>
  );
}
