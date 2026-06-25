"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getEmpresaActual } from "@/lib/empresa";
import { ingerir, type ResultadoIngesta } from "@/lib/ingesta";

/** Server action para la pantalla /datos: conecta un Sheet o sube un CSV. */
export async function conectarFuente(
  _prev: ResultadoIngesta | null,
  formData: FormData,
): Promise<ResultadoIngesta> {
  const tipo = String(formData.get("tipo") ?? "");
  const { empresa } = await getEmpresaActual();
  const supabase = await createClient();

  if (tipo === "sheet") {
    const url = String(formData.get("url") ?? "").trim();
    if (!url) {
      return {
        ok: false,
        insertadas: 0,
        errores: [],
        totalFilas: 0,
        mensaje: "Pega la URL de tu Google Sheet.",
      };
    }
    const res = await ingerir(supabase, empresa, "sheet", { url });
    if (res.ok) revalidatePath("/dashboard");
    return res;
  }

  if (tipo === "csv") {
    const contenido = String(formData.get("contenido") ?? "");
    if (!contenido.trim()) {
      return {
        ok: false,
        insertadas: 0,
        errores: [],
        totalFilas: 0,
        mensaje: "Sube un archivo CSV con tus movimientos.",
      };
    }
    const res = await ingerir(supabase, empresa, "csv", { contenido });
    if (res.ok) revalidatePath("/dashboard");
    return res;
  }

  return {
    ok: false,
    insertadas: 0,
    errores: [],
    totalFilas: 0,
    mensaje: "Elige una fuente de datos.",
  };
}
