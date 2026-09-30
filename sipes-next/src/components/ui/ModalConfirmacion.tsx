"use client";

import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useIsClient } from "@/lib/useIsClient";
import styles from "./modalConfirmacion.module.css";

interface ModalConfirmacionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "success" | "danger";
  isPending?: boolean;
}

export function ModalConfirmacion({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "primary",
  isPending = false,
}: ModalConfirmacionProps) {
  const isClient = useIsClient();

  if (!isOpen || !isClient) return null;

  const IconComponent =
    variant === "danger"
      ? AlertTriangle
      : variant === "success"
      ? CheckCircle
      : Info;

  const iconClass =
    variant === "danger"
      ? styles.iconWrapperDanger
      : variant === "success"
      ? styles.iconWrapperSuccess
      : styles.iconWrapperPrimary;

  const buttonClass =
    variant === "danger"
      ? styles.confirmButtonDanger
      : variant === "success"
      ? styles.confirmButtonSuccess
      : styles.confirmButtonPrimary;

  return createPortal(
    <div className={styles.backdrop} onClick={() => !isPending && onClose()}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.body}>
          <div className={`${styles.iconWrapper} ${iconClass}`}>
            <IconComponent size={26} />
          </div>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.description}>{description}</div>
        </div>
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isPending}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`${styles.confirmButton} ${buttonClass}`}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
