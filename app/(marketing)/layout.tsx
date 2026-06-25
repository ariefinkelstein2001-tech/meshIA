import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex max-w-page items-center justify-between px-5 py-3.5">
          <Link href="/" aria-label="Inicio meshIA">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/planes"
              className="rounded-pill px-3 py-2 text-sm font-medium text-muted hover:text-ink"
            >
              Planes
            </Link>
            <ButtonLink href="/login" variant="secondary" className="hidden sm:inline-flex">
              Entrar
            </ButtonLink>
            <ButtonLink href="/#waitlist">Quiero meshIA</ButtonLink>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-line/70">
        <div className="mx-auto flex max-w-page flex-col gap-4 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <p>
            Hecho en Chile 🇨🇱 · {new Date().getFullYear()} meshIA · Montos en CLP
          </p>
        </div>
      </footer>
    </div>
  );
}
