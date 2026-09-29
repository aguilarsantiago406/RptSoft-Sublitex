"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Shirt,
  Users,
  Palette,
  ShieldCheck,
  FileText,
} from "lucide-react";
import styles from "./pedidoTabs.module.css";

interface PedidoTabsProps {
  pedidoCodigo: string;
  totalPrendas?: number;
  totalParticipantes?: number;
  disenoVersion?: number;
}

export function PedidoTabs({
  pedidoCodigo,
  totalPrendas,
  totalParticipantes,
  disenoVersion,
}: PedidoTabsProps) {
  const pathname = usePathname();

  const basePath = `/pedidos/${encodeURIComponent(pedidoCodigo)}`;

  // Determinar la pestaña activa
  const isPrendas = pathname.startsWith(`${basePath}/prendas`);
  const isParticipantes = pathname.startsWith(`${basePath}/participantes`);
  const isDiseno = pathname.startsWith(`${basePath}/diseno`);
  const isProforma = pathname.startsWith(`${basePath}/proforma`);
  const isGeneral =
    !isPrendas && !isParticipantes && !isDiseno && !isProforma;

  const tabs = [
    {
      id: "general",
      label: "Ficha General",
      href: basePath,
      icon: ClipboardList,
      active: isGeneral,
    },
    {
      id: "prendas",
      label: "Matriz de Prendas",
      href: `${basePath}/prendas`,
      icon: Shirt,
      active: isPrendas,
      badge: totalPrendas !== undefined ? `${totalPrendas}` : undefined,
    },
    {
      id: "participantes",
      label: "Participantes & WhatsApp",
      href: `${basePath}/participantes`,
      icon: Users,
      active: isParticipantes,
      badge:
        totalParticipantes !== undefined ? `${totalParticipantes}` : undefined,
    },
    {
      id: "diseno",
      label: "Taller de Diseño",
      href: `${basePath}/diseno`,
      icon: Palette,
      active: isDiseno,
      badge: disenoVersion ? `v${disenoVersion}` : undefined,
    },
    {
      id: "calidad",
      label: "Control de Calidad",
      href: `${basePath}#seccion-revision`,
      icon: ShieldCheck,
      active: false,
    },
    {
      id: "proforma",
      label: "Proforma Comercial",
      href: `${basePath}/proforma`,
      icon: FileText,
      active: isProforma,
    },
  ];

  return (
    <nav className={styles.tabsWrapper} aria-label="Secciones del pedido">
      <div className={styles.tabsList} role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              role="tab"
              aria-selected={tab.active}
              className={`${styles.tabItem} ${
                tab.active ? styles.tabItemActive : ""
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge && <span className={styles.tabBadge}>{tab.badge}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
