"use client";

import { useEffect, useRef, ReactNode, MouseEvent } from "react";
import styles from "./FormDialog.module.css";

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function FormDialog({
  open,
  onClose,
  title,
  children,
}: FormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [open]);

  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    e.preventDefault();
    onClose();
  };

  const handleClickOutside = (e: MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!isInDialog) {
      onClose();
    }
  };

  // 👇 CAMBIO CLAVE: Quitamos el "if (!open) return null"
  // El dialog siempre se renderiza, pero el navegador lo oculta nativamente.
  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onCancel={handleCancel}
      onClick={handleClickOutside}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className={styles.closeButton}
          title="Cerrar"
        >
          ✕
        </button>
      </div>

      <div className={styles.content}>{children}</div>
    </dialog>
  );
}
