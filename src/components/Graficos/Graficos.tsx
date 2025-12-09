"use client";
import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import styles from "./Graficos.module.css";
import { Transaccion } from "@/types";

const COLORES = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF4560",
];

interface Props {
  items: Transaccion[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.tooltipCustom}>
        <p className={styles.tooltipTitle}>{label}</p>
        <div className={styles.tooltipRow}>
          <span style={{ color: "var(--success)" }}>● Ingresos:</span>
          <span>${data.ingreso}</span>
        </div>
        <div className={styles.tooltipRow}>
          <span style={{ color: "var(--danger)" }}>● Gastos:</span>
          <span>${data.gasto}</span>
        </div>
        <hr className={styles.tooltipDivider} />
        <div className={styles.tooltipRow}>
          <strong>Balance:</strong>
          <strong
            style={{
              color: data.balance >= 0 ? "var(--success)" : "var(--danger)",
            }}
          >
            {data.balance >= 0 ? "+" : ""}${data.balance}
          </strong>
        </div>
      </div>
    );
  }
  return null;
};

export default function Grafico({ items }: Props) {
  const [vista, setVista] = useState<"torta" | "barras">("torta");

  const soloGastos = items.filter((t) => t.tipo === "gasto");
  const soloIngresos = items.filter((t) => t.tipo === "ingreso");

  const datosCategoria = soloGastos.reduce((acc, g) => {
    const ex = acc.find((i) => i.name === g.categoria);
    if (ex) ex.value += g.monto;
    else acc.push({ name: g.categoria, value: g.monto });
    return acc;
  }, [] as { name: string; value: number }[]);

  const totalGastosTorta = datosCategoria.reduce(
    (acc, item) => acc + item.value,
    0
  );

  const todosLosMeses = Array.from(
    new Set(items.map((t) => t.fecha.substring(0, 7)))
  ).sort();

  const datosComparativos = todosLosMeses.map((keyMes) => {
    const [year, month] = keyMes.split("-");
    const nombreMes = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ][parseInt(month) - 1];

    const ingresoTotal = soloIngresos
      .filter((t) => t.fecha.startsWith(keyMes))
      .reduce((acc, t) => acc + t.monto, 0);

    const gastoTotal = soloGastos
      .filter((t) => t.fecha.startsWith(keyMes))
      .reduce((acc, t) => acc + t.monto, 0);

    return {
      name: nombreMes,
      ingreso: ingresoTotal,
      gasto: gastoTotal,
      balance: ingresoTotal - gastoTotal,
    };
  });

  return (
    <div className={styles.tarjetaGrafico}>
      <div className={styles.headerGrafico}>
        <h3>Estadísticas</h3>
        <div className={styles.tabs}>
          <button
            onClick={() => setVista("torta")}
            className={`${styles.tab} ${
              vista === "torta" ? styles.tabActivo : ""
            }`}
          >
            Donas 🍩
          </button>
          <button
            onClick={() => setVista("barras")}
            className={`${styles.tab} ${
              vista === "barras" ? styles.tabActivo : ""
            }`}
          >
            Balance 📊
          </button>
        </div>
      </div>

      {items.length > 0 ? (
        <div className={styles.contenidoGrafico}>
          {vista === "torta" && (
            <>
              {soloGastos.length > 0 ? (
                <>
                  <div className={styles.zonaChart}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={datosCategoria}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {datosCategoria.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORES[index % COLORES.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [
                            `$${value} (${(
                              (value / totalGastosTorta) *
                              100
                            ).toFixed(1)}%)`,
                          ]}
                          contentStyle={{
                            backgroundColor: "var(--bg-card)",
                            borderColor: "var(--border)",
                            color: "var(--text-main)",
                            borderRadius: "8px",
                          }}
                          itemStyle={{ color: "var(--text-main)" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={styles.leyenda}>
                    {datosCategoria.map((d, i) => (
                      <div key={d.name} className={styles.itemLeyenda}>
                        <span
                          style={{
                            backgroundColor: COLORES[i % COLORES.length],
                          }}
                          className={styles.puntoColor}
                        ></span>
                        <span className={styles.textoLeyenda} title={d.name}>
                          {d.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className={styles.vacioTexto}>
                  No hay gastos para mostrar en la dona.
                </p>
              )}
            </>
          )}

          {vista === "barras" && (
            <div className={styles.zonaChart}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={datosComparativos}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                    tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "var(--input-bg)" }}
                  />

                  {/* 👇 AQUÍ ESTÁ EL CAMBIO: Usamos las props nativas */}
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: "10px" }}
                  />

                  <Bar
                    dataKey="ingreso"
                    name="Ingresos"
                    fill="var(--success)"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Bar
                    dataKey="gasto"
                    name="Gastos"
                    fill="var(--danger)"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
              <p className={styles.avisoChart}>Comparativa mensual</p>
            </div>
          )}
        </div>
      ) : (
        <p className={styles.vacioTexto}>
          Registra movimientos para ver estadísticas.
        </p>
      )}
    </div>
  );
}
