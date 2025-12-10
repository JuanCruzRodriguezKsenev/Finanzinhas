"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./page.module.css";
import { Transaccion, PresupuestoMensual, Tarjeta } from "@/types";

import Balance from "@/components/Balance/Balance";
import Formulario from "@/components/Formulario/Formulario";
import Lista from "@/components/Lista/Lista";
import Analisis from "@/components/Analisis/Analisis";
import FormDialog from "@/components/FormDialog/FormDialog";
import { obtenerPresupuestoDelMes } from "@/utils/presupuestos";

const METODOS_DEFECTO = [
  "Efectivo 💵",
  "Débito 💳",
  "Crédito 💳",
  "Transferencia 🏦",
];

export default function Home() {
  // --- ESTADOS DE DATOS ---
  const [listaTransacciones, setListaTransacciones] = useState<Transaccion[]>(
    []
  );
  const [presupuestoActual, setPresupuestoActual] =
    useState<PresupuestoMensual | null>(null);
  const [metodosPago, setMetodosPago] = useState<string[]>(METODOS_DEFECTO);
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]); // 👈 Para las alertas

  //UI States
  const [itemParaEditar, setItemParaEditar] = useState<Transaccion | null>(
    null
  );
  const [mostrarModal, setMostrarModal] = useState(false);
  const [montado, setMontado] = useState(false);

  // --- CARGA INICIAL ---
  useEffect(() => {
    setMontado(true);

    // 1. Transacciones
    const datosGuardados = localStorage.getItem("finansinho-datos");
    if (datosGuardados) {
      try {
        const txs = JSON.parse(datosGuardados).map((item: any) => ({
          ...item,
          tipo: item.tipo || "gasto",
          metodoPago: item.metodoPago || "Efectivo 💵",
        }));
        setListaTransacciones(txs);
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Presupuestos
    const dataPresu = localStorage.getItem("finansinho-presupuestos-v2");
    if (dataPresu) {
      try {
        const todosPresus = JSON.parse(dataPresu);
        setPresupuestoActual(obtenerPresupuestoDelMes(todosPresus, new Date()));
      } catch (e) {}
    }

    // 3. Métodos de Pago
    const metodosGuardados = localStorage.getItem("finansinho-metodos");
    if (metodosGuardados) setMetodosPago(JSON.parse(metodosGuardados));

    // 4. Tarjetas (Para alertas)
    const dataTarjetas = localStorage.getItem("finansinho-tarjetas");
    if (dataTarjetas) setTarjetas(JSON.parse(dataTarjetas));
  }, []);

  // --- PERSISTENCIA ---
  const guardarCambios = (nuevaLista: Transaccion[]) => {
    setListaTransacciones(nuevaLista);
    localStorage.setItem("finansinho-datos", JSON.stringify(nuevaLista));
  };

  const verificarYGuardarMetodo = (nuevoMetodo: string) => {
    if (!metodosPago.includes(nuevoMetodo)) {
      const nuevaLista = [...metodosPago, nuevoMetodo];
      setMetodosPago(nuevaLista);
      localStorage.setItem("finansinho-metodos", JSON.stringify(nuevaLista));
    }
  };

  // --- HANDLERS ---
  const agregarTransaccion = (nueva: Transaccion) => {
    verificarYGuardarMetodo(nueva.metodoPago);
    const nuevaLista = [...listaTransacciones, nueva];
    guardarCambios(nuevaLista);
    setMostrarModal(false);
  };

  const actualizarTransaccion = (itemActualizado: Transaccion) => {
    verificarYGuardarMetodo(itemActualizado.metodoPago);
    const nuevaLista = listaTransacciones.map((item) =>
      item.id === itemActualizado.id ? itemActualizado : item
    );
    guardarCambios(nuevaLista);
    setItemParaEditar(null);
    setMostrarModal(false);
  };

  const eliminarTransaccion = (id: number) => {
    if (!confirm("¿Eliminar movimiento?")) return;
    const nuevaLista = listaTransacciones.filter((t) => t.id !== id);
    guardarCambios(nuevaLista);
    if (itemParaEditar && itemParaEditar.id === id) setItemParaEditar(null);
  };

  // --- CÁLCULOS DINÁMICOS ---
  const resumenDelMes = useMemo(() => {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    const transaccionesMes = listaTransacciones.filter((t) => {
      const [anioStr, mesStr] = t.fecha.split("-");
      return (
        parseInt(mesStr) - 1 === mesActual && parseInt(anioStr) === anioActual
      );
    });

    const ingresos = transaccionesMes
      .filter((t) => t.tipo === "ingreso")
      .reduce((acc, item) => acc + item.monto, 0);
    const gastos = transaccionesMes
      .filter((t) => t.tipo === "gasto")
      .reduce((acc, item) => acc + item.monto, 0);

    return {
      transacciones: transaccionesMes,
      ingresos,
      gastos,
      balance: ingresos - gastos,
      nombreMes: new Intl.DateTimeFormat("es-ES", { month: "long" }).format(
        hoy
      ),
      anio: anioActual,
    };
  }, [listaTransacciones]);

  // 👇 LÓGICA DE ALERTAS VENCIMIENTO TARJETAS
  const alertasVencimiento = useMemo(() => {
    const hoyDia = new Date().getDate();
    return tarjetas.filter((t) => {
      if (t.tipo !== "credito" || !t.diaVencimiento) return false;
      const diasFaltantes = t.diaVencimiento - hoyDia;
      // Muestra alerta si vence entre hoy y los próximos 5 días
      return diasFaltantes >= 0 && diasFaltantes <= 5;
    });
  }, [tarjetas]);

  const nombreMesCapitalizado =
    resumenDelMes.nombreMes.charAt(0).toUpperCase() +
    resumenDelMes.nombreMes.slice(1);

  useEffect(() => {
    if (itemParaEditar) setMostrarModal(true);
  }, [itemParaEditar]);

  const cerrarModalCompleto = () => {
    setMostrarModal(false);
    setTimeout(() => setItemParaEditar(null), 300);
  };

  if (!montado) return null;

  return (
    <main className={styles.main}>
      <div className={styles.headerTop}>
        <div className={styles.brand}>
          <h1>Dashboard 🏠</h1>
          <p>
            Resumen de {nombreMesCapitalizado} {resumenDelMes.anio}
          </p>
        </div>
      </div>

      {/* 👇 SECCIÓN DE ALERTAS */}
      {alertasVencimiento.length > 0 && (
        <div
          style={{
            marginBottom: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {alertasVencimiento.map((t) => (
            <div
              key={t.id}
              style={{
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid #f59e0b",
                borderRadius: "0.8rem",
                padding: "0.8rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                color: "#d97706",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              <span>🔔</span>
              <span>
                Tu tarjeta <strong>{t.alias}</strong> vence el día{" "}
                {t.diaVencimiento}. ¡Recuerda pagar el resumen!
              </span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.dashboardGrid}>
        <div className={styles.areaBalance}>
          <Balance
            total={resumenDelMes.balance}
            ingresos={resumenDelMes.ingresos}
            gastos={resumenDelMes.gastos}
          />
        </div>
        <div className={styles.areaAnalisis}>
          <Analisis
            presupuestoActual={presupuestoActual}
            transaccionesMes={resumenDelMes.transacciones}
            historicoTransacciones={listaTransacciones}
          />
        </div>
        <div className={styles.areaLista}>
          <Lista
            items={resumenDelMes.transacciones}
            alEliminar={eliminarTransaccion}
            alSeleccionar={setItemParaEditar}
          />
        </div>
      </div>

      <button
        className={styles.fab}
        onClick={() => {
          setItemParaEditar(null);
          setMostrarModal(true);
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <FormDialog
        open={mostrarModal}
        onClose={cerrarModalCompleto}
        title={itemParaEditar ? "Editar Movimiento ✏️" : "Nuevo Movimiento ✨"}
      >
        <Formulario
          alAgregar={agregarTransaccion}
          alEditar={actualizarTransaccion}
          itemEditar={itemParaEditar}
          alCancelar={cerrarModalCompleto}
          listaMetodosPago={metodosPago}
        />
      </FormDialog>
    </main>
  );
}
