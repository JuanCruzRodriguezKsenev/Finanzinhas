"use client";
import styles from "./CreditCard.module.css";
import { Tarjeta } from "@/types";

interface Props {
  data: Tarjeta;
  consumoActual: number;
  onDelete: (id: number) => void;
  onEdit: (t: Tarjeta) => void; // 👈 NUEVA PROP
  onSelect: (t: Tarjeta) => void;
  isSelected: boolean;
}

export default function CreditCard({
  data,
  consumoActual,
  onDelete,
  onEdit,
  onSelect,
  isSelected,
}: Props) {
  const porcentajeUso =
    data.tipo === "credito" && data.limite > 0
      ? Math.min((consumoActual / data.limite) * 100, 100)
      : 0;

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ""}`}
      style={{ background: data.color }}
      onClick={() => onSelect(data)}
    >
      <div className={styles.topRow}>
        <span className={styles.banco}>{data.banco}</span>

        {/* BOTONES DE ACCIÓN */}
        <div className={styles.actions}>
          <button
            className={styles.btnAction}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(data);
            }}
            title="Editar"
          >
            ✏️
          </button>
          <button
            className={styles.btnAction}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(data.id);
            }}
            title="Eliminar"
          >
            ✕
          </button>
        </div>
      </div>

      <div className={styles.chipRow}>
        <div className={styles.chip}></div>
        <span className={styles.contactless}>)))</span>
      </div>

      <div className={styles.numberRow}>
        <span>••••</span> <span>••••</span> <span>••••</span>{" "}
        <span className={styles.last4}>{data.ultimos4 || "0000"}</span>
      </div>

      <div className={styles.footerRow}>
        <div className={styles.infoGroup}>
          <span className={styles.label}>Titular</span>
          <span className={styles.value}>{data.alias}</span>
        </div>
        <div className={styles.infoGroup}>
          <span className={styles.label}>
            {data.tipo === "credito" ? "Vence" : "Tipo"}
          </span>
          <span className={styles.value}>
            {data.tipo === "credito" ? `Día ${data.diaVencimiento}` : "Débito"}
          </span>
        </div>
      </div>

      {data.tipo === "credito" && (
        <div className={styles.limitBar}>
          <div
            className={styles.limitFill}
            style={{ width: `${porcentajeUso}%` }}
          ></div>
          <span className={styles.limitText}>
            ${consumoActual.toLocaleString()} / ${data.limite.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
