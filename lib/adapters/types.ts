import type { MovimientoParseado } from "@/lib/types";

/**
 * Contrato común de los adaptadores de fuentes de datos.
 * Hoy implementamos `sheet` y `csv`. `banco`, `sii` y `pagos` son stubs
 * con la interfaz lista (§ Fase 5) pero sin implementación todavía.
 */
export interface FuenteAdapter {
  tipo: string;
  /** Trae los movimientos crudos desde la fuente y los deja parseados/validados. */
  obtenerMovimientos(config: Record<string, unknown>): Promise<AdapterResultado>;
}

export interface AdapterResultado {
  movimientos: MovimientoParseado[];
  errores: { fila: number; mensaje: string }[];
  totalFilas: number;
}

/** Error de adaptador con mensaje listo para mostrar al usuario en español. */
export class AdapterError extends Error {}
