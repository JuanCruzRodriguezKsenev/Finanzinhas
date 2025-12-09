export interface Transaccion {
  id: number;
  fecha: string;
  concepto: string;
  monto: number;
  categoria: string;
  tipo: "ingreso" | "gasto";
}
