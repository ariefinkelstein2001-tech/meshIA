"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOperador } from "@/lib/operador";
import type { Plan } from "@/lib/types";

const PLANES_VALIDOS: Plan[] = ["sitio", "pulso", "pro"];

/** Actualiza nombre y plan de una empresa (cliente). Solo operadores (RLS). */
export async function actualizarEmpresa(formData: FormData) {
  await requireOperador();

  const empresaId = String(formData.get("empresaId") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const plan = String(formData.get("plan") ?? "") as Plan;

  if (!empresaId) return { error: "Falta la empresa." };
  if (!nombre) return { error: "El nombre de la empresa no puede quedar vacío." };
  if (!PLANES_VALIDOS.includes(plan)) return { error: "Plan no válido." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("empresas")
    .update({ nombre, plan })
    .eq("id", empresaId);

  if (error) {
    return { error: "No pudimos guardar los cambios. Intenta de nuevo." };
  }

  revalidatePath(`/clientes/${empresaId}/config`);
  revalidatePath(`/clientes/${empresaId}/dashboard`);
  revalidatePath("/clientes");
  return { ok: true };
}

/** Activa/desactiva el link público de solo lectura del panel. */
export async function togglePanelPublico(empresaId: string, habilitar: boolean) {
  await requireOperador();
  const supabase = await createClient();

  const { error } = await supabase
    .from("empresas")
    .update({ panel_publico: habilitar })
    .eq("id", empresaId);

  if (error) return { ok: false as const };

  revalidatePath(`/clientes/${empresaId}/config`);
  return { ok: true as const, panel_publico: habilitar };
}

/** Regenera el token público (invalida el link anterior). */
export async function regenerarToken(empresaId: string) {
  await requireOperador();
  const supabase = await createClient();

  const nuevo = crypto.randomUUID();
  const { error } = await supabase
    .from("empresas")
    .update({ public_token: nuevo })
    .eq("id", empresaId);

  if (error) return { ok: false as const };

  revalidatePath(`/clientes/${empresaId}/config`);
  return { ok: true as const, public_token: nuevo };
}
