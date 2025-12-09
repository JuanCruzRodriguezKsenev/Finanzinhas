export interface Transaccion {
  id?: number;
  monto: number;
  tipo: "ingreso" | "gasto";
  categoria: string;
  concepto: string;
  fecha: string;
  // 👇 NUEVO CAMPO
  metodoPago: string;
}

export interface PresupuestoMensual {
  mes: string;
  presupuestoGeneral: number;
  categorias: {
    categoria: string;
    montoMaximo: number;
  }[];
}
