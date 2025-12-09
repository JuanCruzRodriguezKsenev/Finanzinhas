"use client";
import styles from "./FiltroMes.module.css";

interface Props {
  anio: number;
  mes: number;
  setAnio: (a: number) => void;
  setMes: (m: number) => void;
}

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function FiltroMes({ anio, mes, setAnio, setMes }: Props) {
  const cambiarMes = (direccion: -1 | 1) => {
    let nuevoMes = mes + direccion;
    let nuevoAnio = anio;

    if (nuevoMes > 11) {
      nuevoMes = 0;
      nuevoAnio += 1;
    } else if (nuevoMes < 0) {
      nuevoMes = 11;
      nuevoAnio -= 1;
    }

    setMes(nuevoMes);
    setAnio(nuevoAnio);
  };

  return (
    <div className={styles.filtroContainer}>
      <button onClick={() => cambiarMes(-1)} className={styles.btnNav}>
        ◀
      </button>

      <div className={styles.selectores}>
        <select
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
          className={styles.select}
        >
          {MESES.map((nombre, index) => (
            <option key={index} value={index}>
              {nombre}
            </option>
          ))}
        </select>

        <select
          value={anio}
          onChange={(e) => setAnio(Number(e.target.value))}
          className={styles.select}
        >
          {/* Generamos años desde 2024 hasta 2030 */}
          {Array.from({ length: 7 }, (_, i) => 2024 + i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <button onClick={() => cambiarMes(1)} className={styles.btnNav}>
        ▶
      </button>
    </div>
  );
}
