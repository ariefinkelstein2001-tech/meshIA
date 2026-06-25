import Link from "next/link";
import { getEmpresaActual } from "@/lib/empresa";
import { Logo } from "@/components/Logo";
import { PLANES } from "@/lib/planes";
import { AppNav } from "@/components/AppNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { empresa, userEmail } = await getEmpresaActual();

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" aria-label="Inicio Pulso">
              <Logo />
            </Link>
            <span className="hidden rounded-pill border border-line bg-paper px-2.5 py-1 text-xs text-muted sm:inline">
              {empresa.nombre} · {PLANES[empresa.plan].nombre}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted md:inline">
              {userEmail}
            </span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-pill px-3 py-1.5 text-sm font-medium text-muted hover:text-ink"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
        <AppNav />
      </header>

      <main className="mx-auto max-w-page px-5 py-8">{children}</main>
    </div>
  );
}
