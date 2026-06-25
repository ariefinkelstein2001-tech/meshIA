"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOperador } from "@/lib/operador";
import type { Plan } from "@/lib/types";

const PLANES_VALIDOS: Plan[] = ["sitio", "pulso", "pro"];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Crea una empresa (cliente) nueva y redirige a su pantalla de datos. */
export async function crearCliente(
  _prev: { error?: string } | null,
  formData: FormData,
) {
  const operador = await requireOperador();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const plan = (String(formData.get("plan") ?? "pulso") as Plan) || "pulso";

  if (!nombre) return { error: "Escribe el nombre del cliente." };
  if (!PLANES_VALIDOS.includes(plan)) return { error: "Plan no válido." };

  const supabase = await createClient();

  // slug único: base + sufijo corto aleatorio para evitar choques.
  const slug = `${slugify(nombre) || "cliente"}-${crypto.randomUUID().slice(0, 6)}`;

  const { data, error } = await supabase
    .from("empresas")
    .insert({ nombre, plan, slug, created_by: operador.userId })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "No pudimos crear el cliente. Intenta de nuevo." };
  }

  revalidatePath("/clientes");
  redirect(`/clientes/${data.id}/datos`);
}
