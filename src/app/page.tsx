"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Transaccion } from "@/types";

import Balance from "@/components/Balance/Balance";
import Formulario from "@/components/Formulario/Formulario";
import Grafico from "@/components/Graficos/Graficos";
import Lista from "@/components/Lista/Lista";

export default function Home() {
  const [listaTransacciones, setListaTransacciones] = useState<Transaccion[]>(
    []
  );
  const [itemParaEditar, setItemParaEditar] = useState<Transaccion | null>(
    null
  );
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    const datosGuardados = localStorage.getItem("finansinho-datos");
    if (datosGuardados) {
      try {
        const datos = JSON.parse(datosGuardados).map((item: any) => ({
          ...item,
          tipo: item.tipo || "gasto",
        }));
        setListaTransacciones(datos);
      } catch (e) {
        console.error("Error cargando datos", e);
      }
    }
  }, []);

  const guardarEnNavegador = (nuevaLista: Transaccion[]) => {
    localStorage.setItem("finansinho-datos", JSON.stringify(nuevaLista));
  };

  // --- CRUD ---
  const agregarTransaccion = (nueva: Transaccion) => {
    const nuevaLista = [...listaTransacciones, nueva];
    setListaTransacciones(nuevaLista);
    guardarEnNavegador(nuevaLista);
  };

  const actualizarTransaccion = (itemActualizado: Transaccion) => {
    const nuevaLista = listaTransacciones.map((item) =>
      item.id === itemActualizado.id ? itemActualizado : item
    );
    setListaTransacciones(nuevaLista);
    guardarEnNavegador(nuevaLista);
    setItemParaEditar(null);
  };

  const eliminarTransaccion = (id: number) => {
    const nuevaLista = listaTransacciones.filter((t) => t.id !== id);
    setListaTransacciones(nuevaLista);
    guardarEnNavegador(nuevaLista);
    if (itemParaEditar && itemParaEditar.id === id) setItemParaEditar(null);
  };

  // --- DATOS DEL MES ---
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
    const mesItem = parseInt(mesStr) - 1;
    const anioItem = parseInt(anioStr);
    return mesItem === mesActual && anioItem === anioActual;
  });

  const balanceMensual = transaccionesDelMes.reduce((acc, item) => {
    return item.tipo === "ingreso" ? acc + item.monto : acc - item.monto;
  }, 0);

  if (!montado) return null;

  return (
    <main className={styles.main}>
      {/* 1. HEADER (Ahora está afuera y ocupa todo el ancho) */}
      <div className={styles.headerTop}>
        <div className={styles.brand}>
          <h1>Dashboard 🏠</h1>
          <p>
            Resumen de {nombreMesCapitalizado} {anioActual}
          </p>
        </div>
      </div>

      {/* 2. GRILLA DE CONTENIDO (Columnas alineadas) */}
      <div className={styles.gridContent}>
        <section className={styles.panelIzquierdo}>
          {/* El Balance ahora es el primer elemento, igual que el Gráfico */}
          <Balance total={balanceMensual} />

          <Formulario
            alAgregar={agregarTransaccion}
            alEditar={actualizarTransaccion}
            itemEditar={itemParaEditar}
            alCancelar={() => setItemParaEditar(null)}
          />
        </section>

        <section className={styles.panelDerecho}>
          <Grafico items={transaccionesDelMes} tipoPeriodo="mensual" />

          <Lista
            items={transaccionesDelMes}
            alEliminar={eliminarTransaccion}
            alSeleccionar={setItemParaEditar}
          />
        </section>
      </div>
    </main>
  );
}
