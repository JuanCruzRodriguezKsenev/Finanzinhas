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