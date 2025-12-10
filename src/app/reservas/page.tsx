"use client";
import { useState, useEffect, useMemo } from "react";
import styles from "./reservas.module.css";
import { Reserva } from "@/types";
import ReservaCard from "@/components/Reservas/ReservaCard";
import FormDialog from "@/components/FormDialog/FormDialog";

export default function PaginaReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);

  // Estados Form
  const [showModal, setShowModal] = useState(false);
  const [itemEditar, setItemEditar] = useState<Reserva | null>(null);

  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] = useState<"ARS" | "USD" | "USDT" | "EUR">("USD");
  const [tipo, setTipo] = useState<Reserva["tipo"]>("efectivo");
  const [ubicacion, setUbicacion] = useState("");
  const [objetivo, setObjetivo] = useState("Ahorro");
  const [rendimiento, setRendimiento] = useState("");

  // PERSISTENCIA
  useEffect(() => {
    const data = localStorage.getItem("finansinho-reservas");
    if (data) setReservas(JSON.parse(data));
  }, []);

  useEffect(() => {
    if (reservas.length > 0 || localStorage.getItem("finansinho-reservas")) {
      localStorage.setItem("finansinho-reservas", JSON.stringify(reservas));
    }
  }, [reservas]);

  // EFECTO EDICIÓN
  useEffect(() => {
    if (itemEditar) {
      setNombre(itemEditar.nombre);
      setMonto(itemEditar.monto.toString());
      setMoneda(itemEditar.moneda);
      setTipo(itemEditar.tipo);
      setUbicacion(itemEditar.ubicacion);
      setObjetivo(itemEditar.objetivo);
      setRendimiento(itemEditar.rendimientoAnual?.toString() || "");
      setShowModal(true);
    }
  }, [itemEditar]);

  // CÁLCULOS TOTALES
  const totales = useMemo(() => {
    return reservas.reduce((acc, item) => {
      if (!acc[item.moneda]) acc[item.moneda] = 0;
      acc[item.moneda] += item.monto;
      return acc;
    }, {} as Record<string, number>);
  }, [reservas]);

  // HANDLERS
  const resetForm = () => {
    setNombre("");
    setMonto("");
    setUbicacion("");
    setRendimiento("");
    setTipo("efectivo");
    setMoneda("USD");
    setObjetivo("Ahorro");
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
    if (!nombre || !monto) return;

    const datosComunes = {
      nombre,
      moneda,
      tipo,
      ubicacion,
      objetivo,
      monto: parseFloat(monto),
      rendimientoAnual: parseFloat(rendimiento) || 0,
    };

    if (itemEditar) {
      const nuevaLista = reservas.map((i) =>
        i.id === itemEditar.id ? { ...itemEditar, ...datosComunes } : i
      );
      setReservas(nuevaLista);
    } else {
      const nuevo: Reserva = { id: Date.now(), ...datosComunes };
      setReservas([...reservas, nuevo]);
    }
    cerrarModal();
  };

  const eliminar = (id: number) => {
    if (!confirm("¿Borrar reserva?")) return;
    const nuevaLista = reservas.filter((i) => i.id !== id);
    setReservas(nuevaLista);
    if (nuevaLista.length === 0) localStorage.removeItem("finansinho-reservas");
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mis Reservas 🏦</h1>
        <button className={styles.btnAdd} onClick={abrirCrear}>
          + Nueva Reserva
        </button>
      </div>

      {/* DASHBOARD TOTALES */}
      <div className={styles.totalesGrid}>
        {Object.entries(totales).map(([moneda, total]) => (
          <div key={moneda} className={styles.totalCard}>
            <span>Total {moneda}</span>
            <strong>
              {moneda === "ARS" ? "$" : moneda} {total.toLocaleString()}
            </strong>
          </div>
        ))}
        {Object.keys(totales).length === 0 && (
          <div className={styles.totalCard}>
            <span>Total</span>
            <strong>$ 0</strong>
          </div>
        )}
      </div>

      {/* GRILLA DE RESERVAS */}
      <div className={styles.grid}>
        {reservas.map((item) => (
          <ReservaCard
            key={item.id}
            data={item}
            onDelete={eliminar}
            onEdit={setItemEditar}
          />
        ))}
        {reservas.length === 0 && (
          <p className={styles.empty}>No tienes fondos guardados.</p>
        )}
      </div>

      {/* FORMULARIO */}
      <FormDialog
        open={showModal}
        onClose={cerrarModal}
        title={itemEditar ? "Editar Reserva" : "Nueva Reserva"}
      >
        <form className={styles.form} onSubmit={guardar}>
          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>Nombre</label>
              <input
                className={styles.input}
                placeholder="Ej: Fondo Emergencia"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Objetivo</label>
              <select
                className={styles.input}
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
              >
                <option>Ahorro</option>
                <option>Emergencia</option>
                <option>Vacaciones</option>
                <option>Auto</option>
                <option>Vivienda</option>
                <option>Retiro</option>
                <option>Otro</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>Tipo</label>
              <select
                className={styles.input}
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
              >
                <option value="efectivo">Efectivo 💵</option>
                <option value="banco">Banco 🏦</option>
                <option value="billetera">Billetera Virtual 📱</option>
                <option value="crypto">Cripto 🪙</option>
              </select>
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Ubicación</label>
              <input
                className={styles.input}
                placeholder="Ej: Caja Fuerte / Binance"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>Moneda</label>
              <select
                className={styles.input}
                value={moneda}
                onChange={(e) => setMoneda(e.target.value as any)}
              >
                <option>USD</option>
                <option>ARS</option>
                <option>USDT</option>
                <option>EUR</option>
              </select>
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Monto</label>
              <input
                type="number"
                className={styles.input}
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.group}>
            <label className={styles.label}>
              Rendimiento Anual Estimado (%)
            </label>
            <input
              type="number"
              className={styles.input}
              placeholder="Ej: 85 (Para billeteras virtuales)"
              value={rendimiento}
              onChange={(e) => setRendimiento(e.target.value)}
            />
            <p className={styles.hint}>
              Si genera intereses (ej: MP, Binance Earn), pon el % anual aquí.
            </p>
          </div>

          <button type="submit" className={styles.btnSave}>
            Guardar Reserva
          </button>
        </form>
      </FormDialog>
    </main>
  );
}
