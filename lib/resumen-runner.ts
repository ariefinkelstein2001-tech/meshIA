import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { tieneResumenSemanal } from "@/lib/planes";
import {
  calcularResumenSemanal,
  armarTextoResumen,
  armarHtmlResumen,
} from "@/lib/resumen";
import { enviarEmail } from "@/lib/email";
import type { Empresa, Transaccion } from "@/lib/types";

/**
 * Genera y envía el resumen semanal (§ Fase 4).
 * Usa el service client (salta RLS) porque corre como job de confianza:
 * desde el cron de Vercel o el script `pnpm resumen`.
 */

export interface ResultadoEnvio {
  empresa: string;
  email: string | null;
  enviado: boolean;
  simulado?: boolean;
  motivo?: string;
}

export async function enviarResumenes(opciones?: {
  empresaId?: string;
  hoy?: Date;
}): Promise<ResultadoEnvio[]> {
  const supabase = createServiceClient();
  const hoy = opciones?.hoy ?? new Date();

  let query = supabase.from("empresas").select("*");
  if (opciones?.empresaId) query = query.eq("id", opciones.empresaId);
  const { data: empresas, error } = await query;

  if (error || !empresas) {
    throw new Error("No pudimos leer las empresas.");
  }

  const resultados: ResultadoEnvio[] = [];

  for (const empresa of empresas as Empresa[]) {
    if (!tieneResumenSemanal(empresa.plan)) {
      resultados.push({
        empresa: empresa.nombre,
        email: null,
        enviado: false,
        motivo: "El plan no incluye resumen semanal.",
      });
      continue;
    }

    const { data: txs } = await supabase
      .from("transacciones")
      .select("*")
      .eq("empresa_id", empresa.id);

    const resumen = calcularResumenSemanal(
      empresa,
      (txs ?? []) as Transaccion[],
      hoy,
    );

    // En el modelo de consola interna (Fase 6) las pymes no tienen cuenta, así
    // que normalmente no hay correo asociado. El email queda como canal futuro
    // (la entrega principal es el link público /r/[token]). Si la empresa tiene
    // un owner con correo, igual se lo enviamos.
    if (!empresa.owner_user_id) {
      resultados.push({
        empresa: empresa.nombre,
        email: null,
        enviado: false,
        motivo: "Sin correo de contacto (entrega vía link público).",
      });
      continue;
    }

    const { data: userData } = await supabase.auth.admin.getUserById(
      empresa.owner_user_id,
    );
    const email = userData?.user?.email ?? null;

    if (!email) {
      resultados.push({
        empresa: empresa.nombre,
        email: null,
        enviado: false,
        motivo: "No encontramos el correo del dueño.",
      });
      continue;
    }

    const envio = await enviarEmail({
      to: email,
      subject: `Tu resumen semanal — ${empresa.nombre}`,
      text: armarTextoResumen(resumen),
      html: armarHtmlResumen(resumen),
    });

    resultados.push({
      empresa: empresa.nombre,
      email,
      enviado: envio.ok,
      simulado: envio.simulado,
    });
  }

  return resultados;
}
