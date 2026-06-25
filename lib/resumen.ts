import type { Empresa, Transaccion } from "./types";
import { formatCLP, formatPct } from "./format";

/**
 * Resumen semanal (§ Fase 4).
 * Arma un texto por empresa: "esta semana vendiste $X, +Y% vs la anterior,
 * tu mayor gasto fue Z".
 */

export interface ResumenSemanal {
  empresa: Empresa;
  ventasSemana: number;
  ventasSemanaAnterior: number;
  crecimiento: number; // fracción
  gastosSemana: number;
  mayorGasto: { categoria: string; monto: number } | null;
  conteoVentas: number;
  hayActividad: boolean;
}

const DIA = 24 * 60 * 60 * 1000;

/** Calcula el resumen de los últimos 7 días vs los 7 anteriores. */
export function calcularResumenSemanal(
  empresa: Empresa,
  transacciones: Transaccion[],
  hoy: Date,
): ResumenSemanal {
  const finSemana = hoy.getTime();
  const inicioSemana = finSemana - 7 * DIA;
  const inicioAnterior = finSemana - 14 * DIA;

  let ventasSemana = 0;
  let ventasSemanaAnterior = 0;
  let gastosSemana = 0;
  let conteoVentas = 0;
  const gastosCat = new Map<string, number>();

  for (const t of transacciones) {
    const ts = new Date(`${t.fecha}T00:00:00`).getTime();
    const enSemana = ts > inicioSemana && ts <= finSemana;
    const enAnterior = ts > inicioAnterior && ts <= inicioSemana;

    if (t.tipo === "ingreso") {
      if (enSemana) {
        ventasSemana += t.monto;
        conteoVentas++;
      } else if (enAnterior) {
        ventasSemanaAnterior += t.monto;
      }
    } else if (t.tipo === "gasto" && enSemana) {
      gastosSemana += t.monto;
      gastosCat.set(t.categoria, (gastosCat.get(t.categoria) ?? 0) + t.monto);
    }
  }

  const crecimiento =
    ventasSemanaAnterior > 0
      ? (ventasSemana - ventasSemanaAnterior) / ventasSemanaAnterior
      : ventasSemana > 0
        ? Infinity
        : 0;

  let mayorGasto: ResumenSemanal["mayorGasto"] = null;
  for (const [categoria, monto] of gastosCat) {
    if (!mayorGasto || monto > mayorGasto.monto) mayorGasto = { categoria, monto };
  }

  return {
    empresa,
    ventasSemana,
    ventasSemanaAnterior,
    crecimiento,
    gastosSemana,
    mayorGasto,
    conteoVentas,
    hayActividad: ventasSemana > 0 || gastosSemana > 0,
  };
}

/** Texto plano del resumen, en chileno neutro. */
export function armarTextoResumen(r: ResumenSemanal): string {
  const partes: string[] = [`Hola, equipo de ${r.empresa.nombre} 👋`, ""];

  if (!r.hayActividad) {
    partes.push(
      "Esta semana no registramos movimientos. Si tuviste ventas o gastos, recuerda actualizar tus datos en meshIA.",
    );
    return partes.join("\n");
  }

  const crecimientoTxt = Number.isFinite(r.crecimiento)
    ? `${formatPct(r.crecimiento)} vs la semana anterior`
    : "tu primera semana con ventas registradas";

  partes.push(
    `Esta semana vendiste ${formatCLP(r.ventasSemana)} (${crecimientoTxt}).`,
  );
  partes.push(
    `Registraste ${r.conteoVentas} venta(s) y ${formatCLP(r.gastosSemana)} en gastos.`,
  );
  if (r.mayorGasto) {
    partes.push(
      `Tu mayor gasto fue "${r.mayorGasto.categoria}" con ${formatCLP(r.mayorGasto.monto)}.`,
    );
  }
  partes.push("", "Revisa el detalle en tu panel Pulso.");
  return partes.join("\n");
}

/** Versión HTML simple para el email. */
export function armarHtmlResumen(r: ResumenSemanal): string {
  const texto = armarTextoResumen(r);
  const lineas = texto
    .split("\n")
    .map((l) => (l ? `<p style="margin:0 0 8px">${l}</p>` : "<br/>"))
    .join("");
  return `<div style="font-family:Inter,system-ui,sans-serif;color:#14201c;line-height:1.5">${lineas}</div>`;
}
