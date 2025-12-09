"use client";
import styles from "./Balance.module.css";

interface Props {
  total: number;
  ingresos: number;
  gastos: number;
}

export default function Balance({ total, ingresos, gastos }: Props) {
  return (
    <div className={styles.card}>
      <h2 className={styles.titulo}>Balance Actual</h2>

      <div className={styles.montoPrincipal}>
        {total < 0 ? "-" : ""}${Math.abs(total).toLocaleString()}
      </div>

      <div className={styles.desglose}>
        <div className={styles.itemDesglose}>
          <span className={styles.label}>Ingresos</span>
          <span className={styles.valorIngreso}>
            +${ingresos.toLocaleString()}
          </span>
        </div>

        <div className={styles.separador}></div>

        <div className={styles.itemDesglose}>
          <span className={styles.label}>Gastos</span>
          <span className={styles.valorGasto}>-${gastos.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
