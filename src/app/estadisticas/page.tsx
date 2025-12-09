"use client";
import { useState, useEffect } from "react";
import { Transaccion } from "@/types";
import SeccionEstadistica from "@/components/SeccionEstadisticas/SeccionEstadisticas";
import styles from "./estadisticas.module.css";

export default function PaginaEstadisticas() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);

  // ❌ BORRAMOS: const [tema, setTema]...

  // ESTADO GLOBAL DE FECHA (Para sincronizar gráficos)
  const [fechaGlobal, setFechaGlobal] = useState(new Date());

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
    // ❌ BORRAMOS la carga del tema local
  }, []);

  if (!montado) return null;

  return (
    // 👇 FIX: Quitamos la lógica ${tema === ...}. Solo dejamos styles.main
    <main className={styles.main}>
      {/* El TopBar ya no lleva botón de volver porque está la Navbar */}
      <div className={styles.topBar}>
        <h1>Panel de Estadísticas 📊</h1>
      </div>

      <div className={styles.gridDashboard}>
        <SeccionEstadistica
          titulo="Resumen Anual"
          tipo="anual"
          datos={transacciones}
          fechaExterna={fechaGlobal}
          setFechaExterna={setFechaGlobal}
        />
        <SeccionEstadistica
          titulo="Resumen Mensual"
          tipo="mensual"
          datos={transacciones}
          fechaExterna={fechaGlobal}
          setFechaExterna={setFechaGlobal}
        />
        <SeccionEstadistica
          titulo="Resumen Semanal"
          tipo="semanal"
          datos={transacciones}
          fechaExterna={fechaGlobal}
          setFechaExterna={setFechaGlobal}
        />
        <SeccionEstadistica
          titulo="Resumen Diario"
          tipo="diario"
          datos={transacciones}
          fechaExterna={fechaGlobal}
          setFechaExterna={setFechaGlobal}
        />
      </div>
    </main>
  );
}
