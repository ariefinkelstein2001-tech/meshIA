/**
 * Formato de montos para meshIA.
 *
 * Regla del brief (§10): SIEMPRE formatear montos con
 * Intl.NumberFormat('es-CL', { style:'currency', currency:'CLP', maximumFractionDigits:0 }).
 *
 * Los montos se guardan en la base como enteros en CLP (bigint, sin decimales).
 */

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const clpSigned = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
  signDisplay: "exceptZero",
});

/** Formatea un entero CLP, ej: 120000 -> "$120.000". */
export function formatCLP(monto: number | bigint): string {
  return clp.format(monto);
}

/** Igual que formatCLP pero muestra el signo, ej: +$10.000 / -$5.000. */
export function formatCLPSigned(monto: number | bigint): string {
  return clpSigned.format(monto);
}

/** Porcentaje con un decimal y signo, ej: +12,5%. */
export function formatPct(fraccion: number): string {
  if (!Number.isFinite(fraccion)) return "—";
  return new Intl.NumberFormat("es-CL", {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(fraccion);
}

const fecha = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const mesLargo = new Intl.DateTimeFormat("es-CL", {
  month: "long",
  year: "numeric",
});

/** Fecha corta, ej: "03 nov 2025". Acepta Date o "YYYY-MM-DD". */
export function formatFecha(d: Date | string): string {
  return fecha.format(toDate(d));
}

/** Mes y año, ej: "noviembre 2025". */
export function formatMes(d: Date | string): string {
  return mesLargo.format(toDate(d));
}

function toDate(d: Date | string): Date {
  if (d instanceof Date) return d;
  // Evita el corrimiento de zona horaria al parsear "YYYY-MM-DD".
  return new Date(`${d}T00:00:00`);
}
