"use client";
import { useState, useEffect, useMemo } from "react";
import styles from "./bienes.module.css";
import { Inmueble, Vehiculo } from "@/types"; // Asegúrate de importar todos los tipos necesarios

// Importamos los componentes visuales que ya creamos
import PropiedadCard from "@/components/Inmuebles/PropiedadCard";
import VehiculoCard from "@/components/Vehiculos/VehiculosCard";

// Importamos las vistas completas (Lógica copiada de las páginas anteriores)
// Para que esto funcione bien y limpio, lo ideal es mover la lógica de "PaginaInmuebles"
// a un componente "VistaInmuebles" y "PaginaVehiculos" a "VistaVehiculos".
//
// 👇 Aquí importaremos las páginas anteriores como COMPONENTES.
// (Necesitarás renombrar los archivos anteriores o copiar su contenido en componentes nuevos).
//
// ESTRATEGIA RÁPIDA: Vamos a renderizar condicionalmente los componentes completos.
// Pero como Next.js usa rutas, lo mejor es importar la lógica.

import VistaInmuebles from "../inmuebles/page";
import VistaVehiculos from "../vehiculos/page";

// ⚠️ TRUCO: Next.js permite importar una 'page' como si fuera un componente normal
// siempre que sea "use client". Esto nos ahorra reescribir todo el código.

export default function PaginaBienes() {
  const [tab, setTab] = useState<"inmuebles" | "vehiculos">("inmuebles");

  // Estados para calcular el TOTAL PATRIMONIAL en el header unificado
  const [totalInmuebles, setTotalInmuebles] = useState(0);
  const [totalVehiculos, setTotalVehiculos] = useState(0);

  // Leemos el localStorage solo para el cálculo del header (las vistas manejan su propia data)
  useEffect(() => {
    const dataInm = JSON.parse(
      localStorage.getItem("finansinho-inmuebles") || "[]"
    );
    const dataVeh = JSON.parse(
      localStorage.getItem("finansinho-vehiculos") || "[]"
    );

    const sumaInm = dataInm
      .filter((i: any) => i.moneda === "USD")
      .reduce((acc: number, i: any) => acc + i.valorCompra, 0);
    const sumaVeh = dataVeh
      .filter((v: any) => v.moneda === "USD")
      .reduce((acc: number, v: any) => acc + v.valorEstimado, 0);

    setTotalInmuebles(sumaInm);
    setTotalVehiculos(sumaVeh);
  }, [tab]); // Recalcular al cambiar de tab (asume que editaste algo)

  const patrimonioTotal = totalInmuebles + totalVehiculos;

  return (
    <main className={styles.main}>
      {/* HEADER UNIFICADO */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mis Bienes 💎</h1>
          <p className={styles.subtitle}>
            Patrimonio Total:{" "}
            <b className={styles.success}>
              USD {patrimonioTotal.toLocaleString()}
            </b>
          </p>
        </div>

        {/* TABS SWITCHER */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              tab === "inmuebles" ? styles.activeTab : ""
            }`}
            onClick={() => setTab("inmuebles")}
          >
            🏠 Inmuebles{" "}
            <span className={styles.badgeCount}>
              ${totalInmuebles.toLocaleString()}
            </span>
          </button>
          <button
            className={`${styles.tab} ${
              tab === "vehiculos" ? styles.activeTab : ""
            }`}
            onClick={() => setTab("vehiculos")}
          >
            🚘 Vehículos{" "}
            <span className={styles.badgeCount}>
              ${totalVehiculos.toLocaleString()}
            </span>
          </button>
        </div>
      </div>

      {/* RENDERIZADO CONDICIONAL DE LAS VISTAS */}
      <div className={styles.contentArea}>
        {tab === "inmuebles" ? (
          // 👇 Aquí renderizamos la página de Inmuebles tal cual la tenías
          // Nota: Al importarla como componente, perderá su propio "main" padding si no tenemos cuidado con el CSS
          <div className={styles.viewWrapper}>
            <VistaInmuebles />
          </div>
        ) : (
          <div className={styles.viewWrapper}>
            <VistaVehiculos />
          </div>
        )}
      </div>
    </main>
  );
}
