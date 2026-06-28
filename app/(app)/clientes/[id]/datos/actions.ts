"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOperador, getEmpresaPorId } from "@/lib/operador";
import { ingerir, type ResultadoIngesta } from "@/lib/ingesta";
import { DEMO_MODE, DEMO_AVISO } from "@/lib/demo";

function falla(mensaje: string): ResultadoIngesta {
  return { ok: false, insertadas: 0, errores: [], totalFilas: 0, mensaje };
}

/** Conecta un Sheet o sube un CSV para el cliente indicado (operador). */
export async function conectarFuente(
  _prev: ResultadoIngesta | null,
  formData: FormData,
): Promise<ResultadoIngesta> {
  await requireOperador();
  if (DEMO_MODE) return falla(DEMO_AVISO);

  const empresaId = String(formData.get("empresaId") ?? "");
  const tipo = String(formData.get("tipo") ?? "");
  if (!empresaId) return falla("Falta el cliente.");

  const empresa = await getEmpresaPorId(empresaId);
  const supabase = await createClient();

  if (tipo === "sheet") {
    const url = String(formData.get("url") ?? "").trim();
    if (!url) return falla("Pega la URL del Google Sheet.");
    const res = await ingerir(supabase, empresa, "sheet", { url });
    if (res.ok) revalidatePath(`/clientes/${empresaId}/dashboard`);
    return res;
  }

  if (tipo === "csv") {
    const contenido = String(formData.get("contenido") ?? "");
    if (!contenido.trim()) return falla("Sube un archivo CSV con los movimientos.");
    const res = await ingerir(supabase, empresa, "csv", { contenido });
    if (res.ok) revalidatePath(`/clientes/${empresaId}/dashboard`);
    return res;
  }

  return falla("Elige una fuente de datos.");
}
