import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Empresa } from "@/lib/types";

/**
 * Devuelve el usuario y su empresa para las rutas privadas.
 * Si no hay sesión, redirige a /login. Pensado para Server Components.
 *
 * La empresa se crea automáticamente al registrarse (trigger en schema.sql),
 * así que un usuario autenticado siempre tiene una.
 */
export async function getEmpresaActual(): Promise<{
  empresa: Empresa;
  userEmail: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: empresa, error } = await supabase
    .from("empresas")
    .select("*")
    .eq("owner_user_id", user.id)
    .single();

  if (error || !empresa) {
    // El usuario existe pero aún no tiene empresa (caso raro). Lo mandamos a config.
    redirect("/config?nueva=1");
  }

  return { empresa: empresa as Empresa, userEmail: user.email ?? "" };
}
