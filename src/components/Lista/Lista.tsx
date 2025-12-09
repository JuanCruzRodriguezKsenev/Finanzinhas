"use client";
import { useState } from "react";
import styles from "./Lista.module.css";
import { Transaccion } from "@/types";

interface Props {
  items: Transaccion[];
  alEliminar: (id: number) => void;
  alSeleccionar: (t: Transaccion) => void; // 👈 Nuevo: Función al hacer click en el lápiz
}

type CriterioOrden = "fecha" | "monto" | "categoria" | "concepto";

export default function Lista({ items, alEliminar, alSeleccionar }: Props) {
  const [criterio, setCriterio] = useState<CriterioOrden>("fecha");
  const [ascendente, setAscendente] = useState(true);

  const itemsOrdenados = [...items].sort((a, b) => {
    let comparacion = 0;
    if (criterio === "monto") comparacion = a.monto - b.monto;
    else if (criterio === "fecha")
      comparacion = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    else if (criterio === "categoria")
      comparacion = a.categoria.localeCompare(b.categoria);
    else if (criterio === "concepto")
      comparacion = a.concepto.localeCompare(b.concepto);
    return ascendente ? comparacion : comparacion * -1;
  });

  return (
    <div className={styles.tarjetaLista}>
      <div className={styles.headerLista}>
        <h3>Historial</h3>
        <div className={styles.barraHerramientas}>
          <div className={styles.filtros}>
            <button
              onClick={() => setCriterio("fecha")}
              className={
                criterio === "fecha" ? styles.filtroActivo : styles.filtro
              }
            >
              📅
            </button>
            <button
              onClick={() => setCriterio("categoria")}
              className={
                criterio === "categoria" ? styles.filtroActivo : styles.filtro
              }
            >
              🏷️
            </button>
            <button
              onClick={() => setCriterio("monto")}
              className={
                criterio === "monto" ? styles.filtroActivo : styles.filtro
              }
            >
              💲
            </button>
          </div>
          <button
            onClick={() => setAscendente(!ascendente)}
            className={styles.botonOrden}
          >
            {ascendente ? "⬇" : "⬆"}
          </button>
        </div>
      </div>

      <ul className={styles.listaItems}>
        {itemsOrdenados.map((item) => (
          <li key={item.id} className={styles.item}>
            <div className={styles.fechaCaja}>
              <span>{item.fecha.split("-")[2]}</span>
              <small>
                {
                  [
                    "Ene",
                    "Feb",
                    "Mar",
                    "Abr",
                    "May",
                    "Jun",
                    "Jul",
                    "Ago",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dic",
                  ][parseInt(item.fecha.split("-")[1]) - 1]
                }
              </small>
            </div>
            <div className={styles.detalles}>
              <span className={styles.concepto}>{item.concepto}</span>
              <span className={styles.categoriaTag}>{item.categoria}</span>
            </div>
            <div className={styles.acciones}>
              <span
                className={`${styles.precio} ${
                  item.tipo === "ingreso"
                    ? styles.precioPositivo
                    : styles.precioNegativo
                }`}
              >
                {item.tipo === "ingreso" ? "+" : "-"}${item.monto}
              </span>

              {/* 👈 NUEVO: Botón Editar */}
              <button
                onClick={() => alSeleccionar(item)}
                className={styles.botonEditar}
                title="Editar"
              >
                ✏️
              </button>

              <button
                onClick={() => alEliminar(item.id)}
                className={styles.botonEliminar}
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
