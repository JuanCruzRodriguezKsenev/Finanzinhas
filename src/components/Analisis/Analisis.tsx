"use client";
import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import styles from "./Analisis.module.css";
import { PresupuestoMensual, Transaccion } from "@/types";
import Link from "next/link";

const COLORES = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF4560",
];
const COLOR_DISPONIBLE = "rgba(128, 128, 128, 0.2)"; // Color sutil para lo que sobra

interface Props {
  presupuestoActual: PresupuestoMensual | null;
  transaccionesMes: Transaccion[];
  historicoTransacciones: Transaccion[];
}

export default function Analisis({
  presupuestoActual,
  transaccionesMes,
  historicoTransacciones,
}: Props) {
  const [vista, setVista] = useState<"metas" | "distribucion" | "diario">(
    "metas"
  );

  // --- CÁLCULOS VISTA 1: METAS ---
  const estadoCategorias = useMemo(() => {
    if (!presupuestoActual) return [];
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

  const datosTendencia = useMemo(() => {
    const hoy = new Date();
    const datos = [];
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

      const metaTotal = presupuestoActual
        ? presupuestoActual.presupuestoGeneral || 0
        : 0;

      datos.push({ name: nombreMes, gasto: gastoTotalMes, meta: metaTotal });
    }
    return datos;
  }, [historicoTransacciones, presupuestoActual]);

  const totalPresupuesto = presupuestoActual
    ? presupuestoActual.presupuestoGeneral || 0
    : 0;

  const totalGastadoMes = transaccionesMes
    .filter((t) => t.tipo === "gasto")
    .reduce((acc, t) => acc + t.monto, 0);

  // --- CÁLCULOS VISTA 2: DISTRIBUCIÓN (Con Disponible) ---
  const datosDona = useMemo(() => {
    const soloGastos = transaccionesMes.filter((t) => t.tipo === "gasto");

    // 1. Agrupar gastos por categoría
    const data = soloGastos.reduce((acc, g) => {
      const ex = acc.find((i) => i.name === g.categoria);
      if (ex) ex.value += g.monto;
      else acc.push({ name: g.categoria, value: g.monto, color: "" }); // Color vacío placeholder
      return acc;
    }, [] as { name: string; value: number; color: string }[]);

    // Asignar colores a las categorías
    data.forEach((d, i) => {
      d.color = COLORES[i % COLORES.length];
    });

    // 2. Calcular Disponible (Solo si hay presupuesto general)
    if (totalPresupuesto > 0) {
      const restante = Math.max(0, totalPresupuesto - totalGastadoMes);

      if (restante > 0) {
        data.push({
          name: "Disponible 🟢",
          value: restante,
          color: COLOR_DISPONIBLE, // Color especial grisáceo
        });
      }
    }

    // Ordenar para que se vea bonito (Disponible suele quedar bien al final o inicio, aquí por valor)
    return data.sort((a, b) => b.value - a.value);
  }, [transaccionesMes, totalPresupuesto, totalGastadoMes]);

  // --- CÁLCULOS VISTA 3: DIARIO ---
  const datosBarras = useMemo(() => {
    let estructura: {
      [key: string]: { name: string; ingreso: number; gasto: number };
    } = {};
    const diasEnMes = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).getDate();
    for (let i = 1; i <= diasEnMes; i++) {
      estructura[i] = { name: i.toString(), ingreso: 0, gasto: 0 };
    }

    transaccionesMes.forEach((t) => {
      const dia = new Date(t.fecha).getUTCDate();
      if (estructura[dia]) {
        if (t.tipo === "ingreso") estructura[dia].ingreso += t.monto;
        else estructura[dia].gasto += t.monto;
      }
    });
    return Object.values(estructura);
  }, [transaccionesMes]);

  // --- FORMATTERS ---
  const formatMoney = (val: number) => `$${val.toLocaleString()}`;
  const formatYAxis = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{label || payload[0].name}</p>
          {payload.map((p: any, i: number) => (
            <p
              key={i}
              style={{
                color: p.payload.color || p.color,
                margin: 0,
                fontSize: "0.85rem",
              }}
            >
              {/* Si es piechart el label viene en p.name, si es barchart en p.dataKey o nombre custom */}
              {p.name}: <b>{formatMoney(p.value)}</b>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3>📊 Análisis Financiero</h3>
          {vista === "metas" && (
            <Link href="/presupuestos" className={styles.linkGestion}>
              Gestionar Presupuesto →
            </Link>
          )}
        </div>

        <div className={styles.tabs}>
          <button
            onClick={() => setVista("metas")}
            className={`${styles.tab} ${
              vista === "metas" ? styles.activeTab : ""
            }`}
          >
            Metas 📉
          </button>
          <button
            onClick={() => setVista("distribucion")}
            className={`${styles.tab} ${
              vista === "distribucion" ? styles.activeTab : ""
            }`}
          >
            Donas 🍩
          </button>
          <button
            onClick={() => setVista("diario")}
            className={`${styles.tab} ${
              vista === "diario" ? styles.activeTab : ""
            }`}
          >
            Diario 🗓️
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* VISTA 1: METAS */}
        {vista === "metas" && (
          <>
            {!presupuestoActual ? (
              <div className={styles.emptyState}>
                No has configurado un presupuesto este mes.
              </div>
            ) : (
              <div className={styles.layoutMetas}>
                <div className={styles.chartSection}>
                  <h4 className={styles.subTitle}>Tendencia Semestral</h4>
                  <div className={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={datosTendencia}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorGasto"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="var(--accent)"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="var(--accent)"
                              stopOpacity={0}
                            />
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
                        <YAxis
                          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={formatYAxis}
                          width={35}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="gasto"
                          name="Gastado"
                          stroke="var(--accent)"
                          fillOpacity={1}
                          fill="url(#colorGasto)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="meta"
                          name="Meta"
                          stroke="var(--text-muted)"
                          strokeDasharray="5 5"
                          fill="none"
                          strokeWidth={1}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={styles.totalBadge}>
                    <span
                      className={
                        totalGastadoMes > totalPresupuesto
                          ? styles.textDanger
                          : ""
                      }
                    >
                      {formatMoney(totalGastadoMes)}
                    </span>
                    <span className={styles.textMuted}>
                      {" "}
                      / {formatMoney(totalPresupuesto)}
                    </span>
                  </div>
                </div>

                <div className={styles.barsSection}>
                  <h4 className={styles.subTitle}>Progreso por Rubro</h4>
                  <div className={styles.scrollableBars}>
                    {estadoCategorias.map((cat) => (
                      <div key={cat.categoria} className={styles.barItem}>
                        <div className={styles.barInfo}>
                          <span className={styles.catName}>
                            {cat.categoria}
                          </span>
                          <span className={styles.catMonto}>
                            {formatMoney(cat.gastado)} /{" "}
                            {formatMoney(cat.montoMaximo)}
                          </span>
                        </div>
                        <div className={styles.barBg}>
                          <div
                            className={`${styles.barFill} ${cat.color}`}
                            style={{ width: `${cat.porcentaje}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* VISTA 2: DISTRIBUCIÓN (DONA) */}
        {vista === "distribucion" && (
          <div className={styles.layoutDona}>
            {datosDona.length > 0 ? (
              <>
                <div className={styles.chartWrapperDona}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={datosDona}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {/* 👇 AQUI USAMOS EL COLOR QUE DEFINIMOS EN EL USEMEMO */}
                        {datosDona.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="var(--bg-card)"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.leyendaLateral}>
                  {datosDona.map((d, i) => (
                    <div key={d.name} className={styles.itemLeyenda}>
                      <span
                        style={{ backgroundColor: d.color }}
                        className={styles.puntoColor}
                      ></span>
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            color: d.name.includes("Disponible")
                              ? "var(--text-muted)"
                              : "var(--text-main)",
                          }}
                        >
                          {d.name}
                        </span>
                        <b>{formatMoney(d.value)}</b>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                No hay gastos registrados este mes.
              </div>
            )}
          </div>
        )}

        {/* VISTA 3: DIARIO (BARRAS) */}
        {vista === "diario" && (
          <div className={styles.layoutBarras}>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={datosBarras}
                  margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                >
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
                    interval={2}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatYAxis}
                    width={35}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "var(--input-bg)" }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ paddingTop: "10px" }}
                  />
                  <Bar
                    dataKey="ingreso"
                    name="Ingresos"
                    fill="var(--success)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="gasto"
                    name="Gastos"
                    fill="var(--danger)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
