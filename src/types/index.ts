export interface Tarjeta {
  id: number;
  alias: string; // Ej: "Visa Galicia"
  banco: string; // Ej: "Galicia", "Santander"
  tipo: "credito" | "debito";
  ultimos4: string; // Para identificarla visualmente
  limite: number; // Límite de compra (Solo crédito)
  diaCierre?: number; // Día del mes (Ej: 28)
  diaVencimiento?: number; // Día del mes (Ej: 10)
  color: string; // Gradiente CSS para el fondo
}

export interface Transaccion {
  id?: number;
  monto: number;
  tipo: "ingreso" | "gasto";
  categoria: string;
  concepto: string;
  fecha: string;
  metodoPago: string;
  tarjetaId?: number; // 👈 NUEVO: Vinculación opcional
}

export interface PresupuestoMensual {
  mes: string;
  presupuestoGeneral: number;
  categorias: {
    categoria: string;
    montoMaximo: number;
  }[];
}
