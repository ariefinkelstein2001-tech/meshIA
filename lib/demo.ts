import type { Empresa, Fuente, Transaccion } from "@/lib/types";
import type { Operador } from "@/lib/operador";

/**
 * MODO DEMO (temporal).
 *
 * Se enciende solo cuando NO hay Supabase configurado (sin
 * NEXT_PUBLIC_SUPABASE_URL). En ese caso:
 *   - la consola interna se entra SIN login,
 *   - se muestran datos de ejemplo (no se guardan).
 *
 * En cuanto se configuren las llaves de Supabase, DEMO_MODE pasa a false
 * automáticamente y vuelve a exigir login + datos reales.
 */
export const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL;

export const DEMO_OPERADOR: Operador = {
  userId: "demo-operador",
  email: "demo@meshia.cl",
};

export const demoEmpresas: Empresa[] = [
  empresa("a", "Tienda Don José", "tienda-don-jose", "pulso", true),
  empresa("b", "Café Esquina", "cafe-esquina", "pro", false),
  empresa("c", "Estudio Bordó", "estudio-bordo", "pulso", true),
  empresa("d", "Ferretería El Roble", "ferreteria-el-roble", "sitio", false),
];

export function demoEmpresaPorId(id: string): Empresa {
  return demoEmpresas.find((e) => e.id === id) ?? demoEmpresas[0];
}

export function demoFuentes(empresaId: string): Fuente[] {
  if (empresaId === "a") {
    return [
      fuente("fa1", "a", "sheet", { url: "https://docs.google.com/spreadsheets/d/demo" }),
      fuente("fa2", "a", "csv", {}),
    ];
  }
  if (empresaId === "b") {
    return [fuente("fb1", "b", "sheet", { url: "https://docs.google.com/spreadsheets/d/cafe" })];
  }
  return [];
}

/** Movimientos de ejemplo. 'a' y 'b' con datos; 'c' y 'd' vacíos. */
export function demoTransacciones(empresaId: string): Transaccion[] {
  if (empresaId === "a") return construir("a", BASE);
  if (empresaId === "b") return construir("b", BASE.map((r) => [r[0], r[1], r[2], Math.round(r[3] * 0.65)] as Fila));
  return [];
}

// --- datos base (mismas columnas que el fixture) --------------------------

type Fila = [string, "ingreso" | "gasto", string, number];

const BASE: Fila[] = [
  ["2025-09-02", "ingreso", "ventas", 180000],
  ["2025-09-05", "gasto", "arriendo", 350000],
  ["2025-09-10", "ingreso", "ventas", 95000],
  ["2025-09-15", "gasto", "proveedores", 140000],
  ["2025-09-22", "ingreso", "servicios", 220000],
  ["2025-09-28", "gasto", "sueldos", 300000],
  ["2025-10-01", "ingreso", "ventas", 210000],
  ["2025-10-04", "gasto", "arriendo", 350000],
  ["2025-10-09", "ingreso", "ventas", 130000],
  ["2025-10-14", "gasto", "proveedores", 160000],
  ["2025-10-19", "ingreso", "servicios", 240000],
  ["2025-10-25", "gasto", "marketing", 80000],
  ["2025-10-30", "gasto", "sueldos", 300000],
  ["2025-11-03", "ingreso", "ventas", 120000],
  ["2025-11-04", "gasto", "arriendo", 350000],
  ["2025-11-08", "ingreso", "ventas", 165000],
  ["2025-11-12", "ingreso", "servicios", 260000],
  ["2025-11-16", "gasto", "proveedores", 175000],
  ["2025-11-20", "ingreso", "ventas", 98000],
  ["2025-11-24", "gasto", "marketing", 90000],
  ["2025-11-28", "gasto", "sueldos", 300000],
];

function construir(empresaId: string, filas: Fila[]): Transaccion[] {
  return filas.map((f, i) => ({
    id: `${empresaId}-${i}`,
    empresa_id: empresaId,
    fecha: f[0],
    tipo: f[1],
    categoria: f[2],
    monto: f[3],
    descripcion: null,
    fuente_id: null,
    created_at: "",
  }));
}

function empresa(
  id: string,
  nombre: string,
  slug: string,
  plan: Empresa["plan"],
  panel_publico: boolean,
): Empresa {
  return {
    id,
    nombre,
    slug,
    plan,
    owner_user_id: null,
    created_by: null,
    public_token: `demo-token-${id}`,
    panel_publico,
    created_at: "2025-11-01T00:00:00Z",
  };
}

function fuente(
  id: string,
  empresa_id: string,
  tipo: Fuente["tipo"],
  config: Record<string, unknown>,
): Fuente {
  return { id, empresa_id, tipo, config, last_synced_at: "2025-11-25T12:00:00Z" };
}

/** Mensaje estándar para acciones que no persisten en demo. */
export const DEMO_AVISO =
  "Estás en modo demo (sin base de datos). Esto no se guarda. Conecta Supabase para guardar de verdad.";
