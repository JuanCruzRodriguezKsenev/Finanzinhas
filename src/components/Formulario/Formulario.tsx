"use client";
import { useState, useEffect, FormEvent } from "react";
import styles from "./Formulario.module.css";
import { Transaccion } from "@/types";

interface Props {
  alAgregar: (t: Transaccion) => void;
  alEditar: (t: Transaccion) => void;
  itemEditar: Transaccion | null;
  alCancelar: () => void;
  listaMetodosPago: string[]; // 👈 Recibimos la lista dinámica
}

const CATEGORIAS_DEF = [
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
  "Sueldo",
  "Ventas",
  "Regalo",
];

export default function Formulario({
  alAgregar,
  alEditar,
  itemEditar,
  alCancelar,
  listaMetodosPago,
}: Props) {
  const [tipo, setTipo] = useState<"gasto" | "ingreso">("gasto");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [concepto, setConcepto] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS_DEF[0]);
  const [monto, setMonto] = useState("");

  // ESTADOS PARA MÉTODO DE PAGO
  const [metodo, setMetodo] = useState(listaMetodosPago[0] || "Efectivo 💵");
  const [esNuevoMetodo, setEsNuevoMetodo] = useState(false);
  const [nuevoMetodoInput, setNuevoMetodoInput] = useState("");

  useEffect(() => {
    if (itemEditar) {
      setTipo(itemEditar.tipo);
      setFecha(itemEditar.fecha);
      setConcepto(itemEditar.concepto);
      setCategoria(itemEditar.categoria);
      setMonto(itemEditar.monto.toString());

      // Lógica para cargar el método al editar
      if (listaMetodosPago.includes(itemEditar.metodoPago)) {
        setMetodo(itemEditar.metodoPago);
        setEsNuevoMetodo(false);
      } else {
        // Si es uno viejo o raro, lo tratamos como nuevo o lo añadimos visualmente
        setMetodo(itemEditar.metodoPago);
      }
    } else {
      setTipo("gasto");
      setFecha(new Date().toISOString().split("T")[0]);
      setConcepto("");
      setCategoria(CATEGORIAS_DEF[0]);
      setMonto("");
      setMetodo(listaMetodosPago[0] || "Efectivo 💵");
      setEsNuevoMetodo(false);
    }
  }, [itemEditar, listaMetodosPago]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!concepto || !monto) return;

    // Determinar el nombre final del método
    const metodoFinal = esNuevoMetodo ? nuevoMetodoInput : metodo;
    if (!metodoFinal) return; // Validación básica

    const nuevaTransaccion: Transaccion = {
      id: itemEditar?.id || Date.now(),
      tipo,
      fecha,
      concepto,
      categoria,
      metodoPago: metodoFinal, // 👈 Guardamos el método
      monto: parseFloat(monto),
    };

    if (itemEditar) alEditar(nuevaTransaccion);
    else alAgregar(nuevaTransaccion);

    setConcepto("");
    setMonto("");
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <div className={styles.switchContainer}>
        <button
          type="button"
          className={`${styles.switchBtn} ${
            tipo === "gasto" ? styles.activoGasto : ""
          }`}
          onClick={() => setTipo("gasto")}
        >
          Gasto 📉
        </button>
        <button
          type="button"
          className={`${styles.switchBtn} ${
            tipo === "ingreso" ? styles.activoIngreso : ""
          }`}
          onClick={() => setTipo("ingreso")}
        >
          Ingreso 📈
        </button>
      </div>

      <div className={styles.row}>
        <div className={styles.fieldGroup} style={{ flex: 1 }}>
          <label className={styles.label}>Fecha</label>
          <input
            type="date"
            required
            className={styles.input}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        {/* 👇 SELECTOR DE MÉTODO DE PAGO */}
        <div className={styles.fieldGroup} style={{ flex: 1 }}>
          <label className={styles.label}>Método</label>
          {!esNuevoMetodo ? (
            <select
              className={styles.input}
              value={metodo}
              onChange={(e) => {
                if (e.target.value === "NEW") {
                  setEsNuevoMetodo(true);
                  setNuevoMetodoInput("");
                } else {
                  setMetodo(e.target.value);
                }
              }}
            >
              {listaMetodosPago.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              <option value="NEW">✨ Otro...</option>
            </select>
          ) : (
            <div style={{ display: "flex", gap: "5px" }}>
              <input
                type="text"
                placeholder="Ej. MercadoPago"
                className={styles.input}
                autoFocus
                value={nuevoMetodoInput}
                onChange={(e) => setNuevoMetodoInput(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setEsNuevoMetodo(false)}
                className={styles.btnCancelSmall}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Concepto</label>
        <input
          type="text"
          placeholder="Ej. Supermercado..."
          required
          className={styles.input}
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.fieldGroup} style={{ flex: 1 }}>
          <label className={styles.label}>Rubro</label>
          <select
            className={styles.input}
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            {CATEGORIAS_DEF.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup} style={{ flex: 1 }}>
          <label className={styles.label}>Monto</label>
          <div className={styles.inputWrapper}>
            <span className={styles.prefix}>$</span>
            <input
              type="number"
              placeholder="0"
              required
              min="0"
              step="0.01"
              className={styles.input}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={alCancelar} className={styles.btnCancel}>
          Cancelar
        </button>
        <button type="submit" className={styles.btnSubmit}>
          {itemEditar ? "Guardar" : "Registrar"}
        </button>
      </div>
    </form>
  );
}
