import { parsearCSV } from "@/lib/parsers";

/**
 * Lee un archivo (CSV o Excel .xlsx) en el browser y lo devuelve como FILAS
 * crudas (array de arrays de texto), para que el mapeador entienda las columnas
 * tal como las tiene cada empresa.
 *
 * Para Excel usamos ExcelJS (robusto con celdas vacías, fechas, inline strings,
 * shared strings, etc.). Los .xls antiguos no se soportan.
 */

function celdaATexto(v: unknown): string {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    // Celdas ExcelJS: { result }, { text }, { richText: [...] }, { hyperlink, text }
    if ("result" in o) return celdaATexto(o.result);
    if ("text" in o) return celdaATexto(o.text);
    if (Array.isArray(o.richText)) {
      return o.richText.map((r) => celdaATexto((r as { text?: string }).text)).join("");
    }
    if ("error" in o) return "";
  }
  return String(v);
}

export function esArchivoSoportado(file: File): boolean {
  return /\.(csv|xlsx)$/i.test(file.name);
}

export async function archivoAFilas(file: File): Promise<string[][]> {
  const nombre = file.name.toLowerCase();

  if (nombre.endsWith(".xlsx")) {
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await file.arrayBuffer());
    const ws = wb.worksheets[0];
    if (!ws) return [];

    const filas: string[][] = [];
    ws.eachRow({ includeEmpty: true }, (row) => {
      const celdas: string[] = [];
      // values es 1-based (índice 0 es null); normalizamos a 0-based.
      const valores = Array.isArray(row.values) ? row.values.slice(1) : [];
      for (const v of valores) celdas.push(celdaATexto(v));
      filas.push(celdas);
    });
    return filas;
  }

  if (nombre.endsWith(".xls")) {
    throw new Error(
      "Los Excel antiguos (.xls) no se soportan. Guárdalo como .xlsx o CSV.",
    );
  }

  // CSV (o texto plano)
  const texto = await file.text();
  return parsearCSV(texto);
}
