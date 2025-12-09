"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Transaccion, PresupuestoMensual } from "@/types";

import Balance from "@/components/Balance/Balance";
import Formulario from "@/components/Formulario/Formulario";
import Lista from "@/components/Lista/Lista";
import Analisis from "@/components/Analisis/Analisis";
import FormDialog from "@/components/FormDialog/FormDialog";
import { obtenerPresupuestoDelMes } from "@/utils/presupuestos";

// 👇 LISTA INICIAL POR DEFECTO
const METODOS_DEFECTO = [
  "Efectivo 💵",
  "Débito 💳",
  "Crédito 💳",
  "Transferencia 🏦",
];

export default function Home() {
  const [listaTransacciones, setListaTransacciones] = useState<Transaccion[]>(
    []
  );
  const [presupuestoActual, setPresupuestoActual] =
    useState<PresupuestoMensual | null>(null);

  // 👇 ESTADO PARA MÉTODOS DE PAGO
  const [metodosPago, setMetodosPago] = useState<string[]>(METODOS_DEFECTO);

  const [itemParaEditar, setItemParaEditar] = useState<Transaccion | null>(
    null
  );
  const [montado, setMontado] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    setMontado(true);

    // 1. Transacciones
    const datosGuardados = localStorage.getItem("finansinho-datos");
    if (datosGuardados) {
      try {
        const txs = JSON.parse(datosGuardados).map((item: any) => ({
          ...item,
          tipo: item.tipo || "gasto",
          // Migración: si son datos viejos sin método, ponemos Efectivo
          metodoPago: item.metodoPago || "Efectivo 💵",
        }));
        setListaTransacciones(txs);
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Presupuestos
    const dataPresu = localStorage.getItem("finansinho-presupuestos-v2");
    let todosPresus: PresupuestoMensual[] = [];
    if (dataPresu) {
      try {
        todosPresus = JSON.parse(dataPresu);
      } catch (e) {}
    }
    const actual = obtenerPresupuestoDelMes(todosPresus, new Date());
    setPresupuestoActual(actual);

    // 3. 👇 Cargar Métodos de Pago Personalizados
    const metodosGuardados = localStorage.getItem("finansinho-metodos");
    if (metodosGuardados) {
      try {
        setMetodosPago(JSON.parse(metodosGuardados));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (itemParaEditar) setMostrarModal(true);
  }, [itemParaEditar]);

  const guardarEnNavegador = (nuevaLista: Transaccion[]) => {
    localStorage.setItem("finansinho-datos", JSON.stringify(nuevaLista));
  };

  // 👇 FUNCIÓN PARA GUARDAR UN NUEVO MÉTODO SI NO EXISTE
  const verificarYGuardarMetodo = (nuevoMetodo: string) => {
    if (!metodosPago.includes(nuevoMetodo)) {
      const nuevaLista = [...metodosPago, nuevoMetodo];
      setMetodosPago(nuevaLista);
      localStorage.setItem("finansinho-metodos", JSON.stringify(nuevaLista));
    }
  };

  const agregarTransaccion = (nueva: Transaccion) => {
    verificarYGuardarMetodo(nueva.metodoPago); // Guardamos el método si es nuevo
    const nuevaLista = [...listaTransacciones, nueva];
    setListaTransacciones(nuevaLista);
    guardarEnNavegador(nuevaLista);
    setMostrarModal(false);
  };

  const actualizarTransaccion = (itemActualizado: Transaccion) => {
    verificarYGuardarMetodo(itemActualizado.metodoPago); // Guardamos el método si es nuevo
    const nuevaLista = listaTransacciones.map((item) =>
      item.id === itemActualizado.id ? itemActualizado : item
    );
    setListaTransacciones(nuevaLista);
    guardarEnNavegador(nuevaLista);
    setItemParaEditar(null);
    setMostrarModal(false);
  };

  // ... (eliminarTransaccion, cerrarModal, filtros... IGUAL QUE ANTES) ...
  const eliminarTransaccion = (id: number) => {
    const nuevaLista = listaTransacciones.filter((t) => t.id !== id);
    setListaTransacciones(nuevaLista);
    guardarEnNavegador(nuevaLista);
    if (itemParaEditar && itemParaEditar.id === id) setItemParaEditar(null);
  };

  const cerrarModalCompleto = () => {
    setMostrarModal(false);
    setItemParaEditar(null);
  };

  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const anioActual = hoy.getFullYear();
  const nombreMes = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(
    hoy
  );
  const nombreMesCapitalizado =
    nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

  const transaccionesDelMes = listaTransacciones.filter((t) => {
    const [anioStr, mesStr] = t.fecha.split("-");
    return (
      parseInt(mesStr) - 1 === mesActual && parseInt(anioStr) === anioActual
    );
  });

  const ingresosMensual = transaccionesDelMes
    .filter((t) => t.tipo === "ingreso")
    .reduce((acc, item) => acc + item.monto, 0);
  const gastosMensual = transaccionesDelMes
    .filter((t) => t.tipo === "gasto")
    .reduce((acc, item) => acc + item.monto, 0);
  const balanceTotal = ingresosMensual - gastosMensual;

  if (!montado) return null;

  return (
    <main className={styles.main}>
      {/* ... Header ... */}
      <div className={styles.headerTop}>
        <div className={styles.brand}>
          <h1>Dashboard 🏠</h1>
          <p>
            Resumen de {nombreMesCapitalizado} {anioActual}
          </p>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.areaBalance}>
          <Balance
            total={balanceTotal}
            ingresos={ingresosMensual}
            gastos={gastosMensual}
          />
        </div>
        <div className={styles.areaAnalisis}>
          <Analisis
            presupuestoActual={presupuestoActual}
            transaccionesMes={transaccionesDelMes}
            historicoTransacciones={listaTransacciones}
          />
        </div>
        <div className={styles.areaLista}>
          <Lista
            items={transaccionesDelMes}
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
          listaMetodosPago={metodosPago} // 👇 PASAMOS LA LISTA AL FORMULARIO
        />
      </FormDialog>
    </main>
  );
}
