"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { Transaccion } from "@/types";

import Balance from "@/components/Balance/Balance";
import Formulario from "@/components/Formulario/Formulario";
import Grafico from "@/components/Graficos/Graficos";
import Lista from "@/components/Lista/Lista";

export default function Home() {
  // Estado con TODAS las transacciones (Base de datos completa)
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

  // --- CRUD (Operan sobre la lista COMPLETA) ---

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
    if (itemParaEditar && itemParaEditar.id === id) {
      setItemParaEditar(null);
    }
  };

  // --- LÓGICA DE FILTRADO (Solo mes actual) ---
  const hoy = new Date();
  const mesActual = hoy.getMonth(); // 0 = Enero
  const anioActual = hoy.getFullYear();

  // Obtenemos el nombre del mes para mostrarlo en el título
  const nombreMes = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(
    hoy
  );
  // Capitalizamos la primera letra (ej: "diciembre" -> "Diciembre")
  const nombreMesCapitalizado =
    nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

  // Filtramos: Solo mostramos lo que coincida con el mes y año de hoy
  const transaccionesDelMes = listaTransacciones.filter((t) => {
    // t.fecha viene como "YYYY-MM-DD"
    const [anioStr, mesStr] = t.fecha.split("-");
    const mesItem = parseInt(mesStr) - 1; // Ajustamos a 0-11
    const anioItem = parseInt(anioStr);

    return mesItem === mesActual && anioItem === anioActual;
  });

  // Calculamos el balance SOLO de este mes
  const balanceMensual = transaccionesDelMes.reduce((acc, item) => {
    return item.tipo === "ingreso" ? acc + item.monto : acc - item.monto;
  }, 0);

  if (!montado) return null;

  return (
    <main className={styles.main}>
      <section className={styles.panelIzquierdo}>
        <div className={styles.headerTop}>
          <div className={styles.brand}>
            <h1>Dashboard 🏠</h1>
            {/* 👇 Mostramos qué mes estamos viendo */}
            <p style={{ fontWeight: 500, color: "var(--accent)" }}>
              Resumen de {nombreMesCapitalizado} {anioActual}
            </p>
          </div>
        </div>

        {/* Pasamos el balance filtrado */}
        <Balance total={balanceMensual} />

        <Formulario
          alAgregar={agregarTransaccion}
          alEditar={actualizarTransaccion}
          itemEditar={itemParaEditar}
          alCancelar={() => setItemParaEditar(null)}
        />
      </section>

      <section className={styles.panelDerecho}>
        {/* Gráfico solo con datos del mes */}
        <Grafico items={transaccionesDelMes} tipoPeriodo="mensual" />

        {/* Lista solo con datos del mes */}
        <Lista
          items={transaccionesDelMes}
          alEliminar={eliminarTransaccion}
          alSeleccionar={setItemParaEditar}
        />
      </section>
    </main>
  );
}
