import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdapter, AdapterError } from "@/lib/adapters";
import { maxFuentes } from "@/lib/planes";
import type { Empresa, TipoFuente } from "@/lib/types";

/**
 * Núcleo de la ingesta (§ Fase 3). Reutilizado por el server action de /datos
 * y por el endpoint /api/ingesta.
 *
 * Estrategia MVP (anotada en el README): mantenemos UNA fuente por (empresa, tipo).
 * Cada ingesta reemplaza las transacciones de esa fuente — así re-subir la misma
 * planilla no duplica datos.
 */

export interface ResultadoIngesta {
  ok: boolean;
  insertadas: number;
  errores: { fila: number; mensaje: string }[];
  totalFilas: number;
  mensaje: string;
}

export async function ingerir(
  supabase: SupabaseClient,
  empresa: Empresa,
  tipo: TipoFuente,
  config: Record<string, unknown>,
): Promise<ResultadoIngesta> {
  const adapter = getAdapter(tipo);
  if (!adapter) {
    return falla(`Tipo de fuente no soportado: ${tipo}.`);
  }

  // 1) Trae y valida los movimientos desde la fuente.
  let resultado;
  try {
    resultado = await adapter.obtenerMovimientos(config);
  } catch (e) {
    const msg =
      e instanceof AdapterError
        ? e.message
        : "No pudimos leer la fuente de datos. Intenta de nuevo.";
    return falla(msg);
  }

  const { movimientos, errores, totalFilas } = resultado;

  if (movimientos.length === 0) {
    return {
      ok: false,
      insertadas: 0,
      errores,
      totalFilas,
      mensaje:
        errores.length > 0
          ? "No se guardó nada: revisa los errores y vuelve a intentar."
          : "La planilla no tiene movimientos para guardar.",
    };
  }

  // 2) Gating por plan: respeta el máximo de fuentes.
  const { data: fuenteExistente } = await supabase
    .from("fuentes")
    .select("id")
    .eq("empresa_id", empresa.id)
    .eq("tipo", tipo)
    .maybeSingle();

  if (!fuenteExistente) {
    const { count } = await supabase
      .from("fuentes")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresa.id);
    if ((count ?? 0) >= maxFuentes(empresa.plan)) {
      return falla(
        `Tu plan permite hasta ${maxFuentes(empresa.plan)} fuente(s) de datos. Cámbiate de plan para conectar más.`,
      );
    }
  }

  // 3) Upsert de la fuente (una por tipo).
  let fuenteId = fuenteExistente?.id as string | undefined;
  if (fuenteId) {
    await supabase
      .from("fuentes")
      .update({ config, last_synced_at: new Date().toISOString() })
      .eq("id", fuenteId);
    // Reemplazo: borra lo anterior de esta fuente.
    await supabase.from("transacciones").delete().eq("fuente_id", fuenteId);
  } else {
    const { data: nueva, error: errFuente } = await supabase
      .from("fuentes")
      .insert({
        empresa_id: empresa.id,
        tipo,
        config,
        last_synced_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (errFuente || !nueva) {
      return falla("No pudimos registrar la fuente de datos.");
    }
    fuenteId = nueva.id;
  }

  // 4) Inserta las transacciones.
  const filas = movimientos.map((mv) => ({
    empresa_id: empresa.id,
    fecha: mv.fecha,
    tipo: mv.tipo,
    categoria: mv.categoria,
    monto: mv.monto,
    descripcion: mv.descripcion || null,
    fuente_id: fuenteId,
  }));

  const { error: errInsert } = await supabase.from("transacciones").insert(filas);
  if (errInsert) {
    return falla("No pudimos guardar las transacciones. Intenta de nuevo.");
  }

  return {
    ok: true,
    insertadas: movimientos.length,
    errores,
    totalFilas,
    mensaje:
      errores.length > 0
        ? `Guardamos ${movimientos.length} movimiento(s). ${errores.length} fila(s) tenían problemas y se omitieron.`
        : `Listo: guardamos ${movimientos.length} movimiento(s).`,
  };
}

function falla(mensaje: string): ResultadoIngesta {
  return { ok: false, insertadas: 0, errores: [], totalFilas: 0, mensaje };
}
