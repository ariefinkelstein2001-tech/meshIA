import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function PanelNoEncontrado() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-5 text-center">
      <Logo />
      <h1 className="font-display text-2xl font-bold text-ink">
        Este panel no está disponible
      </h1>
      <p className="max-w-sm text-sm text-muted">
        El link puede estar desactivado o haber cambiado. Pídele a tu contacto en
        meshIA el enlace actualizado.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-brand transition-colors hover:text-brand-deep"
      >
        Ir a meshIA →
      </Link>
    </main>
  );
}
