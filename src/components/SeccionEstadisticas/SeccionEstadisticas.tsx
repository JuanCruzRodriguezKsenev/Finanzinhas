"use client";
import { useState } from "react";
import styles from "./SeccionEstadisticas.module.css";
import { Transaccion } from "@/types";
import Grafico from "@/components/Graficos/Graficos";
import { filtrarTransacciones, obtenerNombrePeriodo } from "@/utils/fechas";

interface Props {
  titulo: string;
  tipo: "anual" | "mensual" | "semanal" | "diario";
  datos: Transaccion[];

  // 👈 PROPS NUEVAS PARA SINCRONIZAR
  fechaExterna?: Date;
  setFechaExterna?: (date: Date) => void;
}

export default function SeccionEstadistica({
  titulo,
  tipo,
  datos,
  fechaExterna,
  setFechaExterna,
}: Props) {
  // Estado interno por si no se usa sincronizado (fallback)
  const [fechaInterna, setFechaInterna] = useState(new Date());

  // Usamos la fecha externa si existe, sino la interna
  const fechaActual = fechaExterna || fechaInterna;

  const cambiarFecha = (direccion: -1 | 1) => {
    const nuevaFecha = new Date(fechaActual);

    if (tipo === "anual")
      nuevaFecha.setFullYear(fechaActual.getFullYear() + direccion);
    else if (tipo === "mensual")
      nuevaFecha.setMonth(fechaActual.getMonth() + direccion);
    else if (tipo === "semanal")
      nuevaFecha.setDate(fechaActual.getDate() + direccion * 7);
    else if (tipo === "diario")
      nuevaFecha.setDate(fechaActual.getDate() + direccion);

    if (setFechaExterna) setFechaExterna(nuevaFecha);
    else setFechaInterna(nuevaFecha);
  };

  // 👈 LA MAGIA: Manejar el click en el gráfico
  const handleGraficoClick = (data: any) => {
    // Si estamos en el gráfico anual y clickean una barra...
    if (
      tipo === "anual" &&
      setFechaExterna &&
      data &&
      data.activeTooltipIndex !== undefined
    ) {
      // activeTooltipIndex es 0 para Enero, 11 para Diciembre
      const mesIndex = data.activeTooltipIndex;

      // Creamos nueva fecha manteniendo el año pero cambiando el mes
      const nuevaFecha = new Date(fechaActual);
      nuevaFecha.setMonth(mesIndex);

      setFechaExterna(nuevaFecha);

      // Opcional: Scroll suave hacia abajo para ver el cambio en el mensual
      // window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const datosFiltrados = filtrarTransacciones(datos, fechaActual, tipo);

  return (
    <section className={styles.seccion}>
      <div className={styles.header}>
        <h2 className={styles.tituloSeccion}>{titulo}</h2>
        <div className={styles.controles}>
          <button onClick={() => cambiarFecha(-1)} className={styles.btnNav}>
            ◀
          </button>
          <span className={styles.periodoTexto}>
            {obtenerNombrePeriodo(fechaActual, tipo)}
          </span>
          <button onClick={() => cambiarFecha(1)} className={styles.btnNav}>
            ▶
          </button>
        </div>
      </div>

      <div className={styles.graficoWrapper}>
        <Grafico
          items={datosFiltrados}
          tipoPeriodo={tipo}
          onClick={handleGraficoClick} /* 👈 Pasamos el manejador */
        />
      </div>
    </section>
  );
}
