"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const rutas = [
    { nombre: "Dashboard", path: "/", icono: "🏠" },
    { nombre: "Estadísticas", path: "/estadisticas", icono: "📊" },
    // ... dentro de rutas ...
    { nombre: "Presupuestos", path: "/presupuestos", icono: "🎯" },
    // Dentro del array de rutas:
    { nombre: "Tarjetas", path: "/tarjetas", icono: "💳" },
  ];

  return (
    <nav className={styles.navbar}>
      {/* ZONA SUPERIOR: LOGO Y LINKS */}
      <div className={styles.container}>
        <div className={styles.logo}>
          <span>💰 Finansinho</span>
        </div>

        <ul className={styles.links}>
          {rutas.map((ruta) => {
            const isActive = pathname === ruta.path;
            return (
              <li key={ruta.path} style={{ width: "100%" }}>
                <Link
                  href={ruta.path}
                  className={`${styles.link} ${isActive ? styles.active : ""}`}
                >
                  <span>{ruta.icono}</span>
                  <span>{ruta.nombre}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ZONA INFERIOR: TEMA */}
      <div className={styles.footerNav}>
        <button onClick={toggleTheme} className={styles.themeToggle}>
          <span>{theme === "claro" ? "🌙" : "☀️"}</span>
          <span className={styles.textoTema}>
            {theme === "claro" ? "Modo Oscuro" : "Modo Claro"}
          </span>
        </button>
      </div>
    </nav>
  );
}
