/** Tipos de dominio de meshIA, alineados con el modelo de datos (§6 del brief). */

export type Plan = "sitio" | "pulso" | "pro";
export type TipoFuente = "sheet" | "csv";
export type TipoTransaccion = "ingreso" | "gasto";

export interface Empresa {
  id: string;
  nombre: string;
  slug: string;
  plan: Plan;
  owner_user_id: string | null;
  created_by: string | null;
  /** Token inadivinable para el link público de solo lectura (/r/[token]). */
  public_token: string;
  /** Si el panel público está habilitado para compartir. */
  panel_publico: boolean;
  created_at: string;
}

export interface Fuente {
  id: string;
  empresa_id: string;
  tipo: TipoFuente;
  config: Record<string, unknown>;
  last_synced_at: string | null;
}

export interface Transaccion {
  id: string;
  empresa_id: string;
  fecha: string; // YYYY-MM-DD
  tipo: TipoTransaccion;
  categoria: string;
  monto: number; // CLP entero
  descripcion: string | null;
  fuente_id: string | null;
  created_at: string;
}

/** Una fila ya parseada y validada, lista para insertar en `transacciones`. */
export interface MovimientoParseado {
  fecha: string;
  tipo: TipoTransaccion;
  categoria: string;
  monto: number;
  descripcion: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  fuente: string | null;
  created_at: string;
}
