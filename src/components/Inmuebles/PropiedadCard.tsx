"use client";
import styles from "./PropiedadCard.module.css";
import { Inmueble } from "@/types";

interface Props {
  data: Inmueble;
  onDelete: (id: number) => void;
  onEdit: (item: Inmueble) => void; // 👈 1. OBLIGATORIO DEFINIR ESTO
  onSelect: (item: Inmueble) => void;
  isSelected?: boolean;
}

// 👇 2. OBLIGATORIO RECIBIR "onEdit" AQUÍ
export default function PropiedadCard({
  data,
  onDelete,
  onEdit,
  onSelect,
  isSelected,
}: Props) {
  const getIcon = () => {
    switch (data.tipo) {
      case "casa":
        return "🏠";
      case "departamento":
        return "🏢";
      case "terreno":
        return "🏞️";
      case "local":
        return "🏪";
      case "cochera":
        return "🚗";
      default:
        return "📍";
    }
  };

  const estaAlquilado = !!data.datosAlquiler;

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ""}`}
      onClick={() => onSelect(data)}
    >
      <div className={styles.header}>
        <div className={styles.iconBox}>{getIcon()}</div>
        <div className={styles.titleBox}>
          <span className={styles.alias}>{data.alias}</span>
          <span className={styles.direccion}>{data.direccion}</span>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className={styles.actions}>
          {/* 👇 3. EL BOTÓN QUE LLAMA A LA FUNCIÓN */}
          <button
            className={styles.btnAction}
            onClick={(e) => {
              e.stopPropagation(); // Evita seleccionar la tarjeta al editar
              onEdit(data);
            }}
            title="Editar Datos"
          >
            ✏️
          </button>

          <button
            className={`${styles.btnAction} ${styles.btnDelete}`}
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

      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.label}>Valor</span>
          <span className={styles.value}>
            {data.moneda} {data.valorCompra.toLocaleString()}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Estado</span>
          <span
            className={`${styles.badge} ${
              estaAlquilado ? styles.alquilado : styles.libre
            }`}
          >
            {estaAlquilado ? "ALQUILADO" : "USO PROPIO"}
          </span>
        </div>
      </div>
    </div>
  );
}
