import Link from "next/link";
import { getEmpresaActual } from "@/lib/empresa";
import { createClient } from "@/lib/supabase/server";
import { calcularMetricas } from "@/lib/metrics";
import { formatCLP, formatCLPSigned, formatPct } from "@/lib/format";
import { puedeUsarPulso } from "@/lib/planes";
import type { Transaccion } from "@/lib/types";
import { Card, ButtonLink, Pill } from "@/components/ui";
import { StatCard, type KpiPill } from "@/components/StatCard";
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
    return <EstadoError />;
  }

  const transacciones = (data ?? []) as Transaccion[];
  const m = calcularMetricas(transacciones);

  if (!m.hayDatos) {
    return <EstadoVacio />;
  }

  const crec = m.crecimientoIngresos;
  const crecFinito = Number.isFinite(crec);

  const gastoCrec =
    m.mesAnterior.gastos > 0
      ? (m.mesActual.gastos - m.mesAnterior.gastos) / m.mesAnterior.gastos
      : m.mesActual.gastos > 0
        ? Infinity
        : 0;
  const gastoCrecFinito = Number.isFinite(gastoCrec);

  const pillIngresos: KpiPill | undefined = crecFinito
    ? {
        tono: crec >= 0 ? "bueno" : "danger",
        dir: crec >= 0 ? "up" : "down",
        texto: ` ${formatPct(crec)}`,
      }
    : undefined;

  const pillGastos: KpiPill | undefined = gastoCrecFinito
    ? {
        tono: gastoCrec > 0 ? "alerta" : "bueno",
        dir: gastoCrec > 0 ? "up" : "down",
        texto: ` ${formatPct(gastoCrec)}`,
      }
    : undefined;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Pulso</h1>
          <p className="text-sm text-muted">{empresa.nombre} · mes en curso</p>
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
          tono="bueno"
          pill={pillIngresos}
          caption={crecFinito ? undefined : "Primer mes con datos"}
        />
        <StatCard
          label="Gastos del mes"
          valor={formatCLP(m.mesActual.gastos)}
          pill={pillGastos}
          caption={gastoCrecFinito ? undefined : "Mes en curso"}
        />
        <StatCard
          label="Flujo de caja"
          valor={formatCLPSigned(m.mesActual.flujo)}
          tono={m.mesActual.flujo >= 0 ? "bueno" : "danger"}
          caption="Ingresos − gastos"
        />
        <StatCard
          label="Crecimiento"
          valor={crecFinito ? formatPct(crec) : "Nuevo"}
          tono={crecFinito ? (crec >= 0 ? "bueno" : "danger") : "neutro"}
          caption="Ingresos vs mes anterior"
        />
      </div>

      {/* Tendencia + ventas */}
      <Card hover>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted sm:text-[11px]">
              Tendencia de ingresos
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              {crecFinito ? (
                <Pill tono={crec >= 0 ? "bueno" : "danger"}>
                  {crec >= 0 ? "▲" : "▼"} {formatPct(crec)}
                </Pill>
              ) : (
                <Pill tono="neutro">Primer mes</Pill>
              )}
              <span className="text-sm text-muted">
                {m.mesActual.ventas} venta{m.mesActual.ventas === 1 ? "" : "s"} este mes
              </span>
            </div>
          </div>
          <div className="w-full sm:w-56">
            <Sparkline data={m.sparkline} />
          </div>
        </div>
      </Card>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card hover>
          <h2 className="mb-1 font-display text-base font-bold text-ink">
            Ingresos y gastos por mes
          </h2>
          <p className="mb-3 text-xs text-muted">Últimos meses con datos, en CLP.</p>
          <IngresosPorMes data={m.ingresosPorMes} />
        </Card>

        <Card hover>
          <h2 className="mb-1 font-display text-base font-bold text-ink">
            Gastos por categoría
          </h2>
          <p className="mb-3 text-xs text-muted">Mes en curso, de mayor a menor.</p>
          {m.gastosPorCategoria.length > 0 ? (
            <GastosPorCategoria data={m.gastosPorCategoria} />
          ) : (
            <p className="py-12 text-center text-sm text-muted">
              No hay gastos registrados este mes.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

/** Ícono cuadrícula reutilizado en los estados (consistente con la marca). */
function IconoPanel({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M3 9h18M9 9v12" />
    </svg>
  );
}

function EstadoVacio() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-card bg-brand/10 text-brand">
        <IconoPanel className="h-7 w-7" />
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

function EstadoError() {
  return (
    <div className="mx-auto max-w-md py-16">
      <Card className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-card bg-danger/10 text-danger-deep">
          <IconoPanel className="h-7 w-7" />
        </div>
        <h1 className="font-display text-xl font-bold text-ink">
          No pudimos cargar tus datos
        </h1>
        <p className="mt-2 text-sm text-muted">
          Hubo un problema al leer tu Pulso. Recarga la página en un rato; si
          sigue pasando, escríbenos.
        </p>
      </Card>
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
