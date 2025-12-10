// --- TRANSACCIONES (Movimientos) ---
// ... (Otros tipos)

export interface Transaccion {
  id?: number;
  monto: number;
  tipo: "ingreso" | "gasto";
  categoria: string;
  concepto: string;
  fecha: string;
  metodoPago: string;
  
  // Vinculaciones
  tarjetaId?: number; // Para consumo con tarjeta (YA ESTABA)
  
  // 👇 NUEVOS CAMPOS PARA PAGOS
  esPagoDeuda?: boolean; 
  deudaId?: number; // ID de la Deuda o Tarjeta que se pagó
  tipoDeuda?: "prestamo" | "tarjeta"; // Qué tipo de pasivo se canceló
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
// ... (Otras interfaces)

export interface Tarjeta {
  id: number;
  alias: string;
  banco: string;
  tipo: "credito" | "debito";
  ultimos4: string;
  limite: number;
  diaCierre?: number;
  diaVencimiento?: number;
  color: string;
  
  // 👇 NUEVO CAMPO
  costoMantenimiento?: number; // Costo mensual fijo
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
// ... (Otras interfaces)

export interface MantenimientoInmueble {
  id: number;
  fecha: string;        // YYYY-MM-DD
  concepto: string;     // Ej: "Pintura completa", "Arreglo baño"
  costo: number;
  moneda: "ARS" | "USD";
}

export interface Inmueble {
  id: number;
  alias: string;
  direccion: string;
  tipo: "casa" | "departamento" | "terreno" | "local" | "cochera";
  fechaAdquisicion: string;
  valorCompra: number;
  moneda: "USD" | "ARS";
  
  // Datos Opcionales
  datosAlquiler?: ContratoAlquiler | null; 
  gastosFijos?: GastoFijoConfig[];
  tasaciones?: Tasacion[];
  
  // 👇 NUEVO CAMPO
  mantenimientos?: MantenimientoInmueble[];
}

// ... (Mantén las interfaces anteriores: Transaccion, Tarjeta, Inmueble, etc.)

// --- SUB-TIPOS PARA VEHÍCULOS ---
export interface Mantenimiento {
  id: number;
  fecha: string;        // YYYY-MM-DD
  concepto: string;     // Ej: "Cambio de Aceite", "Cubiertas Nuevas"
  kilometraje: number;  // Ej: 45000
  costo: number;
  moneda: "ARS" | "USD";
}

// --- VEHÍCULOS (Patrimonio + Gastos) ---
export interface Vehiculo {
  id: number;
  alias: string;        // Ej: "El Golcito", "Moto Honda"
  tipo: "auto" | "moto" | "camioneta" | "otro";
  marca: string;        // Ej: "Volkswagen"
  modelo: string;       // Ej: "Gol Trend"
  anio: number;         // Ej: 2018
  patente: string;      // Ej: "AD 123 CD"
  valorEstimado: number;
  moneda: "USD" | "ARS";
  
  // Detalles Opcionales
  gastosFijos?: GastoFijoConfig[]; // (Reusamos el tipo de Inmuebles para Seguro/Patente)
  mantenimientos?: Mantenimiento[];
}

// ... (Otros tipos)

// --- INVERSIONES (Portafolio) ---
export interface Inversion {
  id: number;
  ticket: string;       // Ej: AAPL, BTC, AL30
  nombre: string;       // Ej: Apple, Bitcoin
  tipo: "accion" | "cedear" | "crypto" | "bono" | "fci" | "pf";
  cantidad: number;     // Ej: 10.5
  precioCompra: number; // Precio promedio de compra (Unitario)
  precioActual: number; // Precio de mercado actual (Unitario) - Manual por ahora
  moneda: "USD" | "ARS";
}

// ... (Otras interfaces)

export interface Reserva {
  id: number;
  nombre: string;       // Ej: "Ahorro Dólar Billete", "Fondo Emergencia"
  monto: number;
  moneda: "ARS" | "USD" | "USDT" | "EUR";
  tipo: "efectivo" | "banco" | "billetera" | "crypto"; 
  ubicacion: string;    // Ej: "Caja Fuerte", "MercadoPago", "Binance Earn"
  objetivo: string;     // Ej: "Emergencia", "Viaje", "Auto", "Retiro"
  rendimientoAnual?: number; // % TNA o APY (Ej: 85% en MP, 5% en USDT)
}

// ... (Mantener Inmueble, Vehiculo, Inversion, Reserva, Tarjeta)

// --- NUEVO: DEUDAS / PASIVOS (Lo que debes) ---
export interface Deuda {
  id: number;
  nombre: string;       // Ej: "Préstamo Personal", "Hipoteca"
  acreedor: string;     // Ej: "Banco Galicia", "Tío Juan"
  montoTotal: number;   // Deuda original
  montoRestante: number;// Lo que falta pagar
  cuotasRestantes: number;
  valorCuota: number;
  tna?: number;         // Tasa de interés
  vencimiento: string;  // Día del mes
  moneda: "ARS" | "USD";
}

// --- NUEVO: CUENTAS POR COBRAR (Activo - Lo que te deben) ---
export interface PrestamoCobrar {
  id: number;
  deudor: string;       // Ej: "Amigo Pepe"
  monto: number;
  fechaPrestamo: string;
  fechaCobroEstimada?: string;
  estado: "pendiente" | "cobrado" | "incobrable";
  moneda: "ARS" | "USD";
}

// ... (Otros tipos)

// --- DEUDAS (Stock) ---
export interface Deuda {
  id: number;
  nombre: string;
  acreedor: string;
  montoTotal: number;
  montoRestante: number;
  cuotasRestantes: number;
  valorCuota: number;
  vencimiento: string;
  moneda: "ARS" | "USD";
}

// --- IMPUESTOS (Flujo Mensual) ---
export interface Impuesto {
  id: number;
  concepto: string;       // Ej: "Monotributo Cat H", "IIBB", "Municipal"
  montoMensual: number;   // Valor de la cuota
  vencimientoDia: number; // Ej: 20
  tipo: "nacional" | "provincial" | "municipal";
  fijo: boolean;          // true = Monotributo, false = IIBB (Variable)
}