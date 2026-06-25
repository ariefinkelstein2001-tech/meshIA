import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Cliente de Supabase para Server Components / Route Handlers.
 * Usa la anon key + cookies del usuario, así que respeta Row Level Security.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll falla en Server Components puros; el middleware refresca la sesión.
          }
        },
      },
    },
  );
}

/**
 * Cliente con service role (solo servidor, sin contexto de usuario).
 * Salta RLS — úsalo SOLO en jobs de confianza (ej. ingesta server-side, cron de resumen).
 * Nunca lo expongas al browser.
 */
export function createServiceClient() {
  const { createClient: createSbClient } = require("@supabase/supabase-js");
  return createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
