"use client";
import { useState, useEffect } from "react"; // 👈 Importamos useEffect
import styles from "./Formulario.module.css";
import { Transaccion } from "@/types";

const CATEGORIAS_GASTOS = [
  "Comida",
  "Transporte",
  "Casa",
  "Ocio",
  "Salud",
  "Varios",
];
const CATEGORIAS_INGRESOS = [
  "Sueldo",
  "Ventas",
  "Regalo",
  "Inversiones",
  "Otros",
];

interface Props {
  alAgregar: (t: Transaccion) => void;
  alEditar: (t: Transaccion) => void; // 👈 Nuevo: Función para guardar edición
  itemEditar: Transaccion | null; // 👈 Nuevo: El item que estamos editando (o null)
  alCancelar: () => void; // 👈 Nuevo: Función para cancelar
}

export default function Formulario({
  alAgregar,
  alEditar,
  itemEditar,
  alCancelar,
}: Props) {
  // Estados del formulario
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [tipo, setTipo] = useState<"ingreso" | "gasto">("gasto");
  const [categoria, setCategoria] = useState(CATEGORIAS_GASTOS[0]);

  // 👈 EFECTO MÁGICO: Cuando 'itemEditar' cambia (nos mandan algo), rellenamos el formulario
  useEffect(() => {
    if (itemEditar) {
      setConcepto(itemEditar.concepto);
      setMonto(itemEditar.monto.toString());
      setFecha(itemEditar.fecha);
      setTipo(itemEditar.tipo);
      setCategoria(itemEditar.categoria);
    } else {
      // Si no hay nada para editar (o cancelamos), limpiamos
      limpiarFormulario();
    }
  }, [itemEditar]);

  const limpiarFormulario = () => {
    setConcepto("");
    setMonto("");
    setFecha(new Date().toISOString().split("T")[0]);
    setCategoria(
      tipo === "gasto" ? CATEGORIAS_GASTOS[0] : CATEGORIAS_INGRESOS[0]
    );
  };

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concepto || !monto || !fecha) return;

    // Construimos el objeto
    const transaccion: Transaccion = {
      id: itemEditar ? itemEditar.id : Date.now(), // Si editamos, mantenemos el ID viejo. Si es nuevo, ID nuevo.
      fecha,
      concepto,
      monto: Number(monto),
      categoria,
      tipo,
    };

    if (itemEditar) {
      alEditar(transaccion); // Guardamos cambios
    } else {
      alAgregar(transaccion); // Creamos nuevo
    }

    // La limpieza se hace automática por el useEffect al poner itemEditar en null desde el padre,
    // pero por seguridad limpiamos aquí también si es nuevo.
    if (!itemEditar) limpiarFormulario();
  };

  return (
    <div className={styles.tarjetaFormulario}>
      <h3>{itemEditar ? "Editar Movimiento" : "Nuevo Movimiento"}</h3>

      {/* Selector Tipo */}
      <div className={styles.selectorTipo}>
        <button
          type="button"
          onClick={() => {
            setTipo("gasto");
            setCategoria(CATEGORIAS_GASTOS[0]);
          }}
          className={`${styles.botonTipo} ${
            tipo === "gasto" ? styles.activoGasto : ""
          }`}
        >
          Gasto 📉
        </button>
        <button
          type="button"
          onClick={() => {
            setTipo("ingreso");
            setCategoria(CATEGORIAS_INGRESOS[0]);
          }}
          className={`${styles.botonTipo} ${
            tipo === "ingreso" ? styles.activoIngreso : ""
          }`}
        >
          Ingreso 📈
        </button>
      </div>

      <form onSubmit={manejarEnvio} className={styles.form}>
        <div className={styles.campo}>
          <label>Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.campo}>
          <label>Concepto</label>
          <input
            type="text"
            placeholder={tipo === "ingreso" ? "Ej. Sueldo" : "Ej. Café"}
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.filaDoble}>
          <div className={styles.campo}>
            <label>Rubro</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className={styles.select}
            >
              {(tipo === "ingreso"
                ? CATEGORIAS_INGRESOS
                : CATEGORIAS_GASTOS
              ).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.campo}>
            <label>Monto</label>
            <input
              type="number"
              placeholder="$0"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.botonesAccion}>
          {itemEditar && (
            <button
              type="button"
              onClick={alCancelar}
              className={styles.botonCancelar}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className={`${styles.boton} ${
              tipo === "ingreso" ? styles.botonIngreso : ""
            }`}
          >
            {itemEditar
              ? "Guardar Cambios"
              : tipo === "ingreso"
              ? "Registrar Ingreso"
              : "Registrar Gasto"}
          </button>
        </div>
      </form>
    </div>
  );
}
