import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ingerir } from "@/lib/ingesta";
import type { Empresa, TipoFuente } from "@/lib/types";

/**
 * POST /api/ingesta — versión programática de la ingesta (§4).
 * Body: { tipo: 'sheet'|'csv', url?, contenido? }
 * Requiere sesión; opera sobre la empresa del usuario (RLS).
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { data: empresa } = await supabase
    .from("empresas")
    .select("*")
    .eq("owner_user_id", user.id)
    .single();
  if (!empresa) {
    return NextResponse.json(
      { error: "No encontramos tu empresa." },
      { status: 404 },
    );
  }

  let body: { tipo?: string; url?: string; contenido?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const tipo = body.tipo as TipoFuente;
  if (tipo !== "sheet" && tipo !== "csv") {
    return NextResponse.json(
      { error: "tipo debe ser 'sheet' o 'csv'." },
      { status: 400 },
    );
  }

  const config =
    tipo === "sheet" ? { url: body.url } : { contenido: body.contenido };

  const resultado = await ingerir(supabase, empresa as Empresa, tipo, config);
  return NextResponse.json(resultado, { status: resultado.ok ? 200 : 422 });
}
