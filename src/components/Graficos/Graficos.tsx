"use client";
import { useState, useMemo } from "react";
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
  tipoPeriodo?: "anual" | "mensual" | "semanal" | "diario";
  onClick?: (data: any) => void; // 👈 NUEVA PROP: Para escuchar clicks
}

// ... (Mantén los componentes CustomBarTooltip, CustomPieTooltip y renderLegend IGUALES que antes) ...
// (Los omito aquí para ahorrar espacio, pero NO los borres de tu archivo)
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.tooltipCustom}>
        <p className={styles.tooltipTitle}>{label}</p>
        <div className={styles.tooltipRow}>
          <span className={styles.textSuccess}>● Ingresos:</span>
          <span>${data.ingreso}</span>
        </div>
        <div className={styles.tooltipRow}>
          <span className={styles.textDanger}>● Gastos:</span>
          <span>${data.gasto}</span>
        </div>
        <hr className={styles.tooltipDivider} />
        <div className={styles.tooltipRow}>
          <strong>Balance:</strong>
          <strong
            className={
              data.balance >= 0 ? styles.textSuccess : styles.textDanger
            }
          >
            {data.balance >= 0 ? "+" : ""}${data.balance}
          </strong>
        </div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload, total }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    const porcentaje = ((value / total) * 100).toFixed(1);
    return (
      <div className={styles.tooltipCustom}>
        <p className={styles.tooltipTitle}>{name}</p>
        <div className={styles.tooltipRow}>
          <span>Monto:</span>
          <strong>${value}</strong>
        </div>
        <div className={styles.tooltipRow}>
          <span>Impacto:</span>
          <strong>{porcentaje}%</strong>
        </div>
      </div>
    );
  }
  return null;
};

const renderLegend = (props: any) => {
  const { payload } = props;
  return (
    <ul className={styles.legendList}>
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className={styles.legendItem}>
          <span
            className={styles.legendIcon}
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

export default function Grafico({
  items,
  tipoPeriodo = "anual",
  onClick,
}: Props) {
  const [vista, setVista] = useState<"torta" | "barras">("torta"); // Default a barras para ver la interacción fácil? No, dejamos torta.

  const soloGastos = items.filter((t) => t.tipo === "gasto");
  const soloIngresos = items.filter((t) => t.tipo === "ingreso");

  // Cálculos Torta
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

  // Cálculos Barras Dinámicos
  const datosComparativos = useMemo(() => {
    let estructura: {
      [key: string]: { name: string; ingreso: number; gasto: number };
    } = {};

    if (tipoPeriodo === "anual") {
      const meses = [
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
      ];
      meses.forEach((mes, i) => {
        const key = i.toString();
        estructura[key] = { name: mes, ingreso: 0, gasto: 0 };
      });
      items.forEach((t) => {
        const mesIndex = new Date(t.fecha).getUTCMonth().toString();
        if (estructura[mesIndex]) {
          if (t.tipo === "ingreso") estructura[mesIndex].ingreso += t.monto;
          else estructura[mesIndex].gasto += t.monto;
        }
      });
    } else if (tipoPeriodo === "mensual") {
      const diasDelMes = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      ).getDate(); // Días reales del mes (aprox para el filtro visual)
      for (let i = 1; i <= 31; i++) {
        estructura[i] = { name: i.toString(), ingreso: 0, gasto: 0 };
      }
      items.forEach((t) => {
        const dia = new Date(t.fecha).getUTCDate();
        if (estructura[dia]) {
          if (t.tipo === "ingreso") estructura[dia].ingreso += t.monto;
          else estructura[dia].gasto += t.monto;
        }
      });
    } else if (tipoPeriodo === "semanal") {
      const diasSemana = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
      diasSemana.forEach((dia, i) => {
        estructura[i] = { name: dia, ingreso: 0, gasto: 0 };
      });
      items.forEach((t) => {
        let diaIndex = new Date(t.fecha).getUTCDay();
        diaIndex = diaIndex === 0 ? 6 : diaIndex - 1;
        if (estructura[diaIndex]) {
          if (t.tipo === "ingreso") estructura[diaIndex].ingreso += t.monto;
          else estructura[diaIndex].gasto += t.monto;
        }
      });
    } else if (tipoPeriodo === "diario") {
      // Lógica diaria simplificada
      const hora = "Día";
      estructura[0] = { name: hora, ingreso: 0, gasto: 0 };
      items.forEach((t) => {
        if (t.tipo === "ingreso") estructura[0].ingreso += t.monto;
        else estructura[0].gasto += t.monto;
      });
    }

    return Object.values(estructura).map((d) => ({
      ...d,
      balance: d.ingreso - d.gasto,
    }));
  }, [items, tipoPeriodo]);

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
                          content={
                            <CustomPieTooltip total={totalGastosTorta} />
                          }
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
                <p className={styles.vacioTexto}>No hay gastos para mostrar.</p>
              )}
            </>
          )}

          {vista === "barras" && (
            <div className={styles.zonaChart}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={datosComparativos}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  onClick={onClick} /* 👈 AQUI CONECTAMOS EL CLICK */
                  style={{ cursor: onClick ? "pointer" : "default" }}
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
                    padding={{
                      left: tipoPeriodo === "mensual" ? 10 : 40,
                      right: tipoPeriodo === "mensual" ? 10 : 40,
                    }}
                    interval={tipoPeriodo === "mensual" ? 2 : 0}
                  />
                  <YAxis
                    tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<CustomBarTooltip />}
                    cursor={{ fill: "var(--input-bg)" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    content={renderLegend}
                    wrapperStyle={{
                      paddingTop: "10px",
                      width: "100%",
                      left: 0,
                    }}
                  />
                  <Bar
                    dataKey="ingreso"
                    name="Ingresos"
                    fill="var(--success)"
                    radius={[4, 4, 0, 0]}
                    barSize={tipoPeriodo === "mensual" ? 10 : 20}
                  />
                  <Bar
                    dataKey="gasto"
                    name="Gastos"
                    fill="var(--danger)"
                    radius={[4, 4, 0, 0]}
                    barSize={tipoPeriodo === "mensual" ? 10 : 20}
                  />
                </BarChart>
              </ResponsiveContainer>
              <p className={styles.avisoChart}>
                {tipoPeriodo === "anual"
                  ? "Evolución Mensual (Click para ver detalle)"
                  : tipoPeriodo === "mensual"
                  ? "Evolución Diaria"
                  : "Detalle"}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className={styles.vacioTexto}>Sin movimientos.</p>
      )}
    </div>
  );
}
