import { readSheet } from "read-excel-file/browser";

/**
 * Lee un archivo (CSV o Excel .xlsx) en el browser y lo devuelve como texto CSV,
 * listo para el parser/ingesta. Los .xls antiguos no se soportan.
 */

function celdaACsv(v: unknown): string {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

function escapar(s: string): string {
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function filasACsv(filas: unknown[][]): string {
  return filas
    .map((f) => f.map((c) => escapar(celdaACsv(c))).join(","))
    .join("\n");
}

export function esArchivoSoportado(file: File): boolean {
  return /\.(csv|xlsx)$/i.test(file.name);
}

export async function archivoACsv(file: File): Promise<string> {
  const nombre = file.name.toLowerCase();

  if (nombre.endsWith(".xlsx")) {
    // readSheet devuelve las filas de la primera hoja (array de arrays).
    const filas = await readSheet(file);
    return filasACsv(filas as unknown as unknown[][]);
  }
  if (nombre.endsWith(".xls")) {
    throw new Error(
      "Los Excel antiguos (.xls) no se soportan. Guárdalo como .xlsx o CSV.",
    );
  }
  if (nombre.endsWith(".csv") || file.type === "text/csv") {
    return await file.text();
  }
  // Por defecto, intentamos leerlo como texto.
  return await file.text();
}
