"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import styles from "./Lista.module.css";
import { Transaccion } from "@/types";

interface Props {
  items: Transaccion[];
  alEliminar: (id: number) => void;
  alSeleccionar: (item: Transaccion) => void;
}

export default function Lista({ items, alEliminar, alSeleccionar }: Props) {
  // Estados Filtros
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtrosTipo, setFiltrosTipo] = useState<string[]>([
    "ingreso",
    "gasto",
  ]);

  // Estados Categoría (Dropdown)
  const [menuFiltrosAbierto, setMenuFiltrosAbierto] = useState(false);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<
    string[]
  >([]);

  // Estados Orden
  const [ordenCriterio, setOrdenCriterio] = useState<
    "fecha" | "monto" | "rubro" | "nombre"
  >("fecha");
  const [ordenAsc, setOrdenAsc] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const todasLasCategorias = useMemo(() => {
    const cats = items.map((i) => i.categoria);
    return Array.from(new Set(cats)).sort();
  }, [items]);

  useEffect(() => {
    setCategoriasSeleccionadas(todasLasCategorias);
  }, [todasLasCategorias]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuFiltrosAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- MANEJADORES ---
  const toggleFiltroTipo = (tipo: string) => {
    if (filtrosTipo.includes(tipo))
      setFiltrosTipo(filtrosTipo.filter((t) => t !== tipo));
    else setFiltrosTipo([...filtrosTipo, tipo]);
  };

  const toggleTodosRubros = () => {
    if (categoriasSeleccionadas.length === todasLasCategorias.length)
      setCategoriasSeleccionadas([]);
    else setCategoriasSeleccionadas(todasLasCategorias);
  };

  const toggleRubroIndividual = (rubro: string) => {
    if (categoriasSeleccionadas.includes(rubro))
      setCategoriasSeleccionadas((prev) => prev.filter((c) => c !== rubro));
    else setCategoriasSeleccionadas((prev) => [...prev, rubro]);
  };

  const itemsProcesados = useMemo(() => {
    let resultado = items;
    // 1. Tipo
    resultado = resultado.filter((item) => filtrosTipo.includes(item.tipo));
    // 2. Texto
    if (filtroTexto.trim() !== "") {
      resultado = resultado.filter((item) =>
        item.concepto.toLowerCase().includes(filtroTexto.toLowerCase())
      );
    }
    // 3. Rubros
    resultado = resultado.filter((item) =>
      categoriasSeleccionadas.includes(item.categoria)
    );

    // Ordenar
    return [...resultado].sort((a, b) => {
      let comparacion = 0;
      switch (ordenCriterio) {
        case "fecha":
          comparacion =
            new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
          break;
        case "monto":
          comparacion = a.monto - b.monto;
          break;
        case "rubro":
          comparacion = a.categoria.localeCompare(b.categoria);
          break;
        case "nombre":
          comparacion = a.concepto.localeCompare(b.concepto);
          break;
      }
      return ordenAsc ? comparacion : comparacion * -1;
    });
  }, [
    items,
    filtrosTipo,
    filtroTexto,
    categoriasSeleccionadas,
    ordenCriterio,
    ordenAsc,
  ]);

  const estanTodosRubrosSeleccionados =
    categoriasSeleccionadas.length === todasLasCategorias.length &&
    todasLasCategorias.length > 0;

  const getFechaVisual = (fechaStr: string) => {
    const f = new Date(fechaStr);
    const userTimezoneOffset = f.getTimezoneOffset() * 60000;
    const fechaCorrecta = new Date(f.getTime() + userTimezoneOffset);
    return {
      dia: fechaCorrecta.getDate(),
      mes: fechaCorrecta.toLocaleString("es-ES", { month: "short" }),
    };
  };

  return (
    <div className={styles.listaContainer}>
      <div className={styles.header}>
        <h3>Historial</h3>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {itemsProcesados.length} encontrados
        </span>
      </div>

      <div className={styles.toolbar}>
        {/* 1. INPUT BÚSQUEDA (Toda la primera línea) */}
        <input
          type="text"
          placeholder="🔍 Buscar por nombre..."
          className={styles.inputBusqueda}
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
        />

        {/* 2. FILA DE CONTROLES (Filtros a la izquierda, Orden a la derecha) */}
        <div className={styles.controlsRow}>
          {/* MENÚ DE FILTROS */}
          <div className={styles.dropdownWrapper} ref={dropdownRef}>
            <button
              className={styles.dropdownButton}
              onClick={() => setMenuFiltrosAbierto(!menuFiltrosAbierto)}
            >
              <span>Configurar Filtros 🌪️</span>
              <span>{menuFiltrosAbierto ? "▲" : "▼"}</span>
            </button>

            {menuFiltrosAbierto && (
              <div className={styles.dropdownMenu}>
                {/* SECCIÓN TIPOS */}
                <div className={styles.dropdownSectionTitle}>
                  Tipo de Movimiento
                </div>
                <label className={styles.dropdownItem}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={filtrosTipo.includes("ingreso")}
                    onChange={() => toggleFiltroTipo("ingreso")}
                  />
                  Ingresos 💰
                </label>
                <label className={styles.dropdownItem}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={filtrosTipo.includes("gasto")}
                    onChange={() => toggleFiltroTipo("gasto")}
                  />
                  Gastos 💸
                </label>

                <div className={styles.divider}></div>

                {/* SECCIÓN RUBROS */}
                <div className={styles.dropdownSectionTitle}>Rubros</div>
                <label className={styles.dropdownItem}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={estanTodosRubrosSeleccionados}
                    onChange={toggleTodosRubros}
                  />
                  <strong>Todos los rubros</strong>
                </label>

                {todasLasCategorias.map((cat) => (
                  <label key={cat} className={styles.dropdownItem}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={categoriasSeleccionadas.includes(cat)}
                      onChange={() => toggleRubroIndividual(cat)}
                    />
                    {cat}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* ORDENAR */}
          <div className={styles.grupoOrden}>
            <select
              className={styles.selectControl}
              value={ordenCriterio}
              onChange={(e) => setOrdenCriterio(e.target.value as any)}
            >
              <option value="fecha">📅 Fecha</option>
              <option value="monto">💲 Monto</option>
              <option value="rubro">🏷️ Rubro</option>
              <option value="nombre">abc Nombre</option>
            </select>

            <button
              className={styles.btnToggle}
              onClick={() => setOrdenAsc(!ordenAsc)}
              title={ordenAsc ? "Ascendente" : "Descendente"}
            >
              {ordenAsc ? "⬆️" : "⬇️"}
            </button>
          </div>
        </div>
      </div>

      {/* LISTA DE ITEMS */}
      <div className={styles.listaItems}>
        {itemsProcesados.length > 0 ? (
          itemsProcesados.map((item) => {
            const { dia, mes } = getFechaVisual(item.fecha);
            return (
              <div key={item.id} className={styles.item}>
                <div className={styles.infoPrincipal}>
                  <div className={styles.fechaBox}>
                    <span className={styles.dia}>{dia}</span>
                    <span className={styles.mes}>{mes}</span>
                  </div>
                  <div className={styles.detalles}>
                    <h4>{item.concepto}</h4>
                    <span className={styles.categoriaBadge}>
                      {item.categoria}
                    </span>
                  </div>
                </div>
                <div className={styles.acciones}>
                  <span
                    className={`${styles.monto} ${
                      item.tipo === "ingreso" ? styles.ingreso : styles.gasto
                    }`}
                  >
                    {item.tipo === "ingreso" ? "+" : "-"}$
                    {item.monto.toLocaleString()}
                  </span>
                  <button
                    onClick={() => alSeleccionar(item)}
                    className={styles.btnIcon}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => alEliminar(item.id!)}
                    className={`${styles.btnIcon} ${styles.btnDelete}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className={styles.vacio}>No se encontraron resultados.</p>
        )}
      </div>
    </div>
  );
}
