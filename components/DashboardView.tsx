import { formatCLP, formatCLPSigned, formatPct } from "@/lib/format";
import type { MetricasDashboard } from "@/lib/metrics";
import type { Empresa } from "@/lib/types";
import { Card, ButtonLink, Pill } from "@/components/ui";
import { StatCard, type KpiPill } from "@/components/StatCard";
import { IngresosPorMes, GastosPorCategoria, Sparkline } from "@/components/charts";

/**
 * Panel Pulso (presentacional). Reutilizado por:
 *  - la consola interna (operador): /clientes/[id]/dashboard
 *  - el link público de solo lectura: /r/[token]
 *
 * En modo "publico" no muestra el botón de editar datos.
 */
export function DashboardView({
  empresa,
  m,
  modo = "operador",
  datosHref,
}: {
  empresa: Empresa;
  m: MetricasDashboard;
  modo?: "operador" | "publico";
  datosHref?: string;
}) {
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
        {modo === "operador" && datosHref ? (
          <ButtonLink href={datosHref} variant="secondary">
            Actualizar datos
          </ButtonLink>
        ) : null}
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
export function IconoPanel({ className = "" }: { className?: string }) {
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

export function EstadoVacioPanel({
  datosHref,
  modo = "operador",
}: {
  datosHref?: string;
  modo?: "operador" | "publico";
}) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-card bg-brand/10 text-brand">
        <IconoPanel className="h-7 w-7" />
      </div>
      <h1 className="font-display text-xl font-bold text-ink">
        Aún no hay datos en este Pulso
      </h1>
      <p className="mt-2 text-sm text-muted">
        {modo === "operador"
          ? "Conecta un Google Sheet o sube un CSV con las ventas y gastos del cliente."
          : "Tu panel está listo, pero todavía no tiene movimientos cargados."}
      </p>
      {modo === "operador" && datosHref ? (
        <div className="mt-6">
          <ButtonLink href={datosHref}>Conectar datos</ButtonLink>
        </div>
      ) : null}
    </div>
  );
}
