"use client";
import { useState, useEffect } from "react";
import styles from "./tarjetas.module.css";
import { Tarjeta, Transaccion } from "@/types";
import CreditCard from "@/components/Tarjetas/CreditCard/CreditCard";
import FormDialog from "@/components/FormDialog/FormDialog";
import Lista from "@/components/Lista/Lista";

const COLORES_TARJETAS = [
  "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
  "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
  "linear-gradient(135deg, #000000 0%, #434343 100%)",
  "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
];

export default function PaginaTarjetas() {
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);

  const [tarjetaSeleccionada, setTarjetaSeleccionada] =
    useState<Tarjeta | null>(null);
  const [tarjetaParaEditar, setTarjetaParaEditar] = useState<Tarjeta | null>(
    null
  );

  // Modal
  const [showModal, setShowModal] = useState(false);

  // Form States
  const [nuevoAlias, setNuevoAlias] = useState("");
  const [nuevoBanco, setNuevoBanco] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState<"credito" | "debito">("credito");
  const [nuevoLimite, setNuevoLimite] = useState("");
  const [nuevoCierre, setNuevoCierre] = useState("");
  const [nuevoVenc, setNuevoVenc] = useState("");
  const [nuevoLast4, setNuevoLast4] = useState("");
  // 👇 NUEVO ESTADO PARA MANTENIMIENTO
  const [nuevoMantenimiento, setNuevoMantenimiento] = useState("");
  const [nuevoColor, setNuevoColor] = useState(COLORES_TARJETAS[0]);

  useEffect(() => {
    const dataCards = localStorage.getItem("finansinho-tarjetas");
    if (dataCards) setTarjetas(JSON.parse(dataCards));

    const dataTrans = localStorage.getItem("finansinho-datos");
    if (dataTrans) setTransacciones(JSON.parse(dataTrans));
  }, []);

  // CARGAR DATOS AL EDITAR
  useEffect(() => {
    if (tarjetaParaEditar) {
      setNuevoAlias(tarjetaParaEditar.alias);
      setNuevoBanco(tarjetaParaEditar.banco);
      setNuevoTipo(tarjetaParaEditar.tipo);
      setNuevoLimite(tarjetaParaEditar.limite.toString());
      setNuevoCierre(tarjetaParaEditar.diaCierre?.toString() || "");
      setNuevoVenc(tarjetaParaEditar.diaVencimiento?.toString() || "");
      setNuevoLast4(tarjetaParaEditar.ultimos4);
      // 👇 CARGAR MANTENIMIENTO
      setNuevoMantenimiento(
        tarjetaParaEditar.costoMantenimiento?.toString() || ""
      );
      setNuevoColor(tarjetaParaEditar.color);
      setShowModal(true);
    }
  }, [tarjetaParaEditar]);

  const resetForm = () => {
    setNuevoAlias("");
    setNuevoBanco("");
    setNuevoLimite("");
    setNuevoLast4("");
    setNuevoCierre("");
    setNuevoVenc("");
    setNuevoMantenimiento(""); // Resetear
    setTarjetaParaEditar(null);
  };

  const abrirModalCrear = () => {
    setTarjetaParaEditar(null);
    resetForm();
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setTarjetaParaEditar(null);
      resetForm();
    }, 300);
  };

  const guardarTarjeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoAlias || !nuevoBanco) return;

    // Objeto común
    const datosComunes = {
      alias: nuevoAlias,
      banco: nuevoBanco,
      tipo: nuevoTipo,
      ultimos4: nuevoLast4 || "0000",
      limite: parseFloat(nuevoLimite) || 0,
      diaCierre: parseInt(nuevoCierre) || 1,
      diaVencimiento: parseInt(nuevoVenc) || 10,
      costoMantenimiento: parseFloat(nuevoMantenimiento) || 0, // 👇 GUARDAR
      color: nuevoColor,
    };

    if (tarjetaParaEditar) {
      const actualizada: Tarjeta = { ...tarjetaParaEditar, ...datosComunes };
      const nuevaLista = tarjetas.map((t) =>
        t.id === actualizada.id ? actualizada : t
      );
      setTarjetas(nuevaLista);
      localStorage.setItem("finansinho-tarjetas", JSON.stringify(nuevaLista));
      if (tarjetaSeleccionada?.id === actualizada.id)
        setTarjetaSeleccionada(actualizada);
    } else {
      const nueva: Tarjeta = { id: Date.now(), ...datosComunes };
      const nuevaLista = [...tarjetas, nueva];
      setTarjetas(nuevaLista);
      localStorage.setItem("finansinho-tarjetas", JSON.stringify(nuevaLista));
    }

    cerrarModal();
  };

  const eliminarTarjeta = (id: number) => {
    if (!confirm("¿Borrar tarjeta?")) return;
    const nuevaLista = tarjetas.filter((t) => t.id !== id);
    setTarjetas(nuevaLista);
    localStorage.setItem("finansinho-tarjetas", JSON.stringify(nuevaLista));
    if (tarjetaSeleccionada?.id === id) setTarjetaSeleccionada(null);
  };

  const calcularConsumo = (idTarjeta: number) => {
    const tarjeta = tarjetas.find((t) => t.id === idTarjeta);
    if (!tarjeta) return 0;
    return transacciones
      .filter((t) => t.metodoPago === tarjeta.alias && t.tipo === "gasto")
      .reduce((acc, t) => acc + t.monto, 0);
  };

  const transaccionesFiltradas = tarjetaSeleccionada
    ? transacciones.filter((t) => t.metodoPago === tarjetaSeleccionada.alias)
    : [];

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>Mis Tarjetas 💳</h1>
        <button className={styles.btnAdd} onClick={abrirModalCrear}>
          + Nueva Tarjeta
        </button>
      </div>

      <div className={styles.walletGrid}>
        {tarjetas.map((t) => (
          <CreditCard
            key={t.id}
            data={t}
            consumoActual={calcularConsumo(t.id)}
            onDelete={eliminarTarjeta}
            onEdit={setTarjetaParaEditar}
            onSelect={setTarjetaSeleccionada}
            isSelected={tarjetaSeleccionada?.id === t.id}
          />
        ))}
        {tarjetas.length === 0 && (
          <p className={styles.empty}>No tienes tarjetas guardadas.</p>
        )}
      </div>

      {/* SECCIÓN DETALLE CON INFO DE MANTENIMIENTO */}
      {tarjetaSeleccionada && (
        <div className={styles.detalleSection}>
          <div className={styles.detalleHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <h2>{tarjetaSeleccionada.alias}</h2>
              {/* 👇 BADGE DE MANTENIMIENTO */}
              {tarjetaSeleccionada.costoMantenimiento ? (
                <span
                  style={{
                    fontSize: "0.8rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "var(--danger)",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                  }}
                >
                  Mantenimiento: $
                  {tarjetaSeleccionada.costoMantenimiento.toLocaleString()}
                </span>
              ) : null}
            </div>

            {tarjetaSeleccionada.tipo === "credito" && (
              <div className={styles.fechasClave}>
                <span className={styles.badgeInfo}>
                  📅 Cierre: {tarjetaSeleccionada.diaCierre}
                </span>
                <span className={styles.badgeDanger}>
                  ⚠️ Vence: {tarjetaSeleccionada.diaVencimiento}
                </span>
              </div>
            )}
          </div>
          <Lista
            items={transaccionesFiltradas}
            alEliminar={() => {}}
            alSeleccionar={() => {}}
          />
        </div>
      )}

      {/* FORMULARIO */}
      <FormDialog
        open={showModal}
        onClose={cerrarModal}
        title={tarjetaParaEditar ? "Editar Tarjeta ✏️" : "Nueva Tarjeta 💳"}
      >
        <form className={styles.form} onSubmit={guardarTarjeta}>
          <div className={styles.row}>
            <input
              className={styles.input}
              placeholder="Alias (ej: Visa Galicia)"
              value={nuevoAlias}
              onChange={(e) => setNuevoAlias(e.target.value)}
              required
            />
            <input
              className={styles.input}
              placeholder="Banco"
              value={nuevoBanco}
              onChange={(e) => setNuevoBanco(e.target.value)}
              required
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

          {/* 👇 INPUT PARA MANTENIMIENTO */}
          <div className={styles.row}>
            <input
              className={styles.input}
              type="number"
              placeholder="Costo Mantenimiento ($)"
              value={nuevoMantenimiento}
              onChange={(e) => setNuevoMantenimiento(e.target.value)}
            />
            {nuevoTipo === "credito" && (
              <input
                className={styles.input}
                type="number"
                placeholder="Límite Total ($)"
                value={nuevoLimite}
                onChange={(e) => setNuevoLimite(e.target.value)}
              />
            )}
          </div>

          {nuevoTipo === "credito" && (
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

          <button type="submit" className={styles.btnSave}>
            {tarjetaParaEditar ? "Guardar Cambios" : "Guardar Tarjeta"}
          </button>
        </form>
      </FormDialog>
    </main>
  );
}
