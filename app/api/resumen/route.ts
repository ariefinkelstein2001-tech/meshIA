import { NextResponse } from "next/server";
import { enviarResumenes } from "@/lib/resumen-runner";

/**
 * Endpoint del resumen semanal (§ Fase 4).
 *
 * - GET: lo llama el cron de Vercel (ver vercel.json). Protegido con CRON_SECRET
 *   vía header Authorization: Bearer <CRON_SECRET>.
 * - POST { empresaId }: dispara el resumen de una empresa puntual (pruebas).
 *
 * Se ejecuta en runtime Node (usa service role + Resend).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function autorizado(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  try {
    const resultados = await enviarResumenes();
    return NextResponse.json({ ok: true, resultados });
  } catch (e) {
    console.error("[resumen] error:", e);
    return NextResponse.json(
      { error: "Falló el envío de resúmenes." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  let body: { empresaId?: string } = {};
  try {
    body = await request.json();
  } catch {
    // sin body: corre para todas
  }
  try {
    const resultados = await enviarResumenes({ empresaId: body.empresaId });
    return NextResponse.json({ ok: true, resultados });
  } catch (e) {
    console.error("[resumen] error:", e);
    return NextResponse.json(
      { error: "Falló el envío de resúmenes." },
      { status: 500 },
    );
  }
}
