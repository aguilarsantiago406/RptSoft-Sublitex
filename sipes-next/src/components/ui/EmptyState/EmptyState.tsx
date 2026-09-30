import type { ReactNode, ComponentType } from "react";
import styles from "./emptyState.module.css";

interface EmptyStateProps {
  icon?: ComponentType<{ size?: number | string; className?: string }>;
  iconText?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, iconText, title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.iconWrap}>
        {Icon ? <Icon size={22} /> : iconText ? <span>{iconText}</span> : null}
      </div>
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}