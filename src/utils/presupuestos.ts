import { PresupuestoMensual, Transaccion } from "@/types";

// 1. Obtener el presupuesto del mes actual (o crearlo copiando el anterior)
export const obtenerPresupuestoDelMes = (
  todosLosPresupuestos: PresupuestoMensual[],
  fechaRef: Date
): PresupuestoMensual => {
  const keyMes = `${fechaRef.getFullYear()}-${String(
    fechaRef.getMonth() + 1
  ).padStart(2, "0")}`;

  // A. Buscamos si ya existe
  const existente = todosLosPresupuestos.find((p) => p.mes === keyMes);
  if (existente) return existente;

  // B. Si no existe, buscamos el del mes ANTERIOR para copiarlo
  const fechaAnterior = new Date(fechaRef);
  fechaAnterior.setMonth(fechaRef.getMonth() - 1);
  const keyMesAnterior = `${fechaAnterior.getFullYear()}-${String(
    fechaAnterior.getMonth() + 1
  ).padStart(2, "0")}`;

  const anterior = todosLosPresupuestos.find((p) => p.mes === keyMesAnterior);

  if (anterior) {
    // Retornamos una copia con el mes nuevo, copiando el general y las categorías
    return {
      mes: keyMes,
      presupuestoGeneral: anterior.presupuestoGeneral || 0, // Copiamos el techo
      categorias: [...anterior.categorias],
    };
  }

  // C. Si no hay nada, devolvemos nuevo vacío
  return { mes: keyMes, presupuestoGeneral: 0, categorias: [] };
};

// 2. Generar Recomendaciones Inteligentes
export const generarRecomendaciones = (
  presupuestoActual: PresupuestoMensual,
  transaccionesHistoricas: Transaccion[]
): string[] => {
  const recomendaciones: string[] = [];

  if (!presupuestoActual || !presupuestoActual.categorias) return [];

  presupuestoActual.categorias.forEach((p) => {
    // Filtramos gastos de esta categoría en el historial
    const gastosCategoria = transaccionesHistoricas.filter(
      (t) => t.tipo === "gasto" && t.categoria === p.categoria
    );

    if (gastosCategoria.length === 0) return;

    // Calculamos el promedio de gasto mensual real
    const mesesUnicos =
      new Set(gastosCategoria.map((t) => t.fecha.substring(0, 7))).size || 1;
    const gastoTotal = gastosCategoria.reduce((acc, t) => acc + t.monto, 0);
    const promedio = gastoTotal / mesesUnicos;

    // LÓGICA DE RECOMENDACIÓN
    // Si gastas consistentemente más del 110% del presupuesto
    if (promedio > p.montoMaximo * 1.1) {
      recomendaciones.push(
        `⚠️ En "${
          p.categoria
        }" sueles gastar $${promedio.toLocaleString()} (Promedio). Deberías aumentar tu presupuesto.`
      );
    }
    // Si gastas consistentemente menos del 60% del presupuesto
    else if (promedio < p.montoMaximo * 0.6) {
      recomendaciones.push(
        `💡 En "${
          p.categoria
        }" te sobra presupuesto (Promedio: $${promedio.toLocaleString()}). Podrías bajarlo.`
      );
    }
  });

  return recomendaciones;
};
