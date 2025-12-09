import styles from "./Balance.module.css";

interface Props {
  total: number;
}

export default function Balance({ total }: Props) {
  return (
    <div
      className={`${styles.tarjetaTotal} ${
        total < 0 ? styles.balanceNegativo : ""
      }`}
    >
      <h3>Balance Actual</h3>
      <p className={styles.totalPrecio}>
        {total >= 0 ? "$" : "-$"}
        {Math.abs(total).toLocaleString()}
      </p>
    </div>
  );
}
