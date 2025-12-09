"use client";

import { useState, useEffect } from "react";
import { Transaccion } from "@/types";
import SeccionEstadistica from "@/components/SeccionEstadisticas/SeccionEstadisticas";
import styles from "./estadisticas.module.css";

export default function PaginaEstadisticas() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [tema, setTema] = useState("claro");
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    const datos = localStorage.getItem("finansinho-datos");
    if (datos) {
      try {
        setTransacciones(JSON.parse(datos));
      } catch (e) {
        console.error(e);
      }
    }
    const temaGuardado = localStorage.getItem("finansinho-tema");
    if (temaGuardado) setTema(temaGuardado);
  }, []);

  if (!montado) return null;

  return (
    <main
      className={`${styles.main} ${
        tema === "oscuro" ? styles.oscuro : styles.claro
      }`}
    >
      {/* Solo título, sin botón de volver */}
      <div className={styles.topBar}>
        <h1>Panel de Estadísticas 📊</h1>
      </div>

      <div className={styles.gridDashboard}>
        <SeccionEstadistica
          titulo="Resumen Anual"
          tipo="anual"
          datos={transacciones}
        />
        <SeccionEstadistica
          titulo="Resumen Mensual"
          tipo="mensual"
          datos={transacciones}
        />
        <SeccionEstadistica
          titulo="Resumen Semanal"
          tipo="semanal"
          datos={transacciones}
        />
        <SeccionEstadistica
          titulo="Resumen Diario"
          tipo="diario"
          datos={transacciones}
        />
      </div>
    </main>
  );
}
