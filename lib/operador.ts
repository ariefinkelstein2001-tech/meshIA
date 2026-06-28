import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Empresa, Fuente, Transaccion } from "@/lib/types";
import {
  DEMO_MODE,
  DEMO_OPERADOR,
  demoEmpresas,
  demoEmpresaPorId,
  demoFuentes,
  demoTransacciones,
} from "@/lib/demo";

/**
 * Helpers de la consola interna (Fase 6).
 * La app autenticada es para el EQUIPO meshIA (operadores). Un operador
 * administra todas las empresas de los clientes; las pymes no inician sesión.
 *
 * En MODO DEMO (sin Supabase configurado) se salta el login y se devuelven
 * datos de ejemplo. Ver lib/demo.ts.
 */

export interface Operador {
  userId: string;
  email: string;
}

/**
 * Exige sesión de operador. Redirige a /login si no hay sesión o el correo no
 * está en la allowlist `operadores`. En modo demo devuelve un operador ficticio.
 */
export async function requireOperador(): Promise<Operador> {
  if (DEMO_MODE) return DEMO_OPERADOR;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("operadores")
    .select("email")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  if (error || !data) {
    redirect("/login?error=sin_acceso");
  }

  return { userId: user.id, email: user.email };
}

/** Lista de empresas (clientes) que administra el equipo. */
export async function getEmpresas(): Promise<Empresa[]> {
  if (DEMO_MODE) return demoEmpresas;

  const supabase = await createClient();
  const { data } = await supabase
    .from("empresas")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as Empresa[];
}

/** Una empresa por id (scope de operador vía RLS). Vuelve a /clientes si no existe. */
export async function getEmpresaPorId(id: string): Promise<Empresa> {
  if (DEMO_MODE) return demoEmpresaPorId(id);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empresas")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    redirect("/clientes");
  }
  return data as Empresa;
}

/** Transacciones de una empresa (demo o reales). */
export async function getTransacciones(empresaId: string): Promise<Transaccion[]> {
  if (DEMO_MODE) return demoTransacciones(empresaId);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transacciones")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("fecha", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Transaccion[];
}

/** Fuentes de una empresa (demo o reales). */
export async function getFuentes(empresaId: string): Promise<Fuente[]> {
  if (DEMO_MODE) return demoFuentes(empresaId);

  const supabase = await createClient();
  const { data } = await supabase
    .from("fuentes")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("last_synced_at", { ascending: false });
  return (data ?? []) as Fuente[];
}

/** Todas las fuentes (para el resumen de la lista de clientes). */
export async function getTodasLasFuentes(): Promise<
  Pick<Fuente, "empresa_id" | "last_synced_at">[]
> {
  if (DEMO_MODE) {
    return demoEmpresas.flatMap((e) =>
      demoFuentes(e.id).map((f) => ({
        empresa_id: f.empresa_id,
        last_synced_at: f.last_synced_at,
      })),
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("fuentes")
    .select("empresa_id, last_synced_at");
  return (data ?? []) as Pick<Fuente, "empresa_id" | "last_synced_at">[];
}
