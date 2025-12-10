"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link"; // Para redirigir a tarjetas
import styles from "./pasivos.module.css";
import { Deuda, Impuesto, Tarjeta, Transaccion } from "@/types";
import FormDialog from "@/components/FormDialog/FormDialog";

export default function PaginaPasivos() {
  const [tab, setTab] = useState<"deudas" | "impuestos">("deudas");

  // Datos Manuales
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [impuestos, setImpuestos] = useState<Impuesto[]>([]);

  // Datos Automáticos (Sincronización)
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);

  // Modal
  const [showModal, setShowModal] = useState(false);

  // States Deuda Manual
  const [dNombre, setDNombre] = useState("");
  const [dAcreedor, setDAcreedor] = useState("");
  const [dTotal, setDTotal] = useState("");
  const [dRestante, setDRestante] = useState("");
  const [dCuota, setDCuota] = useState("");

  // States Impuesto
  const [iConcepto, setIConcepto] = useState("");
  const [iMonto, setIMonto] = useState("");
  const [iVenc, setIVenc] = useState("");
  const [iTipo, setITipo] = useState<Impuesto["tipo"]>("nacional");

  // CARGA DE DATOS (Todo)
  useEffect(() => {
    setDeudas(JSON.parse(localStorage.getItem("finansinho-deudas") || "[]"));
    setImpuestos(
      JSON.parse(localStorage.getItem("finansinho-impuestos") || "[]")
    );
    setTarjetas(
      JSON.parse(localStorage.getItem("finansinho-tarjetas") || "[]")
    );
    setTransacciones(
      JSON.parse(localStorage.getItem("finansinho-datos") || "[]")
    );
  }, []);

  // --- CÁLCULO DEUDA TARJETAS ---
  const tarjetasConDeuda = useMemo(() => {
    return tarjetas
      .filter((t) => t.tipo === "credito")
      .map((t) => {
        const consumo = transacciones
          .filter((x) => x.metodoPago === t.alias && x.tipo === "gasto")
          .reduce((acc, x) => acc + x.monto, 0);
        return { ...t, consumoActual: consumo };
      })
      .filter((t) => t.consumoActual > 0); // Solo mostramos si deben algo
  }, [tarjetas, transacciones]);

  // --- LOGICA DEUDAS MANUALES ---
  const guardarDeuda = () => {
    if (!dNombre || !dTotal) return;
    const nueva: Deuda = {
      id: Date.now(),
      nombre: dNombre,
      acreedor: dAcreedor,
      moneda: "ARS",
      montoTotal: parseFloat(dTotal),
      montoRestante: parseFloat(dRestante) || parseFloat(dTotal),
      cuotasRestantes: 0,
      valorCuota: parseFloat(dCuota),
      vencimiento: "10",
    };
    const lista = [...deudas, nueva];
    setDeudas(lista);
    localStorage.setItem("finansinho-deudas", JSON.stringify(lista));
    setShowModal(false);
    resetForms();
  };

  const eliminarDeuda = (id: number) => {
    if (!confirm("¿Saldar deuda manual?")) return;
    const lista = deudas.filter((d) => d.id !== id);
    setDeudas(lista);
    localStorage.setItem("finansinho-deudas", JSON.stringify(lista));
  };

  // --- LOGICA IMPUESTOS ---
  const guardarImpuesto = () => {
    if (!iConcepto || !iMonto) return;
    const nuevo: Impuesto = {
      id: Date.now(),
      concepto: iConcepto,
      montoMensual: parseFloat(iMonto),
      vencimientoDia: parseInt(iVenc) || 20,
      tipo: iTipo,
      fijo: true,
    };
    const lista = [...impuestos, nuevo];
    setImpuestos(lista);
    localStorage.setItem("finansinho-impuestos", JSON.stringify(lista));
    setShowModal(false);
    resetForms();
  };

  const eliminarImpuesto = (id: number) => {
    const lista = impuestos.filter((i) => i.id !== id);
    setImpuestos(lista);
    localStorage.setItem("finansinho-impuestos", JSON.stringify(lista));
  };

  const resetForms = () => {
    setDNombre("");
    setDAcreedor("");
    setDTotal("");
    setDRestante("");
    setDCuota("");
    setIConcepto("");
    setIMonto("");
    setIVenc("");
  };

  // --- TOTALES ---
  const totalDeudaManual = deudas.reduce((acc, d) => acc + d.montoRestante, 0);
  const totalDeudaTarjetas = tarjetasConDeuda.reduce(
    (acc, t) => acc + t.consumoActual,
    0
  );

  const granTotalPasivos = totalDeudaManual + totalDeudaTarjetas;
  const totalFiscalMensual = impuestos.reduce(
    (acc, i) => acc + i.montoMensual,
    0
  );

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mis Obligaciones 📉</h1>
          {tab === "deudas" ? (
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <p className={styles.subtitle}>
                Total Pasivos:{" "}
                <b className={styles.danger}>
                  $ {granTotalPasivos.toLocaleString()}
                </b>
              </p>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                (Manual: ${totalDeudaManual.toLocaleString()} + Tarjetas: $
                {totalDeudaTarjetas.toLocaleString()})
              </span>
            </div>
          ) : (
            <p className={styles.subtitle}>
              Carga Fiscal Mensual:{" "}
              <b className={styles.warning}>
                $ {totalFiscalMensual.toLocaleString()}
              </b>
            </p>
          )}
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === "deudas" && styles.active}`}
            onClick={() => setTab("deudas")}
          >
            💸 Deudas
          </button>
          <button
            className={`${styles.tab} ${tab === "impuestos" && styles.active}`}
            onClick={() => setTab("impuestos")}
          >
            🏛️ Impuestos
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <button className={styles.btnAdd} onClick={() => setShowModal(true)}>
          {tab === "deudas" ? "+ Deuda Manual" : "+ Nuevo Impuesto"}
        </button>

        {/* TAB DEUDAS (AUTOMÁTICAS + MANUALES) */}
        {tab === "deudas" && (
          <div className={styles.grid}>
            {/* 1. TARJETAS (Automáticas) */}
            {tarjetasConDeuda.map((t) => (
              <Link
                href="/tarjetas"
                key={t.id}
                className={`${styles.deudaCard} ${styles.cardAuto}`}
              >
                <div className={styles.cardHeader}>
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    💳 {t.alias}
                  </h3>
                  <span className={styles.badgeAuto}>AUTOMÁTICO</span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.row}>
                    <span>Consumo Actual</span>
                    <strong>${t.consumoActual.toLocaleString()}</strong>
                  </div>
                  <div className={styles.row}>
                    <span>Cierre</span>
                    <span>Día {t.diaCierre}</span>
                  </div>
                  <div className={styles.progressBg}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${Math.min(
                          (t.consumoActual / t.limite) * 100,
                          100
                        )}%`,
                        background: "var(--accent)",
                      }}
                    ></div>
                  </div>
                  <small>Límite: ${t.limite.toLocaleString()}</small>
                </div>
                <div className={styles.note}>
                  Gestionar en sección Tarjetas →
                </div>
              </Link>
            ))}

            {/* 2. DEUDAS MANUALES */}
            {deudas.map((d) => (
              <div key={d.id} className={styles.deudaCard}>
                <div className={styles.cardHeader}>
                  <h3>{d.nombre}</h3>
                  <span className={styles.badge}>{d.acreedor}</span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.row}>
                    <span>Falta Pagar</span>{" "}
                    <strong>${d.montoRestante.toLocaleString()}</strong>
                  </div>
                  <div className={styles.row}>
                    <span>Cuota</span>{" "}
                    <strong>${d.valorCuota.toLocaleString()}</strong>
                  </div>
                  <div className={styles.progressBg}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${Math.max(
                          0,
                          100 - (d.montoRestante / d.montoTotal) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <small>
                    {Math.round(100 - (d.montoRestante / d.montoTotal) * 100)}%
                    Pagado
                  </small>
                </div>
                <button
                  className={styles.btnAction}
                  onClick={() => eliminarDeuda(d.id)}
                >
                  Saldar
                </button>
              </div>
            ))}

            {deudas.length === 0 && tarjetasConDeuda.length === 0 && (
              <p className={styles.empty}>Sin deudas registradas.</p>
            )}
          </div>
        )}

        {/* TAB IMPUESTOS (Igual que antes) */}
        {tab === "impuestos" && (
          <div className={styles.grid}>
            {impuestos.map((i) => (
              <div key={i.id} className={styles.cardImpuesto}>
                <div className={styles.impuestoLeft}>
                  <div className={styles.iconImpuesto}>🏛️</div>
                  <div>
                    <h3 className={styles.impuestoTitle}>{i.concepto}</h3>
                    <span className={styles.impuestoSub}>
                      Vence el día {i.vencimientoDia} • {i.tipo.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className={styles.impuestoRight}>
                  <strong className={styles.impuestoMonto}>
                    ${i.montoMensual.toLocaleString()}
                  </strong>
                  <button
                    className={styles.btnIconDelete}
                    onClick={() => eliminarImpuesto(i.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {impuestos.length === 0 && (
              <p className={styles.empty}>No has cargado impuestos.</p>
            )}
          </div>
        )}
      </div>

      {/* MODAL */}
      <FormDialog
        open={showModal}
        onClose={() => setShowModal(false)}
        title={
          tab === "deudas" ? "Registrar Préstamo / Deuda" : "Carga Impositiva"
        }
      >
        {tab === "deudas" ? (
          <div className={styles.form}>
            <input
              className={styles.input}
              placeholder="Concepto (Ej: Préstamo Auto)"
              onChange={(e) => setDNombre(e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Acreedor (Banco/Persona)"
              onChange={(e) => setDAcreedor(e.target.value)}
            />
            <div className={styles.row}>
              <input
                className={styles.input}
                type="number"
                placeholder="Total Original"
                onChange={(e) => setDTotal(e.target.value)}
              />
              <input
                className={styles.input}
                type="number"
                placeholder="Restante Hoy"
                onChange={(e) => setDRestante(e.target.value)}
              />
            </div>
            <input
              className={styles.input}
              type="number"
              placeholder="Valor Cuota"
              onChange={(e) => setDCuota(e.target.value)}
            />
            <button className={styles.btnSave} onClick={guardarDeuda}>
              Guardar Deuda
            </button>
          </div>
        ) : (
          <div className={styles.form}>
            <input
              className={styles.input}
              placeholder="Impuesto (Ej: Monotributo Cat A)"
              onChange={(e) => setIConcepto(e.target.value)}
            />
            <select
              className={styles.input}
              onChange={(e) => setITipo(e.target.value as any)}
            >
              <option value="nacional">Nacional (AFIP)</option>
              <option value="provincial">Provincial (Rentas)</option>
              <option value="municipal">Municipal</option>
            </select>
            <div className={styles.row}>
              <input
                className={styles.input}
                type="number"
                placeholder="Monto Mensual"
                onChange={(e) => setIMonto(e.target.value)}
              />
              <input
                className={styles.input}
                type="number"
                placeholder="Día Vencimiento (1-31)"
                onChange={(e) => setIVenc(e.target.value)}
              />
            </div>
            <button className={styles.btnSave} onClick={guardarImpuesto}>
              Guardar Impuesto
            </button>
          </div>
        )}
      </FormDialog>
    </main>
  );
}
