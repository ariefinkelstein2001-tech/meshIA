/**
 * Dispara el resumen semanal manualmente (§ Fase 4 — "puedo disparar el
 * resumen de una empresa de prueba y llega el correo").
 *
 * Uso:
 *   pnpm resumen                 # todas las empresas
 *   pnpm resumen <empresaId>     # una empresa puntual
 *
 * Requiere las variables de entorno de Supabase (service role) y Resend.
 * Carga .env.local automáticamente.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

cargarEnv();

async function main() {
  const empresaId = process.argv[2];
  // Import dinámico: las libs usan "server-only" y env vars ya cargadas.
  const { enviarResumenes } = await import("../lib/resumen-runner");
  const resultados = await enviarResumenes(empresaId ? { empresaId } : undefined);

  console.log("\nResumen semanal — resultados:\n");
  for (const r of resultados) {
    const estado = r.enviado
      ? r.simulado
        ? "SIMULADO (sin RESEND_API_KEY)"
        : "ENVIADO"
      : `OMITIDO (${r.motivo ?? "error"})`;
    console.log(`  • ${r.empresa} → ${r.email ?? "sin email"} — ${estado}`);
  }
  console.log("");
}

function cargarEnv() {
  for (const archivo of [".env.local", ".env"]) {
    try {
      const contenido = readFileSync(resolve(process.cwd(), archivo), "utf8");
      for (const linea of contenido.split("\n")) {
        const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
        }
      }
    } catch {
      // archivo no existe, seguimos
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
