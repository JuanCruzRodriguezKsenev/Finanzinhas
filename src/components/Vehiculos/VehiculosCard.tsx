"use client";
import styles from "./VehiculosCard.module.css";
import { Vehiculo } from "@/types";

interface Props {
  data: Vehiculo;
  onDelete: (id: number) => void;
  onEdit: (item: Vehiculo) => void;
  onSelect: (item: Vehiculo) => void;
  isSelected?: boolean;
}

export default function VehiculoCard({
  data,
  onDelete,
  onEdit,
  onSelect,
  isSelected,
}: Props) {
  const getIcon = () => {
    switch (data.tipo) {
      case "auto":
        return "🚗";
      case "moto":
        return "🏍️";
      case "camioneta":
        return "🚙";
      default:
        return "🚜";
    }
  };

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ""}`}
      onClick={() => onSelect(data)}
    >
      <div className={styles.header}>
        <div className={styles.iconBox}>{getIcon()}</div>
        <div className={styles.titleBox}>
          <span className={styles.alias}>{data.alias}</span>
          <span className={styles.modelo}>
            {data.marca} {data.modelo} ({data.anio})
          </span>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.btnAction}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(data);
            }}
          >
            ✏️
          </button>
          <button
            className={`${styles.btnAction} ${styles.btnDelete}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(data.id);
            }}
          >
            ✕
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.label}>Patente</span>
          <span className={styles.plate}>
            {data.patente.toUpperCase() || "---"}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Valor</span>
          <span className={styles.value}>
            {data.moneda} {data.valorEstimado.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
