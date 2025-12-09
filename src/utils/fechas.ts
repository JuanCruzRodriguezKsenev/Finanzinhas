// src/utils/fechas.ts

import { Transaccion } from "@/types";

export const obtenerNombrePeriodo = (
  fecha: Date,
  tipo: "anual" | "mensual" | "semanal" | "diario"
) => {
  const opciones: Intl.DateTimeFormatOptions = { timeZone: "UTC" };

  if (tipo === "anual") return fecha.getUTCFullYear().toString();
  if (tipo === "mensual")
    return fecha.toLocaleDateString("es-ES", {
      ...opciones,
      month: "long",
      year: "numeric",
    });
  if (tipo === "diario")
    return fecha.toLocaleDateString("es-ES", {
      ...opciones,
      dateStyle: "full",
    });

  if (tipo === "semanal") {
    const inicio = new Date(fecha);
    inicio.setDate(inicio.getDate() - inicio.getDay()); // Domingo
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 6); // Sábado
    return `Semana del ${inicio.getUTCDate()} al ${fin.toLocaleDateString(
      "es-ES",
      { ...opciones, dateStyle: "medium" }
    )}`;
  }
  return "";
};

export const filtrarTransacciones = (
  items: Transaccion[],
  fecha: Date,
  tipo: "anual" | "mensual" | "semanal" | "diario"
) => {
  return items.filter((t) => {
    const tFecha = new Date(t.fecha);
    // Ajustamos la zona horaria para evitar problemas de "día anterior"
    const tFechaUTC = new Date(
      tFecha.getUTCFullYear(),
      tFecha.getUTCMonth(),
      tFecha.getUTCDate()
    );
    const refFechaUTC = new Date(
      fecha.getUTCFullYear(),
      fecha.getUTCMonth(),
      fecha.getUTCDate()
    );

    if (tipo === "anual") {
      return tFechaUTC.getFullYear() === refFechaUTC.getFullYear();
    }
    if (tipo === "mensual") {
      return (
        tFechaUTC.getMonth() === refFechaUTC.getMonth() &&
        tFechaUTC.getFullYear() === refFechaUTC.getFullYear()
      );
    }
    if (tipo === "diario") {
      return tFechaUTC.getTime() === refFechaUTC.getTime();
    }
    if (tipo === "semanal") {
      const inicioSemana = new Date(refFechaUTC);
      inicioSemana.setDate(refFechaUTC.getDate() - refFechaUTC.getDay());
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);
      return tFechaUTC >= inicioSemana && tFechaUTC <= finSemana;
    }
    return false;
  });
};
