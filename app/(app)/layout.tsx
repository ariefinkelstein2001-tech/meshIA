import Link from "next/link";
import { requireOperador } from "@/lib/operador";
import { DEMO_MODE } from "@/lib/demo";
import { Logo } from "@/components/Logo";

/** Shell de la consola interna (equipo meshIA). */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const operador = await requireOperador();

  return (
    <div className="min-h-screen bg-canvas">
      {DEMO_MODE ? (
        <div className="bg-accent/15 px-5 py-2 text-center text-xs text-ink">
          <span className="font-mono uppercase tracking-[0.12em]">Modo demo</span>
          {" · "}datos de ejemplo, no se guardan. Conecta Supabase para usarla de
          verdad.
        </div>
      ) : null}

      <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-3">
            <Link href="/clientes" aria-label="Inicio consola">
              <Logo />
            </Link>
            <span className="hidden rounded-pill border border-line bg-paper px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted sm:inline">
              Consola interna
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted md:inline">
              {operador.email}
            </span>
            {DEMO_MODE ? null : (
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded-pill px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
                >
                  Salir
                </button>
              </form>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-page px-5 py-8">{children}</main>
    </div>
  );
}
