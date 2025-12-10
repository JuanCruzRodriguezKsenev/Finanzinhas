"use client";
import { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import styles from "./estadisticas.module.css";
import { Transaccion, Inmueble, Inversion, Reserva, Vehiculo } from "@/types";

const COLORES = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF4560",
];

export default function PaginaEstadisticas() {
  // --- ESTADOS DE DATOS ---
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [inversiones, setInversiones] = useState<Inversion[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [montado, setMontado] = useState(false);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    setMontado(true);
    const load = (key: string) => JSON.parse(localStorage.getItem(key) || "[]");

    setTransacciones(load("finansinho-datos"));
    setInmuebles(load("finansinho-inmuebles"));
    setVehiculos(load("finansinho-vehiculos"));
    setInversiones(load("finansinho-inversiones"));
    setReservas(load("finansinho-reservas"));
  }, []);

  // --- KPI 1: PATRIMONIO TOTAL (Estimado en USD) ---
  const patrimonio = useMemo(() => {
    // 1. Inmuebles (USD)
    const totalInmuebles = inmuebles
      .filter((i) => i.moneda === "USD")
      .reduce((acc, i) => acc + i.valorCompra, 0);
    // 2. Vehículos (USD)
    const totalVehiculos = vehiculos
      .filter((v) => v.moneda === "USD")
      .reduce((acc, v) => acc + v.valorEstimado, 0);
    // 3. Inversiones (USD - Calculado precio actual * cantidad)
    const totalInversiones = inversiones
      .filter((i) => i.moneda === "USD")
      .reduce((acc, i) => acc + i.cantidad * i.precioActual, 0);
    // 4. Reservas (USD + USDT)
    const totalReservas = reservas
      .filter((r) => ["USD", "USDT"].includes(r.moneda))
      .reduce((acc, r) => acc + r.monto, 0);

    return {
      total: totalInmuebles + totalVehiculos + totalInversiones + totalReservas,
      desglose: [
        { name: "Inmuebles", value: totalInmuebles },
        { name: "Vehículos", value: totalVehiculos },
        { name: "Inversiones", value: totalInversiones },
        { name: "Reservas (Cash)", value: totalReservas },
      ].filter((i) => i.value > 0),
    };
  }, [inmuebles, vehiculos, inversiones, reservas]);

  // --- KPI 2: FLUJO DE CAJA (Últimos 6 meses) ---
  const flujoCaja = useMemo(() => {
    const hoy = new Date();
    const datos = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mesKey = d.getMonth();
      const anioKey = d.getFullYear();
      const nombreMes = d.toLocaleString("es-ES", { month: "short" });

      const delMes = transacciones.filter((t) => {
        const fechaT = new Date(t.fecha + "T00:00:00");
        return fechaT.getMonth() === mesKey && fechaT.getFullYear() === anioKey;
      });

      const ingresos = delMes
        .filter((t) => t.tipo === "ingreso")
        .reduce((acc, t) => acc + t.monto, 0);
      const gastos = delMes
        .filter((t) => t.tipo === "gasto")
        .reduce((acc, t) => acc + t.monto, 0);

      datos.push({ name: nombreMes, Ingresos: ingresos, Gastos: gastos });
    }
    return datos;
  }, [transacciones]);

  // --- KPI 3: GASTOS POR CATEGORÍA (Histórico) ---
  const gastosPorCategoria = useMemo(() => {
    const gastos = transacciones.filter((t) => t.tipo === "gasto");
    const agrupado = gastos.reduce((acc, t) => {
      if (!acc[t.categoria]) acc[t.categoria] = 0;
      acc[t.categoria] += t.monto;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(agrupado)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6
  }, [transacciones]);

  if (!montado) return null;

  const formatUSD = (val: number) =>
    `USD ${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const formatARS = (val: number) => `$${val.toLocaleString()}`;

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Estadísticas Globales 📊</h1>
        <p className={styles.subtitle}>Visión 360° de tu economía.</p>
      </div>

      {/* 1. TARJETAS KPI */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <h3>Patrimonio Neto (Est. USD)</h3>
          <div className={styles.kpiValue}>{formatUSD(patrimonio.total)}</div>
          <span className={styles.kpiSub}>Suma de Activos</span>
        </div>
        <div className={styles.kpiCard}>
          <h3>Liquidez Total (ARS)</h3>
          <div className={styles.kpiValue}>
            {formatARS(
              reservas
                .filter((r) => r.moneda === "ARS")
                .reduce((acc, r) => acc + r.monto, 0)
            )}
          </div>
          <span className={styles.kpiSub}>Disponible en Pesos</span>
        </div>
        <div className={styles.kpiCard}>
          <h3>Inversiones (Activas)</h3>
          <div className={styles.kpiValue}>{inversiones.length}</div>
          <span className={styles.kpiSub}>Posiciones abiertas</span>
        </div>
      </div>

      {/* 2. GRÁFICOS FILA SUPERIOR */}
      <div className={styles.chartGrid}>
        {/* COMPOSICIÓN DE RIQUEZA */}
        <div className={styles.chartBox}>
          <h3 className={styles.boxTitle}>Composición de Riqueza (USD)</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={patrimonio.desglose}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {patrimonio.desglose.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORES[index % COLORES.length]}
                      stroke="var(--bg-card)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => formatUSD(val)}
                  contentStyle={{
                    background: "var(--bg-card)",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}
                  itemStyle={{ color: "var(--text-main)" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FLUJO DE CAJA SEMESTRAL */}
        <div className={styles.chartBox}>
          <h3 className={styles.boxTitle}>Flujo de Caja (Últimos 6 Meses)</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart
                data={flujoCaja}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `$${val / 1000}k`}
                  tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: number) => formatARS(val)}
                  cursor={{ fill: "var(--input-bg)" }}
                  contentStyle={{
                    background: "var(--bg-card)",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}
                  itemStyle={{ color: "var(--text-main)" }}
                />
                <Legend />
                <Bar
                  dataKey="Ingresos"
                  fill="var(--success)"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="Gastos"
                  fill="var(--danger)"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. GRÁFICO FILA INFERIOR */}
      <div className={`${styles.chartBox} ${styles.fullWidth}`}>
        <h3 className={styles.boxTitle}>Top Categorías de Gasto (Histórico)</h3>
        <div className={styles.catGrid}>
          {/* Gráfico Dona */}
          <div style={{ width: "100%", height: 250, minWidth: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={gastosPorCategoria}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {gastosPorCategoria.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORES[index % COLORES.length]}
                      stroke="var(--bg-card)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => formatARS(val)}
                  contentStyle={{
                    background: "var(--bg-card)",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}
                  itemStyle={{ color: "var(--text-main)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Lista Detalle */}
          <div className={styles.catList}>
            {gastosPorCategoria.map((cat, i) => (
              <div key={cat.name} className={styles.catItem}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: COLORES[i % COLORES.length],
                    }}
                  ></span>
                  <span>{cat.name}</span>
                </div>
                <strong>{formatARS(cat.value)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
