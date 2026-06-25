import type { Transaccion } from "./types";

/**
 * Cálculos del dashboard Pulso (§ Fase 3).
 * Todo en CLP entero. Sin dependencias externas: solo aritmética sobre las
 * transacciones de la empresa.
 */

export interface ResumenMes {
  ingresos: number;
  gastos: number;
  flujo: number; // ingresos - gastos
  ventas: number; // conteo de transacciones tipo ingreso
}

export interface MetricasDashboard {
  mesActual: ResumenMes;
  mesAnterior: ResumenMes;
  /** Crecimiento de ingresos vs mes anterior, como fracción (0.12 = +12%). */
  crecimientoIngresos: number;
  ingresosPorMes: { mes: string; etiqueta: string; ingresos: number; gastos: number }[];
  gastosPorCategoria: { categoria: string; monto: number }[];
  /** Últimos 12 puntos de ingresos para sparkline. */
  sparkline: number[];
  hayDatos: boolean;
}

/** Clave de mes "YYYY-MM" a partir de una fecha "YYYY-MM-DD". */
function claveMes(fecha: string): string {
  return fecha.slice(0, 7);
}

function etiquetaMes(clave: string): string {
  const [a, m] = clave.split("-");
  const nombres = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  return `${nombres[Number(m) - 1]} ${a.slice(2)}`;
}

function resumenDe(txs: Transaccion[]): ResumenMes {
  let ingresos = 0;
  let gastos = 0;
  let ventas = 0;
  for (const t of txs) {
    if (t.tipo === "ingreso") {
      ingresos += t.monto;
      ventas++;
    } else {
      gastos += t.monto;
    }
  }
  return { ingresos, gastos, flujo: ingresos - gastos, ventas };
}

/**
 * Calcula todas las métricas. `mesReferencia` permite fijar el "mes actual"
 * (útil para fixtures/pruebas); por defecto usa el mes más reciente con datos.
 */
export function calcularMetricas(
  transacciones: Transaccion[],
  mesReferencia?: string,
): MetricasDashboard {
  const vacio: ResumenMes = { ingresos: 0, gastos: 0, flujo: 0, ventas: 0 };

  if (transacciones.length === 0) {
    return {
      mesActual: vacio,
      mesAnterior: vacio,
      crecimientoIngresos: 0,
      ingresosPorMes: [],
      gastosPorCategoria: [],
      sparkline: [],
      hayDatos: false,
    };
  }

  // Agrupa por mes.
  const porMes = new Map<string, Transaccion[]>();
  for (const t of transacciones) {
    const k = claveMes(t.fecha);
    (porMes.get(k) ?? porMes.set(k, []).get(k)!).push(t);
  }

  const mesesOrdenados = [...porMes.keys()].sort();
  const mesActualKey = mesReferencia ?? mesesOrdenados[mesesOrdenados.length - 1];

  // Mes anterior = el inmediatamente previo en el calendario.
  const [a, m] = mesActualKey.split("-").map(Number);
  const prev = new Date(a, m - 2, 1);
  const mesAnteriorKey = `${prev.getFullYear()}-${String(
    prev.getMonth() + 1,
  ).padStart(2, "0")}`;

  const mesActual = resumenDe(porMes.get(mesActualKey) ?? []);
  const mesAnterior = resumenDe(porMes.get(mesAnteriorKey) ?? []);

  const crecimientoIngresos =
    mesAnterior.ingresos > 0
      ? (mesActual.ingresos - mesAnterior.ingresos) / mesAnterior.ingresos
      : mesActual.ingresos > 0
        ? Infinity
        : 0;

  // Serie ingresos/gastos por mes (todos los meses con datos).
  const ingresosPorMes = mesesOrdenados.map((k) => {
    const r = resumenDe(porMes.get(k)!);
    return { mes: k, etiqueta: etiquetaMes(k), ingresos: r.ingresos, gastos: r.gastos };
  });

  // Gastos por categoría del mes actual, de mayor a menor.
  const gastosCat = new Map<string, number>();
  for (const t of porMes.get(mesActualKey) ?? []) {
    if (t.tipo === "gasto") {
      gastosCat.set(t.categoria, (gastosCat.get(t.categoria) ?? 0) + t.monto);
    }
  }
  const gastosPorCategoria = [...gastosCat.entries()]
    .map(([categoria, monto]) => ({ categoria, monto }))
    .sort((x, y) => y.monto - x.monto);

  const sparkline = ingresosPorMes.slice(-12).map((p) => p.ingresos);

  return {
    mesActual,
    mesAnterior,
    crecimientoIngresos,
    ingresosPorMes,
    gastosPorCategoria,
    sparkline,
    hayDatos: true,
  };
}
