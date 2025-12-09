"use client";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import styles from "./PresupuestoHome.module.css";
import { PresupuestoMensual, Transaccion } from "@/types";
import Link from "next/link";

interface Props {
  presupuestoActual: PresupuestoMensual;
  transaccionesMes: Transaccion[];
  historicoTransacciones: Transaccion[]; // Para el gráfico de tendencia
}

export default function PresupuestoHome({
  presupuestoActual,
  transaccionesMes,
  historicoTransacciones,
}: Props) {
  // 1. Datos para las Barras (Mes Actual)
  const estadoCategorias = useMemo(() => {
    return presupuestoActual.categorias.map((cat) => {
      const gastado = transaccionesMes
        .filter((t) => t.tipo === "gasto" && t.categoria === cat.categoria)
        .reduce((acc, t) => acc + t.monto, 0);

      const porcentaje = Math.min((gastado / cat.montoMaximo) * 100, 100);
      let color = styles.verde;
      if (gastado > cat.montoMaximo) color = styles.rojo;
      else if (gastado > cat.montoMaximo * 0.8) color = styles.amarillo;

      return { ...cat, gastado, porcentaje, color };
    });
  }, [presupuestoActual, transaccionesMes]);

  // 2. Datos para el Gráfico de Tendencia (Últimos 6 meses)
  const datosTendencia = useMemo(() => {
    const hoy = new Date();
    const datos = [];
    // Generamos los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const keyMes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      const nombreMes = d.toLocaleString("es-ES", { month: "short" });

      const gastoTotalMes = historicoTransacciones
        .filter((t) => t.tipo === "gasto" && t.fecha.startsWith(keyMes))
        .reduce((acc, t) => acc + t.monto, 0);

      // Nota: Aquí idealmente sumaríamos el presupuesto histórico de ese mes.
      // Por simplicidad visual, usaremos el presupuesto actual como referencia de "Meta"
      const metaTotal = presupuestoActual.categorias.reduce(
        (acc, c) => acc + c.montoMaximo,
        0
      );

      datos.push({ name: nombreMes, gasto: gastoTotalMes, meta: metaTotal });
    }
    return datos;
  }, [historicoTransacciones, presupuestoActual]);

  // Cálculo total del mes
  const totalPresupuesto = presupuestoActual.categorias.reduce(
    (acc, c) => acc + c.montoMaximo,
    0
  );
  const totalGastado = estadoCategorias.reduce((acc, c) => acc + c.gastado, 0);

  return (
    <div className={styles.container}>
      <div
        className={styles.header}
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <h3>📉 Control Presupuestario</h3>
        <Link
          href="/presupuestos"
          style={{
            fontSize: "0.8rem",
            color: "var(--accent)",
            fontWeight: "bold",
          }}
        >
          Gestionar →
        </Link>
      </div>

      {/* GRÁFICO DE TENDENCIA */}
      <div className={styles.zonaGrafico}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={datosTendencia}>
            <defs>
              <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
              itemStyle={{ fontSize: "0.8rem" }}
            />
            <Area
              type="monotone"
              dataKey="gasto"
              stroke="var(--accent)"
              fillOpacity={1}
              fill="url(#colorGasto)"
              strokeWidth={2}
            />
            {/* Línea de Meta */}
            <Area
              type="monotone"
              dataKey="meta"
              stroke="var(--text-muted)"
              strokeDasharray="5 5"
              fill="none"
              strokeWidth={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <span
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color:
              totalGastado > totalPresupuesto
                ? "var(--danger)"
                : "var(--text-main)",
          }}
        >
          ${totalGastado.toLocaleString()}
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          {" "}
          / ${totalPresupuesto.toLocaleString()}
        </span>
      </div>

      {/* BARRAS DE PROGRESO POR RUBRO */}
      <div className={styles.listaBarras}>
        {estadoCategorias.map((cat) => (
          <div key={cat.categoria} className={styles.itemBarra}>
            <div className={styles.info}>
              <span className={styles.nombreCat}>{cat.categoria}</span>
              <span>
                ${cat.gastado.toLocaleString()} / $
                {cat.montoMaximo.toLocaleString()}
              </span>
            </div>
            <div className={styles.barraFondo}>
              <div
                className={`${styles.barraRelleno} ${cat.color}`}
                style={{ width: `${cat.porcentaje}%` }}
              ></div>
            </div>
          </div>
        ))}
        {estadoCategorias.length === 0 && (
          <p
            style={{
              textAlign: "center",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
            }}
          >
            No hay presupuestos definidos.
          </p>
        )}
      </div>
    </div>
  );
}
