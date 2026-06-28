import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { ConectarDatos } from "@/components/ConectarDatos";
import type { Empresa } from "@/lib/types";

export const metadata: Metadata = {
  title: "Prueba meshIA — sube tu Excel y mira tu Pulso",
  description:
    "Suelta tu Excel o CSV y arma tu dashboard al instante. Sin cuenta, sin instalar nada.",
};

// Empresa ficticia solo para la vista previa (no se guarda nada).
const NEGOCIO: Empresa = {
  id: "probar",
  nombre: "Tu negocio",
  slug: "probar",
  plan: "pulso",
  owner_user_id: null,
  created_by: null,
  public_token: "",
  panel_publico: false,
  created_at: "",
};

export default function ProbarPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line/70">
        <div className="mx-auto flex max-w-page items-center justify-between px-5 py-3.5">
          <Link href="/" aria-label="Inicio meshIA">
            <Logo />
          </Link>
          <span className="eyebrow">Prueba gratis</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12">
        <p className="eyebrow">Sube tu Excel · mira tu Pulso</p>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[0.98] tracking-[-0.02em] text-ink">
          Tira tu planilla y arma tu dashboard al toque
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
          Suelta tu Excel o CSV como lo tengas. Lo leemos, ordenamos las columnas
          y te mostramos tus números del mes. No necesitas cuenta ni instalar
          nada — esto es una prueba, no se guarda.
        </p>

        <div className="mt-10">
          <ConectarDatos empresa={NEGOCIO} standalone />
        </div>

        <div className="mt-12 rounded-card border border-line bg-paper/60 p-5">
          <p className="eyebrow">¿Te gustó?</p>
          <p className="mt-2 text-sm text-ink">
            Lo dejamos andando por ti con tus datos de verdad y te mandamos un
            link para mirarlo cuando quieras.
          </p>
          <Link
            href="/#waitlist"
            className="mt-3 inline-block text-sm font-semibold text-brand hover:text-brand-deep"
          >
            Quiero un cupo →
          </Link>
        </div>
      </main>
    </div>
  );
}
