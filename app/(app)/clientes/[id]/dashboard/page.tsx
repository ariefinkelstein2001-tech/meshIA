import { requireOperador, getEmpresaPorId } from "@/lib/operador";
import { createClient } from "@/lib/supabase/server";
import { calcularMetricas } from "@/lib/metrics";
import { puedeUsarPulso } from "@/lib/planes";
import type { Transaccion } from "@/lib/types";
import { Card, ButtonLink } from "@/components/ui";
import {
  DashboardView,
  EstadoVacioPanel,
  IconoPanel,
} from "@/components/DashboardView";

export default async function ClienteDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOperador();
  const { id } = await params;
  const empresa = await getEmpresaPorId(id);

  if (!puedeUsarPulso(empresa.plan)) {
    return (
      <Card className="text-center">
        <h2 className="font-display text-lg font-bold text-ink">
          Este plan no incluye Pulso
        </h2>
        <p className="mt-2 text-sm text-muted">
          Cambia el plan del cliente a Pulso o Pro en Ajustes para ver su panel.
        </p>
        <div className="mt-4">
          <ButtonLink href={`/clientes/${id}/config`} variant="secondary">
            Ir a Ajustes
          </ButtonLink>
        </div>
      </Card>
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transacciones")
    .select("*")
    .eq("empresa_id", empresa.id)
    .order("fecha", { ascending: true });

  if (error) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-card bg-danger/10 text-danger-deep">
          <IconoPanel className="h-7 w-7" />
        </div>
        <h2 className="font-display text-xl font-bold text-ink">
          No pudimos cargar los datos
        </h2>
        <p className="mt-2 text-sm text-muted">
          Hubo un problema al leer el Pulso. Recarga en un rato.
        </p>
      </Card>
    );
  }

  const m = calcularMetricas((data ?? []) as Transaccion[]);

  if (!m.hayDatos) {
    return <EstadoVacioPanel datosHref={`/clientes/${id}/datos`} />;
  }

  return (
    <DashboardView empresa={empresa} m={m} datosHref={`/clientes/${id}/datos`} />
  );
}
