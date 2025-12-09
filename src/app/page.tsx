"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Transaccion } from "../types";

import Balance from "@/components/Balance/Balance";
import Formulario from "@/components/Formulario/Formulario";
import Grafico from "@/components/Graficos/Graficos";
import Lista from "@/components/Lista/Lista";

export default function Home() {
  const [listaTransacciones, setListaTransacciones] = useState<Transaccion[]>(
    []
  );
  // 👈 NUEVO: Estado para saber qué estamos editando (null = creando nuevo)
  const [itemParaEditar, setItemParaEditar] = useState<Transaccion | null>(
    null
  );

  const [tema, setTema] = useState("claro");
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    const datosGuardados = localStorage.getItem("finansinho-datos");
    if (datosGuardados) {
      const datos = JSON.parse(datosGuardados).map((item: any) => ({
        ...item,
        tipo: item.tipo || "gasto",
      }));
      setListaTransacciones(datos);
    }
    const temaGuardado = localStorage.getItem("finansinho-tema");
    if (temaGuardado) setTema(temaGuardado);
  }, []);

  const guardarEnNavegador = (nuevaLista: Transaccion[]) => {
    localStorage.setItem("finansinho-datos", JSON.stringify(nuevaLista));
  };

  const toggleTema = () => {
    const nuevoTema = tema === "claro" ? "oscuro" : "claro";
    setTema(nuevoTema);
    localStorage.setItem("finansinho-tema", nuevoTema);
  };

  // --- LÓGICA CRUD ---
  const agregarTransaccion = (nueva: Transaccion) => {
    const nuevaLista = [...listaTransacciones, nueva];
    setListaTransacciones(nuevaLista);
    guardarEnNavegador(nuevaLista);
  };

  // 👈 NUEVO: Función para actualizar un item existente
  const actualizarTransaccion = (itemActualizado: Transaccion) => {
    const nuevaLista = listaTransacciones.map((item) =>
      item.id === itemActualizado.id ? itemActualizado : item
    );
    setListaTransacciones(nuevaLista);
    guardarEnNavegador(nuevaLista);

    // Al terminar, salimos del modo edición
    setItemParaEditar(null);
  };

  const eliminarTransaccion = (id: number) => {
    const nuevaLista = listaTransacciones.filter((t) => t.id !== id);
    setListaTransacciones(nuevaLista);
    guardarEnNavegador(nuevaLista);

    // Si justo estábamos editando el que borramos, limpiamos el form
    if (itemParaEditar && itemParaEditar.id === id) {
      setItemParaEditar(null);
    }
  };

  const balanceTotal = listaTransacciones.reduce((acc, item) => {
    return item.tipo === "ingreso" ? acc + item.monto : acc - item.monto;
  }, 0);

  if (!montado) return null;

  return (
    <main
      className={`${styles.main} ${
        tema === "oscuro" ? styles.oscuro : styles.claro
      }`}
    >
      <section className={styles.panelIzquierdo}>
        <div className={styles.headerTop}>
          <div className={styles.brand}>
            <h1>Finansinho 💰</h1>
            <p>Tu control financiero</p>
          </div>
          <button onClick={toggleTema} className={styles.botonTema}>
            {tema === "claro" ? "🌙" : "☀️"}
          </button>
        </div>

        <Balance total={balanceTotal} />

        <Formulario
          alAgregar={agregarTransaccion}
          alEditar={actualizarTransaccion} // 👈 Pasamos la función de actualizar
          itemEditar={itemParaEditar} // 👈 Pasamos el item actual
          alCancelar={() => setItemParaEditar(null)} // 👈 Función para cancelar
        />
      </section>

      <section className={styles.panelDerecho}>
        <Grafico items={listaTransacciones} />

        <Lista
          items={listaTransacciones}
          alEliminar={eliminarTransaccion}
          alSeleccionar={setItemParaEditar} // 👈 Cuando tocan el lápiz, actualizamos el estado
        />
      </section>
    </main>
  );
}
