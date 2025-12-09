"use client";
import { useState, useEffect, useMemo } from "react";
import styles from "./presupuestos.module.css";
import { PresupuestoMensual, Transaccion } from "@/types";
import {
  obtenerPresupuestoDelMes,
  generarRecomendaciones,
} from "@/utils/presupuestos";

const RUBROS_SUGERIDOS = [
  "Comida",
  "Transporte",
  "Servicios",
  "Ocio",
  "Ropa",
  "Salud",
  "Educación",
  "Inversiones",
  "Alquiler",
  "Suscripciones",
];

export default function PaginaPresupuestos() {
  const [todosLosPresupuestos, setTodosLosPresupuestos] = useState<
    PresupuestoMensual[]
  >([]);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [presupuestoMes, setPresupuestoMes] =
    useState<PresupuestoMensual | null>(null);
  const [recomendaciones, setRecomendaciones] = useState<string[]>([]);

  // Estado para el input de monto (ahora string para manejar formato)
  const [nuevoMonto, setNuevoMonto] = useState("");

  const [rubroSeleccionado, setRubroSeleccionado] = useState("");
  const [esNuevoRubro, setEsNuevoRubro] = useState(false);
  const [nombreNuevoRubro, setNombreNuevoRubro] = useState("");

  const hoy = new Date();

  useEffect(() => {
    const dataTrans = localStorage.getItem("finansinho-datos");
    const dataPresu = localStorage.getItem("finansinho-presupuestos-v2");

    let txs: Transaccion[] = [];
    if (dataTrans) txs = JSON.parse(dataTrans);
    setTransacciones(txs);

    let presupuestos: PresupuestoMensual[] = [];
    if (dataPresu) presupuestos = JSON.parse(dataPresu);
    setTodosLosPresupuestos(presupuestos);

    const actual = obtenerPresupuestoDelMes(presupuestos, hoy);
    setPresupuestoMes(actual);
    setRecomendaciones(generarRecomendaciones(actual, txs));
  }, []);

  const totalAsignado = useMemo(() => {
    if (!presupuestoMes) return 0;
    return presupuestoMes.categorias.reduce((acc, c) => acc + c.montoMaximo, 0);
  }, [presupuestoMes]);

  const disponible = (presupuestoMes?.presupuestoGeneral || 0) - totalAsignado;

  const nombreMesLegible = useMemo(() => {
    if (!presupuestoMes) return "";
    const [anio, mes] = presupuestoMes.mes.split("-");
    const fechaObj = new Date(parseInt(anio), parseInt(mes) - 1, 1);
    const nombre = fechaObj.toLocaleString("es-ES", {
      month: "long",
      year: "numeric",
    });
    return nombre.charAt(0).toUpperCase() + nombre.slice(1);
  }, [presupuestoMes]);

  const guardar = (nuevoPresupuestoMes: PresupuestoMensual) => {
    const nuevaLista = todosLosPresupuestos.filter(
      (p) => p.mes !== nuevoPresupuestoMes.mes
    );
    nuevaLista.push(nuevoPresupuestoMes);
    setTodosLosPresupuestos(nuevaLista);
    setPresupuestoMes(nuevoPresupuestoMes);
    localStorage.setItem(
      "finansinho-presupuestos-v2",
      JSON.stringify(nuevaLista)
    );
  };

  // --- 👇 NUEVA LÓGICA DE FORMATO DE NÚMEROS ---

  // Función para formatear visualmente (agrega puntos)
  const formatNumber = (num: number | string) => {
    if (!num) return "";
    return parseInt(num.toString()).toLocaleString("es-ES");
  };

  // Función para limpiar el input (quita puntos para guardar)
  const cleanNumber = (val: string) => {
    return val.replace(/\./g, "").replace(/,/g, ""); // Quita puntos y comas
  };

  // Handler para el Presupuesto General
  const handleUpdateGeneral = (valorVisual: string) => {
    if (!presupuestoMes) return;
    const valorLimpio = cleanNumber(valorVisual);

    // Si está vacío o no es número, ponemos 0
    if (valorLimpio === "") {
      guardar({ ...presupuestoMes, presupuestoGeneral: 0 });
      return;
    }

    const numero = parseInt(valorLimpio, 10);
    if (!isNaN(numero)) {
      guardar({ ...presupuestoMes, presupuestoGeneral: numero });
    }
  };

  // Handler para el Nuevo Monto (Rubro)
  const handleChangeMontoRubro = (valorVisual: string) => {
    const valorLimpio = cleanNumber(valorVisual);
    if (valorLimpio === "") {
      setNuevoMonto("");
      return;
    }
    const numero = parseInt(valorLimpio, 10);
    if (!isNaN(numero)) {
      // Guardamos el string formateado en el estado del input para que se vea bonito
      setNuevoMonto(numero.toLocaleString("es-ES"));
    }
  };

  const agregarCategoria = () => {
    if (!presupuestoMes || !nuevoMonto) return;

    const nombreFinal = esNuevoRubro ? nombreNuevoRubro : rubroSeleccionado;
    if (!nombreFinal) return;

    // Limpiamos el monto antes de guardar (quitamos los puntos del input)
    const monto = parseInt(cleanNumber(nuevoMonto), 10);

    if (monto > disponible) {
      alert(
        `❌ No puedes asignar $${monto.toLocaleString()} porque solo te quedan $${disponible.toLocaleString()} disponibles.`
      );
      return;
    }

    if (presupuestoMes.categorias.find((c) => c.categoria === nombreFinal)) {
      alert("Esta categoría ya existe.");
      return;
    }

    const nuevasCats = [
      ...presupuestoMes.categorias,
      { categoria: nombreFinal, montoMaximo: monto },
    ];
    guardar({ ...presupuestoMes, categorias: nuevasCats });

    setNuevoMonto("");
    setNombreNuevoRubro("");
    setRubroSeleccionado("");
    setEsNuevoRubro(false);
  };

  const eliminarCategoria = (catName: string) => {
    if (!presupuestoMes) return;
    const nuevasCats = presupuestoMes.categorias.filter(
      (c) => c.categoria !== catName
    );
    guardar({ ...presupuestoMes, categorias: nuevasCats });
  };

  if (!presupuestoMes) return null;

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestión de Presupuestos 📅</h1>
        <p className={styles.subtitle}>Planificación para {nombreMesLegible}</p>
      </div>

      <div className={styles.generalCard}>
        <div className={styles.generalHeader}>
          <span>💰 Presupuesto Mensual Total</span>
          {disponible < 0 ? (
            <span className={styles.badgeDanger}>
              Excedido por ${Math.abs(disponible).toLocaleString()}
            </span>
          ) : (
            <span className={styles.badgeSuccess}>
              Disponible: ${disponible.toLocaleString()}
            </span>
          )}
        </div>
        <div className={styles.generalInputWrapper}>
          <span className={styles.currencySymbol}>$</span>

          {/* 👇 INPUT GENERAL: Ahora es type="text" y usa el value formateado */}
          <input
            type="text"
            className={styles.inputGeneral}
            // Si es 0, mostramos vacío para que el placeholder se vea, sino formateamos
            value={
              presupuestoMes.presupuestoGeneral === 0
                ? ""
                : formatNumber(presupuestoMes.presupuestoGeneral)
            }
            onChange={(e) => handleUpdateGeneral(e.target.value)}
            placeholder="0"
            inputMode="numeric" // Abre teclado numérico en móviles
          />
        </div>
        <div className={styles.progressBarBg}>
          <div
            className={styles.progressBarFill}
            style={{
              width: `${Math.min(
                (totalAsignado / (presupuestoMes.presupuestoGeneral || 1)) *
                  100,
                100
              )}%`,
              backgroundColor:
                disponible < 0 ? "var(--danger)" : "var(--accent)",
            }}
          ></div>
        </div>
        <p className={styles.generalInfo}>
          Has asignado <b>${totalAsignado.toLocaleString()}</b> de{" "}
          <b>${(presupuestoMes.presupuestoGeneral || 0).toLocaleString()}</b>
        </p>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Distribución por Rubros</h3>

        {presupuestoMes.categorias.length === 0 && (
          <p className={styles.emptyState}>No has asignado rubros todavía.</p>
        )}

        {presupuestoMes.categorias.map((cat) => (
          <div key={cat.categoria} className={styles.itemRow}>
            <span className={styles.catName}>{cat.categoria}</span>
            <div className={styles.actions}>
              <span className={styles.monto}>
                ${cat.montoMaximo.toLocaleString()}
              </span>
              <button
                onClick={() => eliminarCategoria(cat.categoria)}
                className={styles.btnDelete}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        <div className={styles.formAdd}>
          <div className={styles.selectorWrapper}>
            {!esNuevoRubro ? (
              <select
                className={styles.input}
                value={rubroSeleccionado}
                onChange={(e) => {
                  if (e.target.value === "NEW") {
                    setEsNuevoRubro(true);
                    setRubroSeleccionado("");
                  } else {
                    setRubroSeleccionado(e.target.value);
                  }
                }}
              >
                <option value="">Selecciona un rubro...</option>
                {RUBROS_SUGERIDOS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
                <option value="NEW">✨ + Crear nuevo rubro...</option>
              </select>
            ) : (
              <div style={{ display: "flex", gap: "5px", flex: 2 }}>
                <input
                  type="text"
                  placeholder="Nombre del nuevo rubro"
                  className={styles.input}
                  autoFocus
                  value={nombreNuevoRubro}
                  onChange={(e) => setNombreNuevoRubro(e.target.value)}
                />
                <button
                  onClick={() => setEsNuevoRubro(false)}
                  className={styles.btnCancel}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* 👇 INPUT RUBRO: Ahora es type="text" y tiene lógica de puntos */}
          <input
            type="text"
            placeholder="Monto"
            className={`${styles.input} ${styles.inputMonto}`}
            value={nuevoMonto}
            onChange={(e) => handleChangeMontoRubro(e.target.value)}
            inputMode="numeric"
          />

          <button
            onClick={agregarCategoria}
            className={styles.btnAdd}
            disabled={disponible <= 0}
          >
            Asignar
          </button>
        </div>
        {disponible <= 0 && (
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--danger)",
              marginTop: "0.5rem",
              textAlign: "center",
            }}
          >
            ⚠️ Has agotado tu presupuesto general.
          </p>
        )}
      </div>
    </main>
  );
}
