import type { MovimientoParseado, TipoTransaccion } from "./types";

/**
 * Parser de la planilla del cliente (§8 del brief).
 * Una fila por movimiento, columnas: fecha, tipo, categoria, monto, descripcion.
 * Devuelve movimientos válidos + errores con mensajes claros en español.
 */

export interface ResultadoParseo {
  movimientos: MovimientoParseado[];
  errores: { fila: number; mensaje: string }[];
  totalFilas: number;
}

const COLUMNAS_REQUERIDAS = ["fecha", "tipo", "categoria", "monto"] as const;

/** Parsea texto CSV (o TSV) crudo a movimientos validados. */
export function parsearPlanilla(texto: string): ResultadoParseo {
  const filas = parsearCSV(texto);
  const errores: ResultadoParseo["errores"] = [];

  if (filas.length === 0) {
    return {
      movimientos: [],
      errores: [{ fila: 0, mensaje: "La planilla está vacía." }],
      totalFilas: 0,
    };
  }

  const encabezado = filas[0].map((c) => normalizar(c));
  const idx: Record<string, number> = {};
  encabezado.forEach((col, i) => {
    idx[col] = i;
  });

  const faltantes = COLUMNAS_REQUERIDAS.filter((c) => !(c in idx));
  if (faltantes.length > 0) {
    return {
      movimientos: [],
      errores: [
        {
          fila: 1,
          mensaje: `Falta(n) la(s) columna(s): ${faltantes.join(
            ", ",
          )}. La primera fila debe ser: fecha, tipo, categoria, monto, descripcion.`,
        },
      ],
      totalFilas: filas.length - 1,
    };
  }

  const movimientos: MovimientoParseado[] = [];

  for (let i = 1; i < filas.length; i++) {
    const fila = filas[i];
    const numFila = i + 1; // 1-based, contando el encabezado

    // Salta filas totalmente vacías sin contarlas como error.
    if (fila.every((c) => c.trim() === "")) continue;

    const get = (col: string) => (fila[idx[col]] ?? "").trim();

    const fecha = validarFecha(get("fecha"));
    if (!fecha.ok) {
      errores.push({ fila: numFila, mensaje: fecha.error });
      continue;
    }

    const tipo = validarTipo(get("tipo"));
    if (!tipo.ok) {
      errores.push({ fila: numFila, mensaje: tipo.error });
      continue;
    }

    const categoria = get("categoria");
    if (!categoria) {
      errores.push({
        fila: numFila,
        mensaje: "La categoría no puede quedar vacía.",
      });
      continue;
    }

    const monto = validarMonto(get("monto"));
    if (!monto.ok) {
      errores.push({ fila: numFila, mensaje: monto.error });
      continue;
    }

    movimientos.push({
      fecha: fecha.valor,
      tipo: tipo.valor,
      categoria,
      monto: monto.valor,
      descripcion: "descripcion" in idx ? get("descripcion") : "",
    });
  }

  return { movimientos, errores, totalFilas: filas.length - 1 };
}

// --- validadores ---------------------------------------------------------

type Validacion<T> = { ok: true; valor: T } | { ok: false; error: string };

function validarFecha(raw: string): Validacion<string> {
  if (!raw) return { ok: false, error: "La fecha está vacía." };
  // Acepta YYYY-MM-DD o DD/MM/YYYY o DD-MM-YYYY.
  let iso = raw;
  const m = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) {
    const [, d, mes, a] = m;
    iso = `${a}-${mes.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return {
      ok: false,
      error: `Fecha "${raw}" no válida. Usa el formato 2025-11-03.`,
    };
  }
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) {
    return { ok: false, error: `Fecha "${raw}" no existe.` };
  }
  return { ok: true, valor: iso };
}

function validarTipo(raw: string): Validacion<TipoTransaccion> {
  const t = normalizar(raw);
  if (t === "ingreso" || t === "ingresos" || t === "venta" || t === "ventas") {
    return { ok: true, valor: "ingreso" };
  }
  if (t === "gasto" || t === "gastos" || t === "egreso" || t === "egresos") {
    return { ok: true, valor: "gasto" };
  }
  return {
    ok: false,
    error: `Tipo "${raw}" no reconocido. Debe ser "ingreso" o "gasto".`,
  };
}

function validarMonto(raw: string): Validacion<number> {
  if (!raw) return { ok: false, error: "El monto está vacío." };
  // Limpia símbolos de peso, espacios y separadores de miles.
  const limpio = raw
    .replace(/\$/g, "")
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "") // puntos de miles
    .replace(/,/g, ""); // por si vienen comas de miles
  if (!/^-?\d+$/.test(limpio)) {
    return {
      ok: false,
      error: `Monto "${raw}" no válido. Usa solo números, ej: 120000.`,
    };
  }
  const n = Number(limpio);
  if (n < 0) {
    return {
      ok: false,
      error: `Monto "${raw}" no puede ser negativo. Usa el tipo "gasto" en vez de un signo.`,
    };
  }
  return { ok: true, valor: n };
}

// --- CSV bajo nivel ------------------------------------------------------

function normalizar(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita tildes
}

/**
 * Parser CSV minimalista: maneja comillas, comas/; y saltos de línea dentro
 * de campos entre comillas. Detecta el separador (',' o ';' o tab).
 */
export function parsearCSV(texto: string): string[][] {
  const limpio = texto.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!limpio) return [];

  const sep = detectarSeparador(limpio);
  const filas: string[][] = [];
  let campo = "";
  let fila: string[] = [];
  let enComillas = false;

  for (let i = 0; i < limpio.length; i++) {
    const c = limpio[i];

    if (enComillas) {
      if (c === '"') {
        if (limpio[i + 1] === '"') {
          campo += '"';
          i++;
        } else {
          enComillas = false;
        }
      } else {
        campo += c;
      }
      continue;
    }

    if (c === '"') {
      enComillas = true;
    } else if (c === sep) {
      fila.push(campo);
      campo = "";
    } else if (c === "\n") {
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = "";
    } else {
      campo += c;
    }
  }
  fila.push(campo);
  filas.push(fila);
  return filas;
}

function detectarSeparador(texto: string): string {
  const primeraLinea = texto.split("\n")[0];
  const comas = (primeraLinea.match(/,/g) ?? []).length;
  const puntoComa = (primeraLinea.match(/;/g) ?? []).length;
  const tabs = (primeraLinea.match(/\t/g) ?? []).length;
  if (tabs > comas && tabs > puntoComa) return "\t";
  if (puntoComa > comas) return ";";
  return ",";
}
