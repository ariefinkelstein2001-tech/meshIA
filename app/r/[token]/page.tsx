import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";
import { calcularMetricas } from "@/lib/metrics";
import { formatFecha } from "@/lib/format";
import { Logo } from "@/components/Logo";
import { DashboardView, EstadoVacioPanel } from "@/components/DashboardView";
import type { Empresa, Transaccion } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tu panel — meshIA",
  robots: { index: false, follow: false },
};

async function getDatosPublicos(token: string) {
  // UUID válido para evitar errores de query con tokens basura.
  if (!/^[0-9a-fA-F-]{36}$/.test(token)) return null;

  const supabase = createServiceClient();
  const { data: empresa } = await supabase
    .from("empresas")
    .select("*")
    .eq("public_token", token)
    .eq("panel_publico", true)
    .maybeSingle();

  if (!empresa) return null;

  const { data: txs } = await supabase
    .from("transacciones")
    .select("*")
    .eq("empresa_id", (empresa as Empresa).id)
    .order("fecha", { ascending: true });

  return { empresa: empresa as Empresa, transacciones: (txs ?? []) as Transaccion[] };
}

export default async function PanelPublico({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const datos = await getDatosPublicos(token);

  if (!datos) {
    notFound();
  }

  const { empresa, transacciones } = datos;
  const m = calcularMetricas(transacciones);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line/70 bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex max-w-page items-center justify-between px-5 py-3">
          <Logo />
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            Solo lectura
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-page px-5 py-8">
        {m.hayDatos ? (
          <DashboardView empresa={empresa} m={m} modo="publico" />
        ) : (
          <EstadoVacioPanel modo="publico" />
        )}
      </main>

      <footer className="border-t border-line/70">
        <div className="mx-auto max-w-page px-5 py-6 text-center text-xs text-muted">
          Panel hecho con <span className="font-semibold text-brand">meshIA</span> ·
          montos en CLP
        </div>
      </footer>
    </div>
  );
}
