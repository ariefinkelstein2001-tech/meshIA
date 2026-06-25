import Link from "next/link";
import { requireOperador, getEmpresas } from "@/lib/operador";
import { createClient } from "@/lib/supabase/server";
import { PLANES } from "@/lib/planes";
import { formatFecha } from "@/lib/format";
import { Card, ButtonLink, Badge, Pill } from "@/components/ui";
import { IconoPanel } from "@/components/DashboardView";
import type { Fuente } from "@/lib/types";

export default async function ClientesPage() {
  await requireOperador();
  const empresas = await getEmpresas();

  // Resumen de fuentes por empresa (para mostrar última sincronización).
  const supabase = await createClient();
  const { data: fuentesData } = await supabase
    .from("fuentes")
    .select("empresa_id, last_synced_at");
  const fuentes = (fuentesData ?? []) as Pick<Fuente, "empresa_id" | "last_synced_at">[];

  const resumen = new Map<string, { n: number; ultima: string | null }>();
  for (const f of fuentes) {
    const r = resumen.get(f.empresa_id) ?? { n: 0, ultima: null };
    r.n += 1;
    if (f.last_synced_at && (!r.ultima || f.last_synced_at > r.ultima)) {
      r.ultima = f.last_synced_at;
    }
    resumen.set(f.empresa_id, r);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Clientes</h1>
          <p className="text-sm text-muted">
            Las pymes que administras. Conecta sus datos y compárteles el panel.
          </p>
        </div>
        <ButtonLink href="/clientes/nuevo">➕ Nuevo cliente</ButtonLink>
      </header>

      {empresas.length === 0 ? (
        <div className="mx-auto max-w-md py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-card bg-brand/10 text-brand">
            <IconoPanel className="h-7 w-7" />
          </div>
          <h2 className="font-display text-xl font-bold text-ink">
            Aún no tienes clientes
          </h2>
          <p className="mt-2 text-sm text-muted">
            Crea tu primer cliente, conecta su Google Sheet o CSV y arma su Pulso.
          </p>
          <div className="mt-6">
            <ButtonLink href="/clientes/nuevo">Crear primer cliente</ButtonLink>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {empresas.map((e) => {
            const r = resumen.get(e.id);
            return (
              <Link key={e.id} href={`/clientes/${e.id}/dashboard`} className="group">
                <Card hover className="h-full">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-ink">
                      {e.nombre}
                    </h3>
                    <Badge>{PLANES[e.plan].nombre}</Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {e.panel_publico ? (
                      <Pill tono="bueno">Link activo</Pill>
                    ) : (
                      <Pill tono="neutro">Link apagado</Pill>
                    )}
                    <span className="text-xs text-muted">
                      {r?.n ? `${r.n} fuente${r.n === 1 ? "" : "s"}` : "Sin datos"}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-muted">
                    {r?.ultima
                      ? `Sincronizado ${formatFecha(r.ultima.slice(0, 10))}`
                      : "Aún sin sincronizar"}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
