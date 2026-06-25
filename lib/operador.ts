import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Empresa } from "@/lib/types";

/**
 * Helpers de la consola interna (Fase 6).
 * La app autenticada es para el EQUIPO meshIA (operadores). Un operador
 * administra todas las empresas de los clientes; las pymes no inician sesión.
 */

export interface Operador {
  userId: string;
  email: string;
}

/**
 * Exige sesión de operador. Redirige a /login si no hay sesión o el correo no
 * está en la allowlist `operadores` (la RLS de esa tabla hace de doble chequeo:
 * un no-operador no puede leer ninguna fila).
 */
export async function requireOperador(): Promise<Operador> {
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
  const supabase = await createClient();
  const { data } = await supabase
    .from("empresas")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as Empresa[];
}

/** Una empresa por id (scope de operador vía RLS). 404 si no existe. */
export async function getEmpresaPorId(id: string): Promise<Empresa> {
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
