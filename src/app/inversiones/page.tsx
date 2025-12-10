"use client";
import { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import styles from "./inversiones.module.css";
import { Inversion } from "@/types";
import InversionCard from "@/components/Inversiones/InversionCard";
import FormDialog from "@/components/FormDialog/FormDialog";

const COLORES = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

export default function PaginaInversiones() {
  const [inversiones, setInversiones] = useState<Inversion[]>([]);

  // Form States
  const [showModal, setShowModal] = useState(false);
  const [itemEditar, setItemEditar] = useState<Inversion | null>(null);

  const [ticket, setTicket] = useState("");
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<Inversion["tipo"]>("cedear");
  const [cantidad, setCantidad] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioActual, setPrecioActual] = useState("");
  const [moneda, setMoneda] = useState<"USD" | "ARS">("USD");

  // CARGA
  useEffect(() => {
    const data = localStorage.getItem("finansinho-inversiones");
    if (data) setInversiones(JSON.parse(data));
  }, []);

  // GUARDADO
  useEffect(() => {
    if (
      inversiones.length > 0 ||
      localStorage.getItem("finansinho-inversiones")
    ) {
      localStorage.setItem(
        "finansinho-inversiones",
        JSON.stringify(inversiones)
      );
    }
  }, [inversiones]);

  // EFECTO EDICIÓN
  useEffect(() => {
    if (itemEditar) {
      setTicket(itemEditar.ticket);
      setNombre(itemEditar.nombre);
      setTipo(itemEditar.tipo);
      setCantidad(itemEditar.cantidad.toString());
      setPrecioCompra(itemEditar.precioCompra.toString());
      setPrecioActual(itemEditar.precioActual.toString());
      setMoneda(itemEditar.moneda);
      setShowModal(true);
    }
  }, [itemEditar]);

  // --- CÁLCULOS DASHBOARD ---
  const metricas = useMemo(() => {
    // Nota: Simplificación sumando todo (idealmente convertir todo a una moneda base)
    // Aquí filtramos solo USD para el ejemplo visual, o sumamos directo.
    // Vamos a sumar solo lo que esté en USD para el dashboard principal.
    const itemsUSD = inversiones.filter((i) => i.moneda === "USD");

    const totalInvertido = itemsUSD.reduce(
      (acc, i) => acc + i.cantidad * i.precioCompra,
      0
    );
    const totalActual = itemsUSD.reduce(
      (acc, i) => acc + i.cantidad * i.precioActual,
      0
    );
    const diferencia = totalActual - totalInvertido;
    const porcentaje =
      totalInvertido > 0 ? (diferencia / totalInvertido) * 100 : 0;

    return { totalInvertido, totalActual, diferencia, porcentaje };
  }, [inversiones]);

  const datosGrafico = useMemo(() => {
    const data: any[] = [];
    inversiones.forEach((inv) => {
      // Agrupar por tipo (Accion, Crypto, etc)
      const valor = inv.cantidad * inv.precioActual; // Valor nominal simple
      const existente = data.find((d) => d.name === inv.tipo.toUpperCase());
      if (existente) existente.value += valor;
      else data.push({ name: inv.tipo.toUpperCase(), value: valor });
    });
    return data;
  }, [inversiones]);

  // --- HANDLERS ---
  const resetForm = () => {
    setTicket("");
    setNombre("");
    setCantidad("");
    setPrecioCompra("");
    setPrecioActual("");
    setItemEditar(null);
  };

  const abrirCrear = () => {
    resetForm();
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setTimeout(() => resetForm(), 300);
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !cantidad) return;

    const datosComunes = {
      ticket: ticket.toUpperCase(),
      nombre,
      tipo,
      moneda,
      cantidad: parseFloat(cantidad),
      precioCompra: parseFloat(precioCompra),
      precioActual: parseFloat(precioActual) || parseFloat(precioCompra), // Si no pone actual, asume compra
    };

    if (itemEditar) {
      const nuevaLista = inversiones.map((i) =>
        i.id === itemEditar.id ? { ...itemEditar, ...datosComunes } : i
      );
      setInversiones(nuevaLista);
    } else {
      const nuevo: Inversion = { id: Date.now(), ...datosComunes };
      setInversiones([...inversiones, nuevo]);
    }
    cerrarModal();
  };

  const eliminar = (id: number) => {
    if (!confirm("¿Borrar activo?")) return;
    const nuevaLista = inversiones.filter((i) => i.id !== id);
    setInversiones(nuevaLista);
    if (nuevaLista.length === 0)
      localStorage.removeItem("finansinho-inversiones");
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Portafolio 📈</h1>
        <button className={styles.btnAdd} onClick={abrirCrear}>
          + Agregar Activo
        </button>
      </div>

      {/* DASHBOARD SUPERIOR */}
      <div className={styles.dashboard}>
        <div className={styles.metricCard}>
          <span>Valor Actual (USD)</span>
          <strong>${metricas.totalActual.toLocaleString()}</strong>
        </div>
        <div className={styles.metricCard}>
          <span>Invertido (USD)</span>
          <strong>${metricas.totalInvertido.toLocaleString()}</strong>
        </div>
        <div
          className={`${styles.metricCard} ${
            metricas.diferencia >= 0 ? styles.gain : styles.loss
          }`}
        >
          <span>P/L Total</span>
          <div className={styles.plWrapper}>
            <strong>${Math.abs(metricas.diferencia).toLocaleString()}</strong>
            <small>{metricas.porcentaje.toFixed(2)}%</small>
          </div>
        </div>
      </div>

      {/* GRÁFICO DISTRIBUCIÓN */}
      {datosGrafico.length > 0 && (
        <div className={styles.chartSection}>
          <h3 className={styles.chartTitle}>Distribución de Activos</h3>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={datosGrafico}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {datosGrafico.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORES[index % COLORES.length]}
                      stroke="var(--bg-card)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}
                  itemStyle={{ color: "var(--text-main)" }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* GRILLA DE ACTIVOS */}
      <div className={styles.grid}>
        {inversiones.map((item) => (
          <InversionCard
            key={item.id}
            data={item}
            onDelete={eliminar}
            onEdit={setItemEditar}
          />
        ))}
        {inversiones.length === 0 && (
          <p className={styles.empty}>Tu portafolio está vacío.</p>
        )}
      </div>

      {/* FORMULARIO */}
      <FormDialog
        open={showModal}
        onClose={cerrarModal}
        title={itemEditar ? "Editar Posición" : "Nuevo Activo"}
      >
        <form className={styles.form} onSubmit={guardar}>
          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>Ticker</label>
              <input
                className={styles.input}
                placeholder="AAPL"
                value={ticket}
                onChange={(e) => setTicket(e.target.value)}
                required
              />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Tipo</label>
              <select
                className={styles.input}
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
              >
                <option value="cedear">CEDEAR</option>
                <option value="accion">Acción</option>
                <option value="crypto">Cripto</option>
                <option value="bono">Bono</option>
                <option value="fci">FCI</option>
                <option value="pf">Plazo Fijo</option>
              </select>
            </div>
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Nombre</label>
            <input
              className={styles.input}
              placeholder="Apple Inc."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>Cantidad</label>
              <input
                type="number"
                className={styles.input}
                placeholder="0.00"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                required
              />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Moneda</label>
              <select
                className={styles.input}
                value={moneda}
                onChange={(e) => setMoneda(e.target.value as any)}
              >
                <option>USD</option>
                <option>ARS</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>Precio Compra (Promedio)</label>
              <input
                type="number"
                className={styles.input}
                placeholder="$ 0.00"
                value={precioCompra}
                onChange={(e) => setPrecioCompra(e.target.value)}
                required
              />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Precio Actual (Mercado)</label>
              <input
                type="number"
                className={styles.input}
                placeholder="$ 0.00"
                value={precioActual}
                onChange={(e) => setPrecioActual(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className={styles.btnSave}>
            Guardar Posición
          </button>
        </form>
      </FormDialog>
    </main>
  );
}
