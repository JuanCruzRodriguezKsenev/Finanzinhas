"use client";
import { useState, useEffect, useMemo } from "react";
import styles from "./activos.module.css";
// Importamos tus vistas anteriores (o copiamos la lógica si prefieres)
// Aquí simularé la estructura de Tabs para unificar todo
import VistaBienes from "../bienes/page"; // La que creamos antes
import VistaInversiones from "../portfolio/page";
import VistaReservas from "../reservas/page";

export default function PaginaActivos() {
  const [tab, setTab] = useState<"bienes" | "inversiones" | "reservas">(
    "bienes"
  );
  const [totalActivos, setTotalActivos] = useState(0);

  // Calcular Total Global (Sumando localStorage de todos)
  useEffect(() => {
    const bienes =
      JSON.parse(localStorage.getItem("finansinho-inmuebles") || "[]").reduce(
        (a: any, b: any) => a + (b.moneda === "USD" ? b.valorCompra : 0),
        0
      ) +
      JSON.parse(localStorage.getItem("finansinho-vehiculos") || "[]").reduce(
        (a: any, b: any) => a + (b.moneda === "USD" ? b.valorEstimado : 0),
        0
      );

    const inversiones = JSON.parse(
      localStorage.getItem("finansinho-inversiones") || "[]"
    )
      .filter((i: any) => i.moneda === "USD")
      .reduce((a: any, b: any) => a + b.cantidad * b.precioActual, 0);

    const reservas = JSON.parse(
      localStorage.getItem("finansinho-reservas") || "[]"
    )
      .filter((r: any) => ["USD", "USDT"].includes(r.moneda))
      .reduce((a: any, b: any) => a + b.monto, 0);

    setTotalActivos(bienes + inversiones + reservas);
  }, [tab]);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mis Activos 🏛️</h1>
          <p className={styles.subtitle}>
            Total Tenencias:{" "}
            <b className={styles.success}>
              USD {totalActivos.toLocaleString()}
            </b>
          </p>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === "bienes" && styles.active}`}
            onClick={() => setTab("bienes")}
          >
            💎 Bienes
          </button>
          <button
            className={`${styles.tab} ${
              tab === "inversiones" && styles.active
            }`}
            onClick={() => setTab("inversiones")}
          >
            📈 Inversiones
          </button>
          <button
            className={`${styles.tab} ${tab === "reservas" && styles.active}`}
            onClick={() => setTab("reservas")}
          >
            💰 Reservas
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {tab === "bienes" && <VistaBienes />}
        {tab === "inversiones" && <VistaInversiones />}
        {tab === "reservas" && <VistaReservas />}
      </div>
    </main>
  );
}
