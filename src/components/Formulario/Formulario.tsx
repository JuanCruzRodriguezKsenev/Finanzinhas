"use client";
import { useState, useEffect } from "react";
import styles from "./Formulario.module.css";
import { Transaccion, Tarjeta } from "@/types";

interface Props {
  alAgregar: (t: Transaccion) => void;
  alEditar: (t: Transaccion) => void;
  itemEditar: Transaccion | null;
  alCancelar: () => void;
  listaMetodosPago?: string[];
  // 👇 Props opcionales para pre-llenar datos desde otras secciones (ej: Pagar Tarjeta)
  prefillConcepto?: string;
  prefillMonto?: number;
  prefillCategoria?: string;
}

const METODOS_BASICOS = [
  "Efectivo 💵",
  "Transferencia 🏦",
  "Débito Genérico 💳",
];

export default function Formulario({
  alAgregar,
  alEditar,
  itemEditar,
  alCancelar,
  prefillConcepto,
  prefillMonto,
  prefillCategoria,
}: Props) {
  const [tipo, setTipo] = useState<"gasto" | "ingreso">("gasto");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [metodo, setMetodo] = useState(METODOS_BASICOS[0]);
  const [concepto, setConcepto] = useState("");
  const [categoria, setCategoria] = useState("Comida");
  const [monto, setMonto] = useState("");

  const [misTarjetas, setMisTarjetas] = useState<Tarjeta[]>([]);

  useEffect(() => {
    const dataTarjetas = localStorage.getItem("finansinho-tarjetas");
    if (dataTarjetas) setMisTarjetas(JSON.parse(dataTarjetas));

    if (itemEditar) {
      setTipo(itemEditar.tipo);
      setFecha(itemEditar.fecha);
      setMetodo(itemEditar.metodoPago);
      setConcepto(itemEditar.concepto);
      setCategoria(itemEditar.categoria);
      setMonto(itemEditar.monto.toString());
    } else {
      // Lógica de Pre-llenado (para botón "Pagar Resumen")
      if (prefillConcepto) setConcepto(prefillConcepto);
      if (prefillMonto) setMonto(prefillMonto.toString());
      if (prefillCategoria) setCategoria(prefillCategoria);
    }
  }, [itemEditar, prefillConcepto, prefillMonto, prefillCategoria]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monto || !concepto) return;

    // Si el método es una tarjeta guardada, vinculamos el ID
    const tarjetaUsada = misTarjetas.find((t) => t.alias === metodo);

    const nuevaTransaccion: Transaccion = {
      id: itemEditar ? itemEditar.id : Date.now(),
      fecha,
      tipo,
      metodoPago: metodo,
      concepto,
      categoria,
      monto: parseFloat(monto),
      tarjetaId: tarjetaUsada ? tarjetaUsada.id : undefined,
    };

    if (itemEditar) alEditar(nuevaTransaccion);
    else alAgregar(nuevaTransaccion);

    if (!itemEditar) {
      setConcepto("");
      setMonto("");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.switchContainer}>
        <button
          type="button"
          className={`${styles.switchBtn} ${
            tipo === "gasto" ? styles.activeGasto : ""
          }`}
          onClick={() => setTipo("gasto")}
        >
          Gasto 📉
        </button>
        <button
          type="button"
          className={`${styles.switchBtn} ${
            tipo === "ingreso" ? styles.activeIngreso : ""
          }`}
          onClick={() => setTipo("ingreso")}
        >
          Ingreso 📈
        </button>
      </div>

      <div className={styles.row}>
        <div className={styles.group}>
          <label>Fecha</label>
          <input
            type="date"
            className={styles.input}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        <div className={styles.group}>
          <label>Método</label>
          <select
            className={styles.select}
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
          >
            <optgroup label="General">
              {METODOS_BASICOS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </optgroup>
            {misTarjetas.length > 0 && (
              <optgroup label="Mis Tarjetas">
                {misTarjetas.map((t) => (
                  <option key={t.id} value={t.alias}>
                    {t.tipo === "credito" ? "💳" : "💵"} {t.alias}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      <div className={styles.group}>
        <label>Concepto</label>
        <input
          type="text"
          className={styles.input}
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
          placeholder="Ej: Supermercado"
          autoFocus
        />
      </div>

      <div className={styles.group}>
        <label>Rubro</label>
        <select
          className={styles.select}
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option>Comida</option>
          <option>Transporte</option>
          <option>Servicios</option>
          <option>Deudas</option>
          <option>Salidas</option>
          <option>Compras</option>
          <option>Salud</option>
          <option>Varios</option>
        </select>
      </div>

      <div className={styles.group}>
        <label>Monto</label>
        <div className={styles.inputWrapper}>
          <span className={styles.currencySymbol}>$</span>
          <input
            type="number"
            className={styles.inputMonto}
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0"
          />
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
