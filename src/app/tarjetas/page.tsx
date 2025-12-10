"use client";
import { useState, useEffect } from "react";
import styles from "./tarjetas.module.css";
import { Tarjeta, Transaccion } from "@/types";
import CreditCard from "@/components/Tarjetas/CreditCard/CreditCard";
import FormDialog from "@/components/FormDialog/FormDialog";
import Lista from "@/components/Lista/Lista";

const COLORES_TARJETAS = [
  "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", // Azul Clásico
  "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", // Verde Moderno
  "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)", // Instagram Style
  "linear-gradient(135deg, #000000 0%, #434343 100%)", // Black Card
  "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)", // Rojo Intenso
];

export default function PaginaTarjetas() {
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] =
    useState<Tarjeta | null>(null);

  // Modal Agregar
  const [showModal, setShowModal] = useState(false);
  const [nuevoAlias, setNuevoAlias] = useState("");
  const [nuevoBanco, setNuevoBanco] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState<"credito" | "debito">("credito");
  const [nuevoLimite, setNuevoLimite] = useState("");
  const [nuevoCierre, setNuevoCierre] = useState("");
  const [nuevoVenc, setNuevoVenc] = useState("");
  const [nuevoLast4, setNuevoLast4] = useState("");
  const [nuevoColor, setNuevoColor] = useState(COLORES_TARJETAS[0]);

  useEffect(() => {
    // Cargar Tarjetas
    const dataCards = localStorage.getItem("finansinho-tarjetas");
    if (dataCards) setTarjetas(JSON.parse(dataCards));

    // Cargar Transacciones (Para calcular consumos)
    const dataTrans = localStorage.getItem("finansinho-datos");
    if (dataTrans) setTransacciones(JSON.parse(dataTrans));
  }, []);

  const guardarTarjeta = () => {
    if (!nuevoAlias || !nuevoBanco) return;

    const nueva: Tarjeta = {
      id: Date.now(),
      alias: nuevoAlias,
      banco: nuevoBanco,
      tipo: nuevoTipo,
      ultimos4: nuevoLast4 || "0000",
      limite: parseFloat(nuevoLimite) || 0,
      diaCierre: parseInt(nuevoCierre) || 1,
      diaVencimiento: parseInt(nuevoVenc) || 10,
      color: nuevoColor,
    };

    const nuevaLista = [...tarjetas, nueva];
    setTarjetas(nuevaLista);
    localStorage.setItem("finansinho-tarjetas", JSON.stringify(nuevaLista));
    setShowModal(false);
    resetForm();
  };

  const eliminarTarjeta = (id: number) => {
    if (!confirm("¿Borrar tarjeta?")) return;
    const nuevaLista = tarjetas.filter((t) => t.id !== id);
    setTarjetas(nuevaLista);
    localStorage.setItem("finansinho-tarjetas", JSON.stringify(nuevaLista));
    if (tarjetaSeleccionada?.id === id) setTarjetaSeleccionada(null);
  };

  const resetForm = () => {
    setNuevoAlias("");
    setNuevoBanco("");
    setNuevoLimite("");
    setNuevoLast4("");
  };

  // Calcular consumo por tarjeta (filtrando las transacciones que tienen tarjetaId)
  const calcularConsumo = (idTarjeta: number) => {
    // NOTA: Para que esto funcione 100% real, deberíamos actualizar
    // el formulario de agregar gasto para que permita seleccionar tarjeta.
    // Por ahora, simulamos o filtramos si agregamos esa lógica.

    // Filtramos por el nombre del método de pago si coincide con el alias (estrategia simple)
    // O idealmente usar el tarjetaId si ya lo implementaste en el form.
    const tarjeta = tarjetas.find((t) => t.id === idTarjeta);
    if (!tarjeta) return 0;

    return transacciones
      .filter((t) => t.metodoPago === tarjeta.alias && t.tipo === "gasto")
      .reduce((acc, t) => acc + t.monto, 0);
  };

  // Transacciones de la tarjeta seleccionada
  const transaccionesFiltradas = tarjetaSeleccionada
    ? transacciones.filter((t) => t.metodoPago === tarjetaSeleccionada.alias)
    : [];

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>Mis Tarjetas 💳</h1>
        <button className={styles.btnAdd} onClick={() => setShowModal(true)}>
          + Nueva Tarjeta
        </button>
      </div>

      {/* GRID DE TARJETAS (WALLET) */}
      <div className={styles.walletGrid}>
        {tarjetas.map((t) => (
          <CreditCard
            key={t.id}
            data={t}
            consumoActual={calcularConsumo(t.id)}
            onDelete={eliminarTarjeta}
            onSelect={setTarjetaSeleccionada}
            isSelected={tarjetaSeleccionada?.id === t.id}
          />
        ))}
        {tarjetas.length === 0 && (
          <p className={styles.empty}>No tienes tarjetas guardadas.</p>
        )}
      </div>

      {/* DETALLE SELECCIONADO */}
      {tarjetaSeleccionada && (
        <div className={styles.detalleSection}>
          <div className={styles.detalleHeader}>
            <h2>Movimientos: {tarjetaSeleccionada.alias}</h2>
            {tarjetaSeleccionada.tipo === "credito" && (
              <div className={styles.fechasClave}>
                <span className={styles.badgeInfo}>
                  📅 Cierre: Día {tarjetaSeleccionada.diaCierre}
                </span>
                <span className={styles.badgeDanger}>
                  ⚠️ Vence: Día {tarjetaSeleccionada.diaVencimiento}
                </span>
              </div>
            )}
          </div>

          <Lista
            items={transaccionesFiltradas}
            alEliminar={() => {}} // Solo lectura aquí para no complicar
            alSeleccionar={() => {}}
          />
        </div>
      )}

      {/* MODAL AGREGAR */}
      <FormDialog
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Agregar Tarjeta"
      >
        <div className={styles.form}>
          <div className={styles.row}>
            <input
              className={styles.input}
              placeholder="Alias (ej: Visa Galicia)"
              value={nuevoAlias}
              onChange={(e) => setNuevoAlias(e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Banco"
              value={nuevoBanco}
              onChange={(e) => setNuevoBanco(e.target.value)}
            />
          </div>

          <div className={styles.row}>
            <select
              className={styles.input}
              value={nuevoTipo}
              onChange={(e) => setNuevoTipo(e.target.value as any)}
            >
              <option value="credito">Crédito 💳</option>
              <option value="debito">Débito 💵</option>
            </select>
            <input
              className={styles.input}
              placeholder="Últimos 4 núm"
              maxLength={4}
              value={nuevoLast4}
              onChange={(e) => setNuevoLast4(e.target.value)}
            />
          </div>

          {nuevoTipo === "credito" && (
            <>
              <input
                className={styles.input}
                type="number"
                placeholder="Límite Total ($)"
                value={nuevoLimite}
                onChange={(e) => setNuevoLimite(e.target.value)}
              />
              <div className={styles.row}>
                <input
                  className={styles.input}
                  type="number"
                  placeholder="Día Cierre (1-31)"
                  max={31}
                  value={nuevoCierre}
                  onChange={(e) => setNuevoCierre(e.target.value)}
                />
                <input
                  className={styles.input}
                  type="number"
                  placeholder="Día Venc (1-31)"
                  max={31}
                  value={nuevoVenc}
                  onChange={(e) => setNuevoVenc(e.target.value)}
                />
              </div>
            </>
          )}

          <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Color de la tarjeta
          </label>
          <div className={styles.colorPicker}>
            {COLORES_TARJETAS.map((c) => (
              <div
                key={c}
                className={`${styles.colorCircle} ${
                  nuevoColor === c ? styles.activeColor : ""
                }`}
                style={{ background: c }}
                onClick={() => setNuevoColor(c)}
              ></div>
            ))}
          </div>

          <button className={styles.btnSave} onClick={guardarTarjeta}>
            Guardar Tarjeta
          </button>
        </div>
      </FormDialog>
    </main>
  );
}
