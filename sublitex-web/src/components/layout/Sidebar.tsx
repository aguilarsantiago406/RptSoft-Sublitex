"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cerrarSesion } from "@/services/authApi";
import styles from "./Sidebar.module.css";

function IconoPedidos() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M6 3.5h8a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 14 16.5H6A1.5 1.5 0 0 1 4.5 15V5A1.5 1.5 0 0 1 6 3.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M7.5 7.5h5M7.5 10.5h5M7.5 13.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconoClientes() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="8" cy="7.5" r="2.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 16c0-2.4 2-4 4.5-4s4.5 1.6 4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13.5 6.2a2.2 2.2 0 0 1 0 4.3M15.5 15.6c0-1.5-.7-2.7-1.8-3.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconoCatalogo() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3 3.5 6 10 9l6.5-3L10 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M3.5 10 10 13l6.5-3M3.5 13.6 10 16.6l6.5-3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function IconoSalida() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M12 3.5h3A1.5 1.5 0 0 1 16.5 5v10a1.5 1.5 0 0 1-1.5 1.5h-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8.5 6.5 11 10l-2.5 3.5M11 10H3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const pedidosActivo =
    pathname === "/pedidos" || pathname.startsWith("/pedidos/");

  function handleCerrarSesion() {
    cerrarSesion();
    router.push("/login");
  }

  return (
    <aside className={styles.sidebar}>
      <Link href="/pedidos" className={styles.brand} aria-label="Sublitex — inicio">
        <span className={styles.brandMark} aria-hidden="true">
          <span className={styles.brandMarkInner}>S</span>
        </span>
        <span className={styles.brandText}>
          <span className={styles.wordmark}>SUBLITEX</span>
          <span className={styles.tagline}>SIPES · Suite de pedidos</span>
        </span>
      </Link>

      <nav className={styles.nav} aria-label="Navegación principal">
        <span className={styles.navSection}>Operación</span>

        <Link
          href="/pedidos"
          className={`${styles.navItem} ${pedidosActivo ? styles.navItemActivo : ""}`}
          aria-current={pedidosActivo ? "page" : undefined}
        >
          <span className={styles.navIcon}>
            <IconoPedidos />
          </span>
          <span className={styles.navLabel}>Pedidos</span>
        </Link>

        <span className={styles.navSection}>Próximamente</span>

        <span className={`${styles.navItem} ${styles.navItemDisabled}`} aria-disabled="true">
          <span className={styles.navIcon}>
            <IconoClientes />
          </span>
          <span className={styles.navLabel}>Clientes</span>
        </span>

        <span className={`${styles.navItem} ${styles.navItemDisabled}`} aria-disabled="true">
          <span className={styles.navIcon}>
            <IconoCatalogo />
          </span>
          <span className={styles.navLabel}>Catálogo</span>
        </span>
      </nav>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.logout}
          onClick={handleCerrarSesion}
        >
          <span className={styles.navIcon}>
            <IconoSalida />
          </span>
          <span className={styles.logoutLabel}>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
