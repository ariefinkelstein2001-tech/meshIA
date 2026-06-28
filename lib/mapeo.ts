import { parsearFilas, type ResultadoParseo } from "./parsers";
import type { MovimientoParseado } from "./types";

/**
 * Mapeador de columnas: cada empresa entrega su Excel/CSV con columnas distintas.
 * Aquí adivinamos qué columna es cada cosa y construimos los movimientos
 * canónicos (fecha, tipo, categoria, monto, descripcion) para armar el dashboard.
 */

export type TipoEstrategia = "columna" | "signo" | "dos-columnas" | "fijo";

export interface Mapeo {
  /** Índice (0-based) de la fila de encabezados. */
  filaEncabezado: number;
  fecha: number;
  categoria: number | null;
  descripcion: number | null;
  tipoEstrategia: TipoEstrategia;
  /** 'columna': la columna que dice ingreso/gasto. */
  tipoCol: number | null;
  /** 'columna' | 'signo' | 'fijo': columna del monto. */
  montoCol: number | null;
  /** 'dos-columnas': columnas separadas de ingresos y gastos. */
  ingresosCol: number | null;
  gastosCol: number | null;
  /** 'fijo': todo el archivo es de un solo tipo. */
  tipoFijo: "ingreso" | "gasto";
}

function norm(s: string): string {
  return (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buscar(headers: string[], claves: string[]): number | null {
  const hs = headers.map(norm);
  for (const k of claves) {
    const i = hs.findIndex((h) => h.includes(k));
    if (i >= 0) return i;
  }
  return null;
}

/** Etiquetas legibles de las columnas (usa el encabezado o "Columna N"). */
export function etiquetasColumnas(headers: string[]): string[] {
  return headers.map((h, i) => (h?.toString().trim() ? h.toString().trim() : `Columna ${i + 1}`));
}

const PALABRAS_ENCABEZADO = [
  "fecha", "date", "dia", "tipo", "type", "monto", "valor", "importe", "total",
  "amount", "categoria", "rubro", "concepto", "descripcion", "detalle", "glosa",
  "ingreso", "abono", "haber", "gasto", "egreso", "cargo", "debe",
];

/**
 * Detecta cuál de las primeras filas es la de los títulos (muchas planillas
 * traen un título arriba). Elige la fila con más celdas que parezcan encabezados.
 */
export function detectarFilaEncabezado(filas: string[][]): number {
  let mejor = 0;
  let mejorPuntaje = -1;
  const limite = Math.min(filas.length, 8);
  for (let i = 0; i < limite; i++) {
    const fila = filas[i].map(norm);
    const puntaje = fila.filter((c) =>
      PALABRAS_ENCABEZADO.some((p) => c.includes(p)),
    ).length;
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejor = i;
    }
  }
  return mejor;
}

/** Adivina el mapeo a partir de los encabezados. */
export function sugerirMapeo(headers: string[], filaEncabezado = 0): Mapeo {
  const fecha = buscar(headers, ["fecha", "date", "dia", "periodo"]);
  const tipoCol = buscar(headers, ["tipo", "type", "movimiento", "clase"]);
  const monto = buscar(headers, [
    "monto", "valor", "importe", "total", "amount", "precio", "neto", "$",
  ]);
  const categoria = buscar(headers, [
    "categoria", "rubro", "category", "item", "producto", "cuenta", "concepto",
  ]);
  const descripcion = buscar(headers, [
    "descripcion", "detalle", "glosa", "description", "observacion", "nota",
  ]);
  const ingresosCol = buscar(headers, ["ingreso", "abono", "haber", "entrada", "venta", "credito"]);
  const gastosCol = buscar(headers, ["gasto", "egreso", "cargo", "debe", "salida", "compra", "debito"]);

  let tipoEstrategia: TipoEstrategia;
  if (tipoCol !== null) {
    tipoEstrategia = "columna";
  } else if (ingresosCol !== null && gastosCol !== null && ingresosCol !== gastosCol) {
    tipoEstrategia = "dos-columnas";
  } else if (monto !== null) {
    tipoEstrategia = "signo";
  } else {
    tipoEstrategia = "fijo";
  }

  return {
    filaEncabezado,
    fecha: fecha ?? 0,
    categoria,
    descripcion,
    tipoEstrategia,
    tipoCol,
    montoCol: monto ?? (tipoEstrategia === "signo" ? 0 : null),
    ingresosCol,
    gastosCol,
    tipoFijo: "ingreso",
  };
}

function celda(row: string[], i: number | null): string {
  if (i === null || i < 0) return "";
  return (row[i] ?? "").toString().trim();
}

function aNumero(raw: string): number {
  const limpio = raw
    .replace(/\$/g, "")
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(/,/g, "");
  if (!/^-?\d+$/.test(limpio)) return NaN;
  return Number(limpio);
}

/**
 * Aplica el mapeo a las filas crudas → movimientos validados.
 * Construye filas canónicas y reutiliza el validador (parsearFilas).
 */
export function aplicarMapeo(filas: string[][], m: Mapeo): ResultadoParseo {
  const datos = filas.slice(m.filaEncabezado + 1);
  const out: string[][] = [["fecha", "tipo", "categoria", "monto", "descripcion"]];

  for (const row of datos) {
    if (row.every((c) => (c ?? "").toString().trim() === "")) continue;

    const fecha = celda(row, m.fecha);
    const categoria = m.categoria !== null ? celda(row, m.categoria) || "general" : "general";
    const descripcion = m.descripcion !== null ? celda(row, m.descripcion) : "";

    if (m.tipoEstrategia === "dos-columnas") {
      const ing = aNumero(celda(row, m.ingresosCol));
      const gas = aNumero(celda(row, m.gastosCol));
      if (Number.isFinite(ing) && ing > 0) {
        out.push([fecha, "ingreso", categoria === "general" ? "ventas" : categoria, String(ing), descripcion]);
      }
      if (Number.isFinite(gas) && gas > 0) {
        out.push([fecha, "gasto", categoria === "general" ? "gastos" : categoria, String(gas), descripcion]);
      }
    } else if (m.tipoEstrategia === "signo") {
      const raw = celda(row, m.montoCol);
      const n = aNumero(raw);
      if (Number.isNaN(n)) {
        out.push([fecha, "ingreso", categoria, raw, descripcion]); // monto inválido → lo marca el validador
      } else {
        out.push([fecha, n < 0 ? "gasto" : "ingreso", categoria, String(Math.abs(n)), descripcion]);
      }
    } else if (m.tipoEstrategia === "fijo") {
      out.push([fecha, m.tipoFijo, categoria, celda(row, m.montoCol), descripcion]);
    } else {
      // columna
      out.push([fecha, celda(row, m.tipoCol), categoria, celda(row, m.montoCol), descripcion]);
    }
  }

  return parsearFilas(out);
}

/** Serializa movimientos validados a CSV canónico (para guardar). */
export function movimientosACsv(movs: MovimientoParseado[]): string {
  const esc = (s: string) => (/[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const head = "fecha,tipo,categoria,monto,descripcion";
  const filas = movs.map((mv) =>
    [mv.fecha, mv.tipo, mv.categoria, String(mv.monto), mv.descripcion ?? ""]
      .map(esc)
      .join(","),
  );
  return [head, ...filas].join("\n");
}
