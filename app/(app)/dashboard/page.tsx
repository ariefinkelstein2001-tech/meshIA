import Link from "next/link";
import { getEmpresaActual } from "@/lib/empresa";
import { createClient } from "@/lib/supabase/server";
import { calcularMetricas } from "@/lib/metrics";
import { formatCLP, formatCLPSigned, formatPct } from "@/lib/format";
import { puedeUsarPulso } from "@/lib/planes";
import type { Transaccion } from "@/lib/types";
import { Card, ButtonLink } from "@/components/ui";
import { StatCard } from "@/components/StatCard";
import {
  IngresosPorMes,
  GastosPorCategoria,
  Sparkline,
} from "@/components/charts";

export default async function DashboardPage() {
  const { empresa } = await getEmpresaActual();

  // Gating (Fase 5): si el plan no incluye Pulso, mostramos un aviso claro.
  if (!puedeUsarPulso(empresa.plan)) {
    return <SinPulso />;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transacciones")
    .select("*")
    .eq("empresa_id", empresa.id)
    .order("fecha", { ascending: true });

  if (error) {
    return (
      <EstadoError mensaje="No pudimos cargar tus datos. Intenta recargar en un rato." />
    );
  }

  const transacciones = (data ?? []) as Transaccion[];
  const m = calcularMetricas(transacciones);

  if (!m.hayDatos) {
    return <EstadoVacio />;
  }

  const crecimientoTexto = Number.isFinite(m.crecimientoIngresos)
    ? formatPct(m.crecimientoIngresos)
    : "nuevo";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Pulso</h1>
          <p className="text-sm text-muted">
            {empresa.nombre} · mes en curso
          </p>
        </div>
        <ButtonLink href="/datos" variant="secondary">
          Actualizar datos
        </ButtonLink>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Ingresos del mes"
          valor={formatCLP(m.mesActual.ingresos)}
          delta={Number.isFinite(m.crecimientoIngresos) ? m.crecimientoIngresos : undefined}
          tono="bueno"
        />
        <StatCard label="Gastos del mes" valor={formatCLP(m.mesActual.gastos)} />
        <StatCard
          label="Flujo de caja"
          valor={formatCLPSigned(m.mesActual.flujo)}
          tono={m.mesActual.flujo >= 0 ? "bueno" : "alerta"}
        />
        <StatCard label="Ventas del mes" valor={String(m.mesActual.ventas)} />
      </div>

      {/* Sparkline + crecimiento */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted">Tendencia de ingresos</div>
            <div className="text-sm text-ink">
              {crecimientoTexto === "nuevo"
                ? "Primer mes con datos"
                : `${crecimientoTexto} vs el mes anterior`}
            </div>
          </div>
          <div className="w-40">
            <Sparkline data={m.sparkline} />
          </div>
        </div>
      </Card>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-display text-base font-bold text-ink">
            Ingresos y gastos por mes
          </h2>
          <IngresosPorMes data={m.ingresosPorMes} />
        </Card>

        <Card>
          <h2 className="mb-3 font-display text-base font-bold text-ink">
            Gastos por categoría (mes en curso)
          </h2>
          {m.gastosPorCategoria.length > 0 ? (
            <GastosPorCategoria data={m.gastosPorCategoria} />
          ) : (
            <p className="py-8 text-center text-sm text-muted">
              No hay gastos registrados este mes.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

function EstadoVacio() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-card bg-brand/10 text-2xl text-brand">
        ◳
      </div>
      <h1 className="font-display text-xl font-bold text-ink">
        Aún no hay datos en tu Pulso
      </h1>
      <p className="mt-2 text-sm text-muted">
        Conecta un Google Sheet o sube un CSV con tus ventas y gastos. En cuanto
        carguen, verás aquí tus números del mes.
      </p>
      <div className="mt-6">
        <ButtonLink href="/datos">Conectar mis datos</ButtonLink>
      </div>
    </div>
  );
}

function EstadoError({ mensaje }: { mensaje: string }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="font-display text-xl font-bold text-ink">Algo falló</h1>
      <p className="mt-2 text-sm text-muted">{mensaje}</p>
    </div>
  );
}

function SinPulso() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="font-display text-xl font-bold text-ink">
        Pulso no está en tu plan
      </h1>
      <p className="mt-2 text-sm text-muted">
        Tu plan actual no incluye el dashboard Pulso. Cámbiate a Pulso o Pro
        para ver tus números.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <ButtonLink href="/config">Cambiar de plan</ButtonLink>
        <Link
          href="/planes"
          className="inline-flex items-center px-4 py-2 text-sm text-muted hover:text-ink"
        >
          Ver planes
        </Link>
      </div>
    </div>
  );
}
