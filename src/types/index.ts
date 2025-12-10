// --- TRANSACCIONES (Movimientos) ---
export interface Transaccion {
  id?: number;
  monto: number;
  tipo: "ingreso" | "gasto";
  categoria: string;
  concepto: string;
  fecha: string; // Formato ISO: "YYYY-MM-DD"
  metodoPago: string; // Ej: "Efectivo", "Visa Galicia", "MercadoPago"

  // Vinculaciones Opcionales
  tarjetaId?: number; // Si el gasto se hizo con una tarjeta guardada
  inmuebleId?: number; // Si el gasto es relativo a una propiedad (ej: expensas)
}

// --- PRESUPUESTOS (Metas Mensuales) ---
export interface PresupuestoMensual {
  mes: string; // Formato "YYYY-MM" (ej: "2025-12")
  presupuestoGeneral: number; // El "techo" de gasto total para ese mes
  categorias: {
    categoria: string; // Nombre del rubro (ej: "Comida")
    montoMaximo: number; // Límite para ese rubro
  }[];
}

// --- TARJETAS (Billetera) ---
export interface Tarjeta {
  id: number;
  alias: string; // Ej: "Visa Galicia"
  banco: string; // Ej: "Galicia", "Santander"
  tipo: "credito" | "debito";
  ultimos4: string; // Para mostrar en la tarjeta visual (ej: "4589")
  limite: number; // Límite de compra (Solo crédito)
  diaCierre?: number; // Día del mes (Ej: 28)
  diaVencimiento?: number; // Día del mes (Ej: 10)
  color: string; // Gradiente CSS para el fondo de la tarjeta
}

// --- SUB-TIPOS PARA INMUEBLES ---
export interface ContratoAlquiler {
  inquilino: string;
  inicio: string; // YYYY-MM-DD
  fin: string; // YYYY-MM-DD
  monto: number;
  moneda: "ARS" | "USD";
}

export interface GastoFijoConfig {
  id: number;
  nombre: string; // Ej: "ARBA", "Expensas", "Municipal"
  tipoCalculo: "fijo" | "porcentaje"; // Monto fijo o % del valor de la propiedad
  valor: number; // Ej: 5000 (pesos) o 1.2 (porcentaje)
}

export interface Tasacion {
  id: number;
  fecha: string; // YYYY-MM-DD
  valor: number;
  moneda: "USD" | "ARS";
  observacion?: string; // Ej: "Revalorización post-obra"
}

// --- INMUEBLES (Patrimonio) ---
export interface Inmueble {
  id: number;
  alias: string; // Ej: "Depto Centro", "Casa Quinta"
  direccion: string;
  tipo: "casa" | "departamento" | "terreno" | "local" | "cochera";
  fechaAdquisicion: string; // Formato "YYYY-MM-DD"
  valorCompra: number;
  moneda: "USD" | "ARS"; // Moneda de valuación

  // Datos Opcionales (Gestión Avanzada)
  datosAlquiler?: ContratoAlquiler | null;
  gastosFijos?: GastoFijoConfig[];
  tasaciones?: Tasacion[]; // Historial de valor
}
