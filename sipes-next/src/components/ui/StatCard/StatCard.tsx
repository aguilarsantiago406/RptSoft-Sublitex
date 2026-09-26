import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import styles from "./statCard.module.css";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  accent?: "sky" | "green" | "amber" | "violet" | "slate";
}

export function StatCard({ label, value, icon: Icon, accent = "sky" }: StatCardProps) {
  const iconClass = `${styles.icon} ${styles[`icon_${accent}`]}`;

  return (
    <div className={styles.card}>
      {Icon && (
        <div className={iconClass}>
          <Icon size={18} />
        </div>
      )}
      <div className={styles.body}>
        <span className={styles.value}>{value}</span>
        <span className={styles.label}>{label}</span>
      </div>
    </div>
  );
}