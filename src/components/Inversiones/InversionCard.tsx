"use client";
import styles from "./InversionCard.module.css";
import { Inversion } from "@/types";

interface Props {
  data: Inversion;
  onDelete: (id: number) => void;
  onEdit: (item: Inversion) => void;
}

export default function InversionCard({ data, onDelete, onEdit }: Props) {
  // Cálculos matemáticos
  const valorInvertido = data.cantidad * data.precioCompra;
  const valorActual = data.cantidad * data.precioActual;
  const diferencia = valorActual - valorInvertido;
  const porcentaje =
    valorInvertido > 0 ? (diferencia / valorInvertido) * 100 : 0;

  const esGanancia = diferencia >= 0;

  const getIcon = () => {
    switch (data.tipo) {
      case "crypto":
        return "₿";
      case "accion":
        return "📈";
      case "cedear":
        return "🇺🇸";
      case "bono":
        return "📜";
      default:
        return "💰";
    }
  };

  return (
    <div className={styles.card} onClick={() => onEdit(data)}>
      <div className={styles.header}>
        <div className={styles.iconBox}>{getIcon()}</div>
        <div className={styles.titleBox}>
          <span className={styles.ticket}>{data.ticket.toUpperCase()}</span>
          <span className={styles.nombre}>{data.nombre}</span>
        </div>

        <div className={styles.badgeTipo}>{data.tipo.toUpperCase()}</div>
      </div>

      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.label}>Cantidad</span>
          <span className={styles.value}>{data.cantidad}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Valor Actual</span>
          <span className={styles.value}>
            {data.moneda} {valorActual.toLocaleString()}
          </span>
        </div>
      </div>

      {/* FOOTER: RENDIMIENTO */}
      <div
        className={`${styles.footer} ${esGanancia ? styles.gain : styles.loss}`}
      >
        <span className={styles.diffValue}>
          {esGanancia ? "+" : ""}
          {data.moneda} {diferencia.toLocaleString()}
        </span>
        <span className={styles.diffPercent}>
          {esGanancia ? "▲" : "▼"} {Math.abs(porcentaje).toFixed(2)}%
        </span>
      </div>

      {/* Botón eliminar flotante (opcional, o en modal) */}
      <button
        className={styles.btnDelete}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(data.id);
        }}
      >
        ✕
      </button>
    </div>
  );
}
