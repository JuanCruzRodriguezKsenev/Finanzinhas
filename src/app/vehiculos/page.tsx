"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./vehiculos.module.css";
import { Vehiculo, Mantenimiento, GastoFijoConfig } from "@/types";
import VehiculoCard from "@/components/Vehiculos/VehiculosCard";
import FormDialog from "@/components/FormDialog/FormDialog";

export default function PaginaVehiculos() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);

  // Modals y Selección
  const [showAltaModal, setShowAltaModal] = useState(false);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] =
    useState<Vehiculo | null>(null);
  const [vehiculoParaEditar, setVehiculoParaEditar] = useState<Vehiculo | null>(
    null
  );

  const detalleRef = useRef<HTMLDivElement>(null);

  // --- FORMULARIOS ---
  // Datos Básicos
  const [alias, setAlias] = useState("");
  const [tipo, setTipo] = useState<Vehiculo["tipo"]>("auto");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");
  const [patente, setPatente] = useState("");
  const [valor, setValor] = useState("");
  const [moneda, setMoneda] = useState<"USD" | "ARS">("USD");

  // Mantenimiento
  const [mantFecha, setMantFecha] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [mantConcepto, setMantConcepto] = useState("");
  const [mantKm, setMantKm] = useState("");
  const [mantCosto, setMantCosto] = useState("");

  // Gastos Fijos
  const [gastoNombre, setGastoNombre] = useState("");
  const [gastoValor, setGastoValor] = useState("");

  // --- PERSISTENCIA ---
  useEffect(() => {
    const data = localStorage.getItem("finansinho-vehiculos");
    if (data) setVehiculos(JSON.parse(data));
  }, []);

  useEffect(() => {
    if (vehiculos.length > 0) {
      localStorage.setItem("finansinho-vehiculos", JSON.stringify(vehiculos));
    }
  }, [vehiculos]);

  // --- EFECTOS DE UI ---
  useEffect(() => {
    if (vehiculoParaEditar) {
      setAlias(vehiculoParaEditar.alias);
      setTipo(vehiculoParaEditar.tipo);
      setMarca(vehiculoParaEditar.marca);
      setModelo(vehiculoParaEditar.modelo);
      setAnio(vehiculoParaEditar.anio.toString());
      setPatente(vehiculoParaEditar.patente);
      setValor(vehiculoParaEditar.valorEstimado.toString());
      setMoneda(vehiculoParaEditar.moneda);
      setShowAltaModal(true);
    }
  }, [vehiculoParaEditar]);

  useEffect(() => {
    if (vehiculoSeleccionado && detalleRef.current) {
      setTimeout(() => {
        detalleRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [vehiculoSeleccionado]);

  // --- HANDLERS BASICOS ---
  const resetFormBasic = () => {
    setAlias("");
    setMarca("");
    setModelo("");
    setAnio("");
    setPatente("");
    setValor("");
    setTipo("auto");
    setMoneda("USD");
    setVehiculoParaEditar(null);
  };

  const abrirModalCrear = () => {
    setVehiculoParaEditar(null);
    resetFormBasic();
    setShowAltaModal(true);
  };

  const cerrarModalAlta = () => {
    setShowAltaModal(false);
    setTimeout(() => {
      setVehiculoParaEditar(null);
      resetFormBasic();
    }, 300);
  };

  const guardarVehiculo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!alias || !marca) return;

    if (vehiculoParaEditar) {
      const actualizado: Vehiculo = {
        ...vehiculoParaEditar,
        alias,
        tipo,
        marca,
        modelo,
        patente,
        moneda,
        anio: parseInt(anio) || new Date().getFullYear(),
        valorEstimado: parseFloat(valor) || 0,
      };
      const nuevaLista = vehiculos.map((v) =>
        v.id === actualizado.id ? actualizado : v
      );
      setVehiculos(nuevaLista);
      if (vehiculoSeleccionado?.id === actualizado.id)
        setVehiculoSeleccionado(actualizado);
    } else {
      const nuevo: Vehiculo = {
        id: Date.now(),
        alias,
        tipo,
        marca,
        modelo,
        patente,
        moneda,
        anio: parseInt(anio) || new Date().getFullYear(),
        valorEstimado: parseFloat(valor) || 0,
        gastosFijos: [],
        mantenimientos: [],
      };
      setVehiculos([...vehiculos, nuevo]);
    }
    cerrarModalAlta();
  };

  const eliminarVehiculo = (id: number) => {
    if (!confirm("¿Eliminar vehículo?")) return;
    const nuevaLista = vehiculos.filter((v) => v.id !== id);
    setVehiculos(nuevaLista);
    if (nuevaLista.length === 0)
      localStorage.removeItem("finansinho-vehiculos");
    if (vehiculoSeleccionado?.id === id) setVehiculoSeleccionado(null);
  };

  // --- HANDLERS DETALLE ---
  const actualizarSeleccionado = (actualizado: Vehiculo) => {
    setVehiculos(
      vehiculos.map((v) => (v.id === actualizado.id ? actualizado : v))
    );
    setVehiculoSeleccionado(actualizado);
  };

  const agregarMantenimiento = () => {
    if (!vehiculoSeleccionado || !mantConcepto) return;
    const nuevo: Mantenimiento = {
      id: Date.now(),
      fecha: mantFecha,
      concepto: mantConcepto,
      kilometraje: parseInt(mantKm) || 0,
      costo: parseFloat(mantCosto) || 0,
      moneda: "ARS",
    };
    // Ordenar por fecha descendente
    const lista = [...(vehiculoSeleccionado.mantenimientos || []), nuevo].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    actualizarSeleccionado({ ...vehiculoSeleccionado, mantenimientos: lista });
    setMantConcepto("");
    setMantKm("");
    setMantCosto("");
  };

  const eliminarMantenimiento = (idMant: number) => {
    if (!vehiculoSeleccionado) return;
    const lista = (vehiculoSeleccionado.mantenimientos || []).filter(
      (m) => m.id !== idMant
    );
    actualizarSeleccionado({ ...vehiculoSeleccionado, mantenimientos: lista });
  };

  const agregarGasto = () => {
    if (!vehiculoSeleccionado || !gastoNombre || !gastoValor) return;
    const nuevo: GastoFijoConfig = {
      id: Date.now(),
      nombre: gastoNombre,
      tipoCalculo: "fijo",
      valor: parseFloat(gastoValor),
    };
    actualizarSeleccionado({
      ...vehiculoSeleccionado,
      gastosFijos: [...(vehiculoSeleccionado.gastosFijos || []), nuevo],
    });
    setGastoNombre("");
    setGastoValor("");
  };

  const eliminarGasto = (idGasto: number) => {
    if (!vehiculoSeleccionado) return;
    const lista = (vehiculoSeleccionado.gastosFijos || []).filter(
      (g) => g.id !== idGasto
    );
    actualizarSeleccionado({ ...vehiculoSeleccionado, gastosFijos: lista });
  };

  const patrimonioTotalUSD = vehiculos
    .filter((v) => v.moneda === "USD")
    .reduce((acc, v) => acc + v.valorEstimado, 0);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mis Vehículos 🚘</h1>
          <p className={styles.subtitle}>
            Patrimonio Estimado:{" "}
            <b>USD {patrimonioTotalUSD.toLocaleString()}</b>
          </p>
        </div>
        <button className={styles.btnAdd} onClick={abrirModalCrear}>
          + Agregar Vehículo
        </button>
      </div>

      <div className={styles.grid}>
        {vehiculos.map((item) => (
          <VehiculoCard
            key={item.id}
            data={item}
            onDelete={eliminarVehiculo}
            onEdit={setVehiculoParaEditar}
            onSelect={(item) =>
              setVehiculoSeleccionado((prev) =>
                prev?.id === item.id ? null : item
              )
            }
            isSelected={vehiculoSeleccionado?.id === item.id}
          />
        ))}
        {vehiculos.length === 0 && (
          <p className={styles.empty}>No tienes vehículos registrados.</p>
        )}
      </div>

      {/* SECCIÓN DETALLE INLINE */}
      {vehiculoSeleccionado && (
        <div className={styles.detalleSection} ref={detalleRef}>
          <div className={styles.detalleHeader}>
            <h2 className={styles.detalleTitle}>
              {vehiculoSeleccionado.alias}
              <span
                style={{
                  fontSize: "1rem",
                  color: "var(--text-muted)",
                  fontWeight: "normal",
                }}
              >
                ({vehiculoSeleccionado.marca} {vehiculoSeleccionado.modelo})
              </span>
            </h2>
            <button
              className={styles.btnCloseDetail}
              onClick={() => setVehiculoSeleccionado(null)}
            >
              ✕
            </button>
          </div>

          <div className={styles.detalleGrid}>
            {/* 1. MANTENIMIENTO */}
            <div className={`${styles.sectionBox} ${styles.boxFullWidth}`}>
              <h4 className={styles.sectionTitle}>
                🛠️ Historial de Mantenimiento
              </h4>
              <div className={styles.listaScroll}>
                {vehiculoSeleccionado.mantenimientos?.map((m) => (
                  <div key={m.id} className={styles.itemRow}>
                    <div className={styles.colFecha}>
                      {new Date(m.fecha).toLocaleDateString()}
                    </div>
                    <div className={styles.colInfo}>
                      <strong>{m.concepto}</strong>
                      <span className={styles.subtext}>{m.kilometraje} km</span>
                    </div>
                    <div className={styles.colMonto}>
                      ${m.costo.toLocaleString()}
                    </div>
                    <button
                      onClick={() => eliminarMantenimiento(m.id)}
                      className={styles.btnIconDelete}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {(!vehiculoSeleccionado.mantenimientos ||
                  vehiculoSeleccionado.mantenimientos.length === 0) && (
                  <p className={styles.textMuted}>
                    Sin registros de mantenimiento.
                  </p>
                )}
              </div>

              <div
                className={styles.formMini}
                style={{ flexDirection: "row", marginTop: "1rem" }}
              >
                <input
                  type="date"
                  className={styles.inputSmall}
                  value={mantFecha}
                  onChange={(e) => setMantFecha(e.target.value)}
                />
                <input
                  className={styles.inputSmall}
                  placeholder="Service 10k..."
                  value={mantConcepto}
                  onChange={(e) => setMantConcepto(e.target.value)}
                  style={{ flex: 2 }}
                />
                <input
                  className={styles.inputSmall}
                  type="number"
                  placeholder="Kms"
                  value={mantKm}
                  onChange={(e) => setMantKm(e.target.value)}
                />
                <input
                  className={styles.inputSmall}
                  type="number"
                  placeholder="$ Costo"
                  value={mantCosto}
                  onChange={(e) => setMantCosto(e.target.value)}
                />
                <button
                  onClick={agregarMantenimiento}
                  className={styles.btnActionSmall}
                >
                  +
                </button>
              </div>
            </div>

            {/* 2. GASTOS FIJOS (Seguro/Patente) */}
            <div className={styles.sectionBox}>
              <h4 className={styles.sectionTitle}>
                💸 Gastos Fijos (Seguro/Patente)
              </h4>
              <div className={styles.listaSimple}>
                {vehiculoSeleccionado.gastosFijos?.map((g) => (
                  <div key={g.id} className={styles.itemSimple}>
                    <span>{g.nombre}</span>
                    <strong>${g.valor.toLocaleString()}</strong>
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
                    placeholder="Concepto (Ej: Seguro)"
                    value={gastoNombre}
                    onChange={(e) => setGastoNombre(e.target.value)}
                  />
                  <input
                    className={styles.inputSmall}
                    type="number"
                    placeholder="$ Valor"
                    value={gastoValor}
                    onChange={(e) => setGastoValor(e.target.value)}
                  />
                </div>
                <button
                  onClick={agregarGasto}
                  className={styles.btnActionSmall}
                >
                  Agregar
                </button>
              </div>
            </div>

            {/* 3. INFO EXTRA (Resumen) */}
            <div className={styles.sectionBox}>
              <h4 className={styles.sectionTitle}>ℹ️ Resumen</h4>
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <span>Año</span>
                  <strong>{vehiculoSeleccionado.anio}</strong>
                </div>
                <div className={styles.infoCard}>
                  <span>Patente</span>
                  <strong style={{ fontFamily: "monospace" }}>
                    {vehiculoSeleccionado.patente || "---"}
                  </strong>
                </div>
                <div className={styles.infoCard}>
                  <span>Gastos Totales</span>
                  <strong>
                    $
                    {(
                      vehiculoSeleccionado.mantenimientos?.reduce(
                        (acc, m) => acc + m.costo,
                        0
                      ) || 0
                    ).toLocaleString()}
                  </strong>
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
        title={vehiculoParaEditar ? "Editar Vehículo" : "Nuevo Vehículo"}
      >
        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>Alias</label>
              <input
                className={styles.input}
                placeholder="Ej: El Golcito"
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
                <option value="auto">Auto</option>
                <option value="moto">Moto</option>
                <option value="camioneta">Camioneta</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>Marca</label>
              <input
                className={styles.input}
                placeholder="Volkswagen"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
              />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Modelo</label>
              <input
                className={styles.input}
                placeholder="Gol Trend"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>Año</label>
              <input
                type="number"
                className={styles.input}
                placeholder="2018"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Patente</label>
              <input
                className={styles.input}
                placeholder="AB 123 CD"
                value={patente}
                onChange={(e) => setPatente(e.target.value)}
              />
            </div>
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
              <label className={styles.label}>Valor Estimado</label>
              <input
                type="number"
                className={styles.input}
                placeholder="0"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
          </div>
          <button className={styles.btnSave} onClick={guardarVehiculo}>
            {vehiculoParaEditar ? "Guardar Cambios" : "Crear Vehículo"}
          </button>
        </div>
      </FormDialog>
    </main>
  );
}
