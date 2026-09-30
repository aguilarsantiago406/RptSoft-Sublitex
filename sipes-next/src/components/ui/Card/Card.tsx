import type { CSSProperties, HTMLAttributes } from "react";
import styles from "./card.module.css";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "article";
  padding?: "md" | "lg" | "none";
  hover?: boolean;
  style?: CSSProperties;
}

export function Card({ as: Tag = "div", padding = "md", hover = false, className, style, ...rest }: CardProps) {
  const classes = [
    styles.card,
    padding === "lg" ? styles.paddingLg : "",
    padding === "md" ? styles.paddingMd : "",
    padding === "none" ? styles.paddingNone : "",
    hover ? styles.hover : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return <Tag className={classes} style={style} {...rest} />;
}