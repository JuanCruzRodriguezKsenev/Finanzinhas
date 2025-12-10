"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import styles from "./inmuebles.module.css";
import { Inmueble, ContratoAlquiler, GastoFijoConfig, Tasacion } from "@/types";
import PropiedadCard from "@/components/Inmuebles/PropiedadCard";
import FormDialog from "@/components/FormDialog/FormDialog";

export default function PaginaInmuebles() {
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);

  // Modals y Selección
  const [showAltaModal, setShowAltaModal] = useState(false);
  const [inmuebleSeleccionado, setInmuebleSeleccionado] =
    useState<Inmueble | null>(null);
  const [inmuebleParaEditar, setInmuebleParaEditar] = useState<Inmueble | null>(
    null
  );

  const detalleRef = useRef<HTMLDivElement>(null);

  // Form Alta Básica
  const [alias, setAlias] = useState("");
  const [direccion, setDireccion] = useState("");
  const [tipo, setTipo] = useState<Inmueble["tipo"]>("departamento");
  const [valor, setValor] = useState("");
  const [moneda, setMoneda] = useState<"USD" | "ARS">("USD");
  const [fecha, setFecha] = useState("");

  // Form Alquiler
  const [nuevoInquilino, setNuevoInquilino] = useState("");
  const [inicioAlquiler, setInicioAlquiler] = useState("");
  const [finAlquiler, setFinAlquiler] = useState("");
  const [montoAlquiler, setMontoAlquiler] = useState("");

  // Form Gastos
  const [nuevoGastoNombre, setNuevoGastoNombre] = useState("");
  const [nuevoGastoTipo, setNuevoGastoTipo] = useState<"fijo" | "porcentaje">(
    "fijo"
  );
  const [nuevoGastoValor, setNuevoGastoValor] = useState("");

  // Form Tasación
  const [nuevaTasacionValor, setNuevaTasacionValor] = useState("");
  const [nuevaTasacionFecha, setNuevaTasacionFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  // 1. CARGA
  useEffect(() => {
    const data = localStorage.getItem("finansinho-inmuebles");
    if (data) setInmuebles(JSON.parse(data));
  }, []);

  // 2. GUARDADO
  useEffect(() => {
    if (inmuebles.length > 0) {
      localStorage.setItem("finansinho-inmuebles", JSON.stringify(inmuebles));
    }
  }, [inmuebles]);

  // 3. EFECTO: CARGAR DATOS AL EDITAR (Automático)
  useEffect(() => {
    if (inmuebleParaEditar) {
      setAlias(inmuebleParaEditar.alias);
      setDireccion(inmuebleParaEditar.direccion);
      setTipo(inmuebleParaEditar.tipo);
      setValor(inmuebleParaEditar.valorCompra.toString());
      setMoneda(inmuebleParaEditar.moneda);
      setFecha(inmuebleParaEditar.fechaAdquisicion);
      setShowAltaModal(true);
    }
  }, [inmuebleParaEditar]);

  // 4. SCROLL AL DETALLE
  useEffect(() => {
    if (inmuebleSeleccionado && detalleRef.current) {
      setTimeout(() => {
        detalleRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [inmuebleSeleccionado]);

  const datosEvolucion = useMemo(() => {
    if (!inmuebleSeleccionado) return [];
    const puntos = [
      {
        fecha: inmuebleSeleccionado.fechaAdquisicion,
        valor: inmuebleSeleccionado.valorCompra,
        tipo: "Compra",
      },
    ];
    if (inmuebleSeleccionado.tasaciones) {
      inmuebleSeleccionado.tasaciones.forEach((t) => {
        puntos.push({ fecha: t.fecha, valor: t.valor, tipo: "Tasación" });
      });
    }
    return puntos.sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
  }, [inmuebleSeleccionado]);

  // --- HANDLERS ---
  const resetFormBasic = () => {
    setAlias("");
    setDireccion("");
    setValor("");
    setFecha("");
    setTipo("departamento");
    setMoneda("USD");
    setInmuebleParaEditar(null);
  };

  const abrirModalCrear = () => {
    setInmuebleParaEditar(null);
    resetFormBasic();
    setShowAltaModal(true);
  };

  const cerrarModalAlta = () => {
    setShowAltaModal(false);
    setTimeout(() => {
      setInmuebleParaEditar(null);
      resetFormBasic();
    }, 300);
  };

  const guardarInmueble = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!alias || !valor) return;

    if (inmuebleParaEditar) {
      const actualizado: Inmueble = {
        ...inmuebleParaEditar,
        alias,
        direccion,
        tipo,
        moneda,
        fechaAdquisicion: fecha,
        valorCompra: parseFloat(valor),
      };
      const nuevaLista = inmuebles.map((i) =>
        i.id === actualizado.id ? actualizado : i
      );
      setInmuebles(nuevaLista);
      // Si justo estamos viendo el detalle de este, actualizamos también la vista
      if (inmuebleSeleccionado?.id === actualizado.id)
        setInmuebleSeleccionado(actualizado);
    } else {
      const nuevo: Inmueble = {
        id: Date.now(),
        alias,
        direccion,
        tipo,
        fechaAdquisicion: fecha || new Date().toISOString().split("T")[0],
        valorCompra: parseFloat(valor),
        moneda,
        datosAlquiler: null,
        gastosFijos: [],
        tasaciones: [],
      };
      setInmuebles([...inmuebles, nuevo]);
    }
    cerrarModalAlta();
  };

  const eliminarInmueble = (id: number) => {
    if (!confirm("¿Eliminar propiedad?")) return;
    const nuevaLista = inmuebles.filter((i) => i.id !== id);
    setInmuebles(nuevaLista);
    if (nuevaLista.length === 0)
      localStorage.removeItem("finansinho-inmuebles");
    if (inmuebleSeleccionado?.id === id) setInmuebleSeleccionado(null);
  };

  // --- ACTUALIZADORES ---
  const actualizarSeleccionado = (actualizado: Inmueble) => {
    setInmuebles(
      inmuebles.map((i) => (i.id === actualizado.id ? actualizado : i))
    );
    setInmuebleSeleccionado(actualizado);
  };

  const registrarAlquiler = () => {
    if (!inmuebleSeleccionado || !nuevoInquilino || !montoAlquiler) return;
    const contrato: ContratoAlquiler = {
      inquilino: nuevoInquilino,
      inicio: inicioAlquiler,
      fin: finAlquiler,
      monto: parseFloat(montoAlquiler),
      moneda: "ARS",
    };
    actualizarSeleccionado({
      ...inmuebleSeleccionado,
      datosAlquiler: contrato,
    });
    setNuevoInquilino("");
    setMontoAlquiler("");
  };

  const finalizarContrato = () => {
    if (!inmuebleSeleccionado) return;
    actualizarSeleccionado({ ...inmuebleSeleccionado, datosAlquiler: null });
  };

  const agregarGasto = () => {
    if (!inmuebleSeleccionado || !nuevoGastoNombre || !nuevoGastoValor) return;
    const nuevoGasto: GastoFijoConfig = {
      id: Date.now(),
      nombre: nuevoGastoNombre,
      tipoCalculo: nuevoGastoTipo,
      valor: parseFloat(nuevoGastoValor),
    };
    actualizarSeleccionado({
      ...inmuebleSeleccionado,
      gastosFijos: [...(inmuebleSeleccionado.gastosFijos || []), nuevoGasto],
    });
    setNuevoGastoNombre("");
    setNuevoGastoValor("");
  };

  const eliminarGasto = (idGasto: number) => {
    if (!inmuebleSeleccionado) return;
    actualizarSeleccionado({
      ...inmuebleSeleccionado,
      gastosFijos: (inmuebleSeleccionado.gastosFijos || []).filter(
        (g) => g.id !== idGasto
      ),
    });
  };

  const agregarTasacion = () => {
    if (!inmuebleSeleccionado || !nuevaTasacionValor) return;
    const nueva: Tasacion = {
      id: Date.now(),
      fecha: nuevaTasacionFecha,
      valor: parseFloat(nuevaTasacionValor),
      moneda: inmuebleSeleccionado.moneda,
    };
    const lista = [...(inmuebleSeleccionado.tasaciones || []), nueva];
    lista.sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
    actualizarSeleccionado({ ...inmuebleSeleccionado, tasaciones: lista });
    setNuevaTasacionValor("");
  };

  const eliminarTasacion = (idTasacion: number) => {
    if (!inmuebleSeleccionado) return;
    const lista = (inmuebleSeleccionado.tasaciones || []).filter(
      (t) => t.id !== idTasacion
    );
    actualizarSeleccionado({ ...inmuebleSeleccionado, tasaciones: lista });
  };

  const formatMoney = (val: number) => `$${val.toLocaleString()}`;
  const patrimonioTotalUSD = inmuebles
    .filter((i) => i.moneda === "USD")
    .reduce((acc, i) => acc + i.valorCompra, 0);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mis Propiedades 🏠</h1>
          <p className={styles.subtitle}>
            Patrimonio en USD: <b>{formatMoney(patrimonioTotalUSD)}</b>
          </p>
        </div>
        <button className={styles.btnAdd} onClick={abrirModalCrear}>
          + Agregar Propiedad
        </button>
      </div>

      <div className={styles.grid}>
        {inmuebles.map((item) => (
          <PropiedadCard
            key={item.id}
            data={item}
            onDelete={eliminarInmueble}
            // 👇 CORRECCIÓN: Usamos el set state directamente, el useEffect hace el resto
            onEdit={setInmuebleParaEditar}
            onSelect={(item) => {
              setInmuebleSeleccionado((prev) =>
                prev?.id === item.id ? null : item
              );
            }}
            isSelected={inmuebleSeleccionado?.id === item.id}
          />
        ))}
        {inmuebles.length === 0 && (
          <p className={styles.empty}>No tienes propiedades registradas.</p>
        )}
      </div>

      {/* SECCIÓN DETALLE (INLINE) */}
      {inmuebleSeleccionado && (
        <div className={styles.detalleSection} ref={detalleRef}>
          <div className={styles.detalleHeader}>
            <h2 className={styles.detalleTitle}>
              {inmuebleSeleccionado.alias}
              <span
                style={{
                  fontSize: "1rem",
                  color: "var(--text-muted)",
                  fontWeight: "normal",
                }}
              >
                ({inmuebleSeleccionado.direccion})
              </span>
            </h2>
            <button
              className={styles.btnCloseDetail}
              onClick={() => setInmuebleSeleccionado(null)}
            >
              ✕
            </button>
          </div>

          <div className={styles.detalleGrid}>
            {/* 1. GRÁFICO */}
            <div className={`${styles.sectionBox} ${styles.boxFullWidth}`}>
              <h4 className={styles.sectionTitle}>
                📈 Evolución del Valor ({inmuebleSeleccionado.moneda})
              </h4>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart
                    data={datosEvolucion}
                    margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorValor"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--accent)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--accent)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="fecha"
                      tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={30}
                    />
                    <YAxis hide domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "var(--text-main)" }}
                      formatter={(val: number) => formatMoney(val)}
                    />
                    <Area
                      type="monotone"
                      dataKey="valor"
                      stroke="var(--accent)"
                      fillOpacity={1}
                      fill="url(#colorValor)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Lista Tasaciones */}
              <div className={styles.tasacionesList}>
                {inmuebleSeleccionado.tasaciones?.map((t) => (
                  <div key={t.id} className={styles.itemTasacion}>
                    <span>{new Date(t.fecha).toLocaleDateString()}</span>
                    <strong>{formatMoney(t.valor)}</strong>
                    <button
                      onClick={() => eliminarTasacion(t.id)}
                      className={styles.btnIconDelete}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div
                className={styles.formMini}
                style={{ flexDirection: "row", marginTop: "10px" }}
              >
                <input
                  type="date"
                  className={styles.inputSmall}
                  value={nuevaTasacionFecha}
                  onChange={(e) => setNuevaTasacionFecha(e.target.value)}
                />
                <input
                  className={styles.inputSmall}
                  type="number"
                  placeholder="Nuevo Valor"
                  value={nuevaTasacionValor}
                  onChange={(e) => setNuevaTasacionValor(e.target.value)}
                />
                <button
                  onClick={agregarTasacion}
                  className={styles.btnActionSmall}
                >
                  +
                </button>
              </div>
            </div>

            {/* 2. ALQUILER */}
            <div className={styles.sectionBox}>
              <h4 className={styles.sectionTitle}>🔑 Alquiler</h4>
              {inmuebleSeleccionado.datosAlquiler ? (
                <div className={styles.infoAlquiler}>
                  <p>
                    <strong>Inquilino:</strong>{" "}
                    {inmuebleSeleccionado.datosAlquiler.inquilino}
                  </p>
                  <p>
                    <strong>Vence:</strong>{" "}
                    {inmuebleSeleccionado.datosAlquiler.fin}
                  </p>
                  <p>
                    <strong>Monto:</strong>{" "}
                    {formatMoney(inmuebleSeleccionado.datosAlquiler.monto)}
                  </p>
                  <button
                    onClick={finalizarContrato}
                    className={styles.btnDangerOutline}
                  >
                    Finalizar
                  </button>
                </div>
              ) : (
                <div className={styles.formMini}>
                  <p className={styles.textMuted}>Propiedad vacía.</p>
                  <input
                    className={styles.inputSmall}
                    placeholder="Inquilino"
                    value={nuevoInquilino}
                    onChange={(e) => setNuevoInquilino(e.target.value)}
                  />
                  <div className={styles.row}>
                    <input
                      type="date"
                      className={styles.inputSmall}
                      value={inicioAlquiler}
                      onChange={(e) => setInicioAlquiler(e.target.value)}
                    />
                    <input
                      type="date"
                      className={styles.inputSmall}
                      value={finAlquiler}
                      onChange={(e) => setFinAlquiler(e.target.value)}
                    />
                  </div>
                  <div className={styles.row}>
                    <input
                      className={styles.inputSmall}
                      type="number"
                      placeholder="$ Mensual"
                      value={montoAlquiler}
                      onChange={(e) => setMontoAlquiler(e.target.value)}
                    />
                    <button
                      onClick={registrarAlquiler}
                      className={styles.btnActionSmall}
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. GASTOS */}
            <div className={styles.sectionBox}>
              <h4 className={styles.sectionTitle}>💸 Gastos Fijos</h4>
              <div className={styles.listaGastos}>
                {inmuebleSeleccionado.gastosFijos?.map((g) => (
                  <div key={g.id} className={styles.itemGasto}>
                    <span>{g.nombre}</span>
                    <span>
                      {g.tipoCalculo === "fijo"
                        ? formatMoney(g.valor)
                        : `${g.valor}%`}
                    </span>
                    <button
                      onClick={() => eliminarGasto(g.id)}
                      className={styles.btnIconDelete}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className={styles.formMini}>
                <div className={styles.row}>
                  <input
                    className={styles.inputSmall}
                    placeholder="Concepto"
                    value={nuevoGastoNombre}
                    onChange={(e) => setNuevoGastoNombre(e.target.value)}
                  />
                  <select
                    className={styles.inputSmall}
                    value={nuevoGastoTipo}
                    onChange={(e) => setNuevoGastoTipo(e.target.value as any)}
                  >
                    <option value="fijo">$</option>
                    <option value="porcentaje">%</option>
                  </select>
                </div>
                <div className={styles.row}>
                  <input
                    className={styles.inputSmall}
                    type="number"
                    placeholder="Valor"
                    value={nuevoGastoValor}
                    onChange={(e) => setNuevoGastoValor(e.target.value)}
                  />
                  <button
                    onClick={agregarGasto}
                    className={styles.btnActionSmall}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ALTA/EDICIÓN */}
      <FormDialog
        open={showAltaModal}
        onClose={cerrarModalAlta}
        title={inmuebleParaEditar ? "Editar Propiedad" : "Nueva Propiedad"}
      >
        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>Alias</label>
              <input
                className={styles.input}
                placeholder="Ej: Depto Centro"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Tipo</label>
              <select
                className={styles.input}
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
              >
                <option value="departamento">Departamento</option>
                <option value="casa">Casa</option>
                <option value="terreno">Terreno</option>
                <option value="local">Local</option>
                <option value="cochera">Cochera</option>
              </select>
            </div>
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Dirección</label>
            <input
              className={styles.input}
              placeholder="Dirección"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>
          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>Moneda</label>
              <select
                className={styles.input}
                value={moneda}
                onChange={(e) => setMoneda(e.target.value as any)}
              >
                <option>USD</option>
                <option>ARS</option>
              </select>
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Valor Compra</label>
              <input
                type="number"
                className={styles.input}
                placeholder="0"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Fecha Adquisición</label>
            <input
              type="date"
              className={styles.input}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          <button className={styles.btnSave} onClick={guardarInmueble}>
            {inmuebleParaEditar ? "Guardar" : "Crear"}
          </button>
        </div>
      </FormDialog>
    </main>
  );
}
