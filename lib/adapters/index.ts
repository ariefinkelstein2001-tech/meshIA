import type { FuenteAdapter } from "./types";
import { sheetAdapter } from "./sheet";
import { csvAdapter } from "./csv";
import { bancoAdapter, siiAdapter, pagosAdapter } from "./stubs";

/** Registro de adaptadores. Solo `sheet` y `csv` están implementados. */
export const adapters: Record<string, FuenteAdapter> = {
  sheet: sheetAdapter,
  csv: csvAdapter,
  // Stubs con interfaz lista (Fase 5):
  banco: bancoAdapter,
  sii: siiAdapter,
  pagos: pagosAdapter,
};

export function getAdapter(tipo: string): FuenteAdapter | undefined {
  return adapters[tipo];
}

export * from "./types";
