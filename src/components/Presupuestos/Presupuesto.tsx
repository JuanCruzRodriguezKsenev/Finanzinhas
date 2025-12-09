"use client";
import { useState } from "react";
import styles from "./PresupuestoMensual.module.css";
import { Transaccion } from "@/types";

// Definimos el tipo de un ítem individual aquí para facilitar las cosas
// (Ya que PresupuestoMensual ahora es el objeto del mes completo)
interface CategoriaPresupuesto {
  categoria: string;
  montoMaximo: number;
}

interface Props {
  categorias: CategoriaPresupuesto[]; // 👇 Lista de categorías del mes
  transaccionesMes: Transaccion[];
  onAgregar: (nombre: string, monto: number) => void; // 👇 Simplificado
  onEliminar: (categoria: string) => void; // 👇 Eliminamos por nombre
}

const CATEGORIAS_SUGERIDAS = [
  "Comida",
  "Transporte",
  "Servicios",
  "Ocio",
  "Ropa",
  "Salud",
  "Educación",
  "Inversiones",
];

export default function Presupuestos({
  categorias,
  transaccionesMes,
  onAgregar,
  onEliminar,
}: Props) {
  const [nuevoMonto, setNuevoMonto] = useState("");
  const [nuevaCat, setNuevaCat] = useState(CATEGORIAS_SUGERIDAS[0]);

  const handleAgregar = () => {
    if (!nuevoMonto || !nuevaCat) return;
    // Llamamos al padre pasando los datos limpios
    onAgregar(nuevaCat, parseFloat(nuevoMonto));
    setNuevoMonto("");
  };

  // Función auxiliar para calcular estado de la barra
  const calcularEstado = (categoria: string, limite: number) => {
    const gastado = transaccionesMes
      .filter((t) => t.tipo === "gasto" && t.categoria === categoria)
      .reduce((acc, t) => acc + t.monto, 0);

    const porcentaje = Math.min((gastado / limite) * 100, 100);

    let claseColor = styles.verde;
    if (gastado > limite) claseColor = styles.rojo;
    else if (gastado > limite * 0.8) claseColor = styles.amarillo;

    return { gastado, porcentaje, claseColor };
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>🎯 Metas Mensuales</h3>
      </div>

      <div className={styles.lista}>
        {categorias.length > 0 ? (
          categorias.map((p, index) => {
            const { gastado, porcentaje, claseColor } = calcularEstado(
              p.categoria,
              p.montoMaximo
            );

            return (
              // Usamos index o categoria como key ya que no tenemos ID numérico en la nueva estructura
              <div key={p.categoria} className={styles.item}>
                <div className={styles.infoRow}>
                  <span>{p.categoria}</span>
                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                      alignItems: "center",
                    }}
                  >
                    <span className={styles.montoGasto}>
                      ${gastado.toLocaleString()} / $
                      {p.montoMaximo.toLocaleString()}
                    </span>
                    <button
                      onClick={() => onEliminar(p.categoria)}
                      className={styles.btnBorrar}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className={styles.barraFondo}>
                  <div
                    className={`${styles.barraRelleno} ${claseColor}`}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className={styles.vacio}>
            No has definido presupuestos para este mes.
          </p>
        )}
      </div>

      {/* Formulario rápido */}
      <div className={styles.formAdd}>
        <select
          className={styles.select}
          value={nuevaCat}
          onChange={(e) => setNuevaCat(e.target.value)}
        >
          {CATEGORIAS_SUGERIDAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="$ Límite"
          className={styles.input}
          value={nuevoMonto}
          onChange={(e) => setNuevoMonto(e.target.value)}
        />
        <button onClick={handleAgregar} className={styles.btnAgregar}>
          +
        </button>
      </div>
    </div>
  );
}
