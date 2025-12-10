"use client";
import styles from "./ReservaCard.module.css";
import { Reserva } from "@/types";

interface Props {
  data: Reserva;
  onDelete: (id: number) => void;
  onEdit: (item: Reserva) => void;
}

export default function ReservaCard({ data, onDelete, onEdit }: Props) {
  const getIcon = () => {
    switch (data.tipo) {
      case "efectivo":
        return "💵";
      case "crypto":
        return "🪙";
      case "banco":
        return "🏦";
      case "billetera":
        return "📱"; // Apps como MP, Uala
      default:
        return "💰";
    }
  };

  // Cálculo de rendimiento mensual estimado
  const gananciaMensual = data.rendimientoAnual
    ? (data.monto * (data.rendimientoAnual / 100)) / 12
    : 0;

  return (
    <div className={styles.card} onClick={() => onEdit(data)}>
      <div className={styles.header}>
        <div className={styles.iconBox}>{getIcon()}</div>
        <div className={styles.titleBox}>
          <span className={styles.nombre}>{data.nombre}</span>
          <span className={styles.ubicacion}>{data.ubicacion}</span>
        </div>
        <div className={styles.badgeObjetivo}>{data.objetivo}</div>
      </div>

      <div className={styles.body}>
        <span className={styles.moneda}>{data.moneda}</span>
        <span className={styles.monto}>{data.monto.toLocaleString()}</span>
      </div>

      {/* FOOTER: RENDIMIENTO (Si aplica) */}
      <div className={styles.footer}>
        {data.rendimientoAnual && data.rendimientoAnual > 0 ? (
          <div className={styles.rendimientoBox}>
            <span className={styles.tna}>🚀 {data.rendimientoAnual}% TNA</span>
            <span className={styles.ganancia}>
              + {data.moneda === "USD" || data.moneda === "USDT" ? "USD" : "$"}
              {gananciaMensual.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}{" "}
              /mes
            </span>
          </div>
        ) : (
          <div className={styles.sinRendimiento}>Sin rendimiento activo 💤</div>
        )}
      </div>

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
