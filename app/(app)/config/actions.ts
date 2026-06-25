"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Plan } from "@/lib/types";

const PLANES_VALIDOS: Plan[] = ["sitio", "pulso", "pro"];

/** Actualiza nombre y plan de la empresa del usuario. RLS garantiza que sea la suya. */
export async function actualizarEmpresa(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const plan = String(formData.get("plan") ?? "") as Plan;

  if (!nombre) {
    return { error: "El nombre de la empresa no puede quedar vacío." };
  }
  if (!PLANES_VALIDOS.includes(plan)) {
    return { error: "Plan no válido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión expiró. Vuelve a entrar." };
  }

  const { error } = await supabase
    .from("empresas")
    .update({ nombre, plan })
    .eq("owner_user_id", user.id);

  if (error) {
    return { error: "No pudimos guardar los cambios. Intenta de nuevo." };
  }

  revalidatePath("/config");
  revalidatePath("/dashboard");
  return { ok: true };
}
