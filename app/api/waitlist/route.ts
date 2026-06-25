import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { esEmailValido, normalizarEmail } from "@/lib/validate";

/**
 * POST /api/waitlist — guarda un correo en la tabla `waitlist`.
 * La inserción anónima está permitida por una policy RLS (ver supabase/schema.sql).
 */
export async function POST(request: Request) {
  let body: { email?: string; fuente?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "No pudimos leer tu solicitud." },
      { status: 400 },
    );
  }

  if (!esEmailValido(body.email)) {
    return NextResponse.json(
      { error: "Escribe un correo válido, por ejemplo tu@correo.cl." },
      { status: 400 },
    );
  }

  const email = normalizarEmail(body.email);
  const fuente =
    typeof body.fuente === "string" ? body.fuente.slice(0, 60) : "desconocida";

  const supabase = await createClient();
  const { error } = await supabase.from("waitlist").insert({ email, fuente });

  if (error) {
    // 23505 = unique_violation: el correo ya estaba en la lista. Lo tratamos como éxito.
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, yaEstaba: true });
    }
    console.error("waitlist insert error", error);
    return NextResponse.json(
      { error: "No pudimos guardar tu correo. Intenta de nuevo en un rato." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
