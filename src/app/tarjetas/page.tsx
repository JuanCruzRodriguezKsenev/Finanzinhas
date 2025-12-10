"use client";
import { useState, useEffect } from "react";
import styles from "./tarjetas.module.css";
import { Tarjeta, Transaccion, Reserva } from "@/types";
import CreditCard from "@/components/Tarjetas/CreditCard/CreditCard";
import FormDialog from "@/components/FormDialog/FormDialog";
import Lista from "@/components/Lista/Lista";
import Formulario from "@/components/Formulario/Formulario";

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

  // No necesitamos el estado 'reservas' aquí para leer,
  // leeremos directo del localStorage al guardar para evitar conflictos.

  const [tarjetaSeleccionada, setTarjetaSeleccionada] =
    useState<Tarjeta | null>(null);

  // Modals
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalPago, setShowModalPago] = useState(false);
  const [tarjetaParaEditar, setTarjetaParaEditar] = useState<Tarjeta | null>(
    null
  );

  // Switch Pagar/Reservar
  const [modoPago, setModoPago] = useState<"pagar" | "reservar">("pagar");

  // Form Tarjeta
  const [nuevoAlias, setNuevoAlias] = useState("");
  const [nuevoBanco, setNuevoBanco] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState<"credito" | "debito">("credito");
  const [nuevoLimite, setNuevoLimite] = useState("");
  const [nuevoCierre, setNuevoCierre] = useState("");
  const [nuevoVenc, setNuevoVenc] = useState("");
  const [nuevoLast4, setNuevoLast4] = useState("");
  const [nuevoMantenimiento, setNuevoMantenimiento] = useState("");
  const [nuevoColor, setNuevoColor] = useState(COLORES_TARJETAS[0]);

  // CARGA DE DATOS
  useEffect(() => {
    const dataCards = localStorage.getItem("finansinho-tarjetas");
    if (dataCards) setTarjetas(JSON.parse(dataCards));

    const dataTrans = localStorage.getItem("finansinho-datos");
    if (dataTrans) setTransacciones(JSON.parse(dataTrans));
  }, []);

  useEffect(() => {
    if (tarjetaParaEditar) {
      setNuevoAlias(tarjetaParaEditar.alias);
      setNuevoBanco(tarjetaParaEditar.banco);
      setNuevoTipo(tarjetaParaEditar.tipo);
      setNuevoLimite(tarjetaParaEditar.limite.toString());
      setNuevoCierre(tarjetaParaEditar.diaCierre?.toString() || "");
      setNuevoVenc(tarjetaParaEditar.diaVencimiento?.toString() || "");
      setNuevoLast4(tarjetaParaEditar.ultimos4);
      setNuevoMantenimiento(
        tarjetaParaEditar.costoMantenimiento?.toString() || ""
      );
      setNuevoColor(tarjetaParaEditar.color);
      setShowModalEditar(true);
    }
  }, [tarjetaParaEditar]);

  // LÓGICA FECHAS (Validación)
  const esPeriodoDePago = (t: Tarjeta | null) => {
    if (!t || t.tipo !== "credito" || !t.diaCierre || !t.diaVencimiento)
      return false;
    const hoy = new Date().getDate();
    const { diaCierre, diaVencimiento } = t;
    if (diaVencimiento > diaCierre)
      return hoy > diaCierre && hoy <= diaVencimiento;
    return hoy > diaCierre || hoy <= diaVencimiento;
  };

  // HANDLERS TARJETAS
  const resetFormTarjeta = () => {
    setNuevoAlias("");
    setNuevoBanco("");
    setNuevoLimite("");
    setNuevoLast4("");
    setNuevoCierre("");
    setNuevoVenc("");
    setNuevoMantenimiento("");
    setTarjetaParaEditar(null);
  };

  const abrirCrearTarjeta = () => {
    setTarjetaParaEditar(null);
    resetFormTarjeta();
    setShowModalEditar(true);
  };

  const cerrarModalTarjeta = () => {
    setShowModalEditar(false);
    setTimeout(() => {
      setTarjetaParaEditar(null);
      resetFormTarjeta();
    }, 300);
  };

  const guardarTarjeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoAlias || !nuevoBanco) return;
    const datosComunes = {
      alias: nuevoAlias,
      banco: nuevoBanco,
      tipo: nuevoTipo,
      ultimos4: nuevoLast4 || "0000",
      limite: parseFloat(nuevoLimite) || 0,
      diaCierre: parseInt(nuevoCierre) || 1,
      diaVencimiento: parseInt(nuevoVenc) || 10,
      costoMantenimiento: parseFloat(nuevoMantenimiento) || 0,
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
    cerrarModalTarjeta();
  };

  const eliminarTarjeta = (id: number) => {
    if (!confirm("¿Borrar tarjeta?")) return;
    const nuevaLista = tarjetas.filter((t) => t.id !== id);
    setTarjetas(nuevaLista);
    localStorage.setItem("finansinho-tarjetas", JSON.stringify(nuevaLista));
    if (tarjetaSeleccionada?.id === id) setTarjetaSeleccionada(null);
  };

  // LÓGICA PAGO
  const registrarPago = (t: Transaccion) => {
    const nuevaLista = [...transacciones, t];
    setTransacciones(nuevaLista);
    localStorage.setItem("finansinho-datos", JSON.stringify(nuevaLista));
    setShowModalPago(false);
    alert("Pago registrado con éxito ✅");
  };

  // --- LÓGICA RESERVA (MEJORADA) ---
  const guardarReservaDesdeTarjeta = () => {
    if (!tarjetaSeleccionada) return;

    const monto = calcularConsumo(tarjetaSeleccionada.id);

    if (monto <= 0) {
      alert("No tienes consumos para reservar.");
      return;
    }

    // 1. Leer las reservas actuales directamente del almacenamiento para asegurar datos frescos
    const reservasActuales: Reserva[] = JSON.parse(
      localStorage.getItem("finansinho-reservas") || "[]"
    );

    const nuevaReserva: Reserva = {
      id: Date.now(),
      nombre: `Reserva ${tarjetaSeleccionada.alias}`,
      monto: monto,
      moneda: "ARS",
      tipo: "efectivo",
      ubicacion: "Caja Ahorro / Sobre",
      objetivo: "Deudas",
      rendimientoAnual: 0,
    };

    // 2. Guardar
    const nuevaLista = [...reservasActuales, nuevaReserva];
    localStorage.setItem("finansinho-reservas", JSON.stringify(nuevaLista));

    setShowModalPago(false);
    alert(
      `¡Listo! Se guardaron $${monto.toLocaleString()} en la sección RESERVAS 🛡️`
    );
  };

  const calcularConsumo = (idTarjeta: number) => {
    return transacciones
      .filter(
        (t) =>
          t.metodoPago === tarjetas.find((x) => x.id === idTarjeta)?.alias &&
          t.tipo === "gasto"
      )
      .reduce((acc, t) => acc + t.monto, 0);
  };

  const consumoActualSeleccionada = tarjetaSeleccionada
    ? calcularConsumo(tarjetaSeleccionada.id)
    : 0;
  const transaccionesFiltradas = tarjetaSeleccionada
    ? transacciones.filter((t) => t.metodoPago === tarjetaSeleccionada.alias)
    : [];

  const habilitadoParaPagar = esPeriodoDePago(tarjetaSeleccionada);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>Mis Tarjetas 💳</h1>
        <button className={styles.btnAdd} onClick={abrirCrearTarjeta}>
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

      {tarjetaSeleccionada && (
        <div className={styles.detalleSection}>
          <div className={styles.detalleHeader}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <h2>{tarjetaSeleccionada.alias}</h2>
              {tarjetaSeleccionada.costoMantenimiento ? (
                <span className={styles.badgeMantenimiento}>
                  Mantenimiento: $
                  {tarjetaSeleccionada.costoMantenimiento.toLocaleString()}
                </span>
              ) : null}
            </div>

            <div className={styles.headerActions}>
              {tarjetaSeleccionada.tipo === "credito" && (
                <>
                  <div className={styles.fechasClave}>
                    <span className={styles.badgeInfo}>
                      📅 Cierre: {tarjetaSeleccionada.diaCierre}
                    </span>
                    <span className={styles.badgeDanger}>
                      ⚠️ Vence: {tarjetaSeleccionada.diaVencimiento}
                    </span>
                  </div>

                  {/* BOTÓN INTELIGENTE */}
                  {habilitadoParaPagar ? (
                    <button
                      className={styles.btnPagar}
                      onClick={() => {
                        setModoPago("pagar");
                        setShowModalPago(true);
                      }}
                    >
                      💸 Pagar Resumen
                    </button>
                  ) : (
                    <button
                      className={styles.btnReservarOutline}
                      onClick={() => {
                        setModoPago("reservar");
                        setShowModalPago(true);
                      }}
                    >
                      🛡️ Reservar Dinero
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          <Lista
            items={transaccionesFiltradas}
            alEliminar={() => {}}
            alSeleccionar={() => {}}
          />
        </div>
      )}

      {/* MODAL EDITAR */}
      <FormDialog
        open={showModalEditar}
        onClose={cerrarModalTarjeta}
        title={tarjetaParaEditar ? "Editar Tarjeta" : "Nueva Tarjeta"}
      >
        <form className={styles.form} onSubmit={guardarTarjeta}>
          <div className={styles.row}>
            <input
              className={styles.input}
              placeholder="Alias (ej: Visa)"
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

      {/* MODAL GESTIÓN PAGO */}
      <FormDialog
        open={showModalPago}
        onClose={() => setShowModalPago(false)}
        title={`Gestionar ${tarjetaSeleccionada?.alias}`}
      >
        <div className={styles.switchContainer}>
          {/* BLOQUEO VISUAL DEL BOTÓN PAGAR SI NO ES FECHA */}
          <button
            type="button"
            className={`${styles.switchBtn} ${
              modoPago === "pagar" ? styles.activePagar : ""
            } ${!habilitadoParaPagar ? styles.disabledTab : ""}`}
            onClick={() => {
              if (habilitadoParaPagar) setModoPago("pagar");
              else
                alert(
                  `Aún no puedes pagar.\nEl resumen cierra el día ${tarjetaSeleccionada?.diaCierre}.`
                );
            }}
          >
            💸 Pagar Ahora {!habilitadoParaPagar && "🔒"}
          </button>

          <button
            type="button"
            className={`${styles.switchBtn} ${
              modoPago === "reservar" ? styles.activeReservar : ""
            }`}
            onClick={() => setModoPago("reservar")}
          >
            🛡️ Reservar Dinero
          </button>
        </div>

        {modoPago === "pagar" && habilitadoParaPagar ? (
          <Formulario
            alAgregar={registrarPago}
            alEditar={() => {}}
            itemEditar={null}
            alCancelar={() => setShowModalPago(false)}
            prefillConcepto={`Pago Resumen ${tarjetaSeleccionada?.alias}`}
            prefillCategoria="Deudas"
            prefillMonto={consumoActualSeleccionada}
          />
        ) : (
          <div className={styles.reservaContainer}>
            <div className={styles.reservaInfo}>
              <p>¿No puedes pagar todo hoy?</p>
              <span>
                Guardaremos este monto en tus <strong>Reservas</strong> para que
                no lo gastes en otra cosa.
              </span>
            </div>

            <div className={styles.reservaMonto}>
              <span>Monto a Reservar</span>
              <strong>$ {consumoActualSeleccionada.toLocaleString()}</strong>
            </div>

            <button
              className={styles.btnReservar}
              onClick={guardarReservaDesdeTarjeta}
            >
              Crear Reserva
            </button>
          </div>
        )}
      </FormDialog>
    </main>
  );
}
