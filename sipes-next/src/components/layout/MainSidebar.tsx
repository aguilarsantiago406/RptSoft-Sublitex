"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ShoppingBag, Users, Layers, BookOpen, UserCheck, type LucideIcon } from "lucide-react";
import { actionLogout } from "@/features/auth/actions/auth.actions";
import styles from "./layout.module.css";

interface NavItemData {
  label: string;
  href?: string;
  icon: LucideIcon;
}

interface NavSectionData {
  label: string;
  items: NavItemData[];
}

const sections: NavSectionData[] = [
  {
    label: "Operación",
    items: [
      { label: "Pedidos", href: "/pedidos", icon: ShoppingBag },
      { label: "Clientes", href: "/clientes", icon: Users },
      { label: "Producción", icon: Layers },
    ],
  },
  {
    label: "Configuración",
    items: [
      { label: "Catálogos", href: "/catalogos", icon: BookOpen },
      { label: "Usuarios", href: "/usuarios", icon: UserCheck },
    ],
  },
];

export function MainSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
              style={{ height: "32px", width: "auto" }}
            />
          </Link>
        </div>

        <nav className={styles.nav} aria-label="Navegación principal">
          {sections.map((section) => (
            <div className={styles.navSection} key={section.label}>
              <p>{section.label}</p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = item.href ? pathname === item.href || (item.href !== "/pedidos" && pathname.startsWith(item.href)) : false;
                return item.href ? (
                  <Link
                    className={`${styles.navItem} ${active ? styles.active : ""}`}
                    href={item.href}
                    key={item.label}
                    onClick={() => setOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span className={`${styles.navItem} ${styles.disabled}`} key={item.label} aria-disabled="true">
                    <Icon size={18} />
                    <span>{item.label}</span>
                    <small>Próximo</small>
                  </span>
                );
              })}
            </div>
          ))}
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
