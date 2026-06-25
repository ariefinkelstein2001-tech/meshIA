"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCLP } from "@/lib/format";

// Paleta del brief §5 (nada de colores default de Recharts).
const BRAND = "#0f7a5a";
const BRAND_DEEP = "#0a5a42";
const ACCENT = "#f0a92b";
const INK = "#14201c";
const MUTED = "#586860";
const LINE = "#d6dcd4";

const PALETA = [BRAND, ACCENT, BRAND_DEEP, "#86a397", "#c98a1f", "#3f5b50"];

const MONO = "var(--font-mono), ui-monospace, monospace";

const tickMono = { fill: MUTED, fontSize: 11, fontFamily: MONO };
const tooltipStyle = {
  borderRadius: 14,
  border: `1px solid ${LINE}`,
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(20,32,28,0.10)",
  fontFamily: MONO,
};

function montoCorto(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${n}`;
}

function leyenda(value: string) {
  return <span className="text-xs text-muted">{value}</span>;
}

/** Ingresos (área) vs gastos (línea) por mes. */
export function IngresosPorMes({
  data,
}: {
  data: { etiqueta: string; ingresos: number; gastos: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <defs>
          <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity={0.22} />
            <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={LINE} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="etiqueta"
          tick={tickMono}
          axisLine={{ stroke: LINE }}
          tickLine={false}
          dy={4}
        />
        <YAxis
          tickFormatter={montoCorto}
          tick={tickMono}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          formatter={(v: number) => formatCLP(v)}
          labelStyle={{ color: INK, fontFamily: MONO }}
          contentStyle={tooltipStyle}
          cursor={{ stroke: LINE, strokeWidth: 1 }}
        />
        <Legend
          formatter={leyenda}
          iconType="plainline"
          wrapperStyle={{ paddingTop: 8 }}
        />
        <Area
          type="monotone"
          dataKey="ingresos"
          name="Ingresos"
          stroke={BRAND}
          strokeWidth={2.5}
          fill="url(#gradIngresos)"
          dot={false}
          activeDot={{ r: 4, fill: BRAND }}
        />
        <Line
          type="monotone"
          dataKey="gastos"
          name="Gastos"
          stroke={ACCENT}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: ACCENT }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/** Gastos por categoría (barras horizontales). */
export function GastosPorCategoria({
  data,
}: {
  data: { categoria: string; monto: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 42)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
      >
        <XAxis type="number" hide tickFormatter={montoCorto} />
        <YAxis
          type="category"
          dataKey="categoria"
          tick={{ fill: INK, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={100}
        />
        <Tooltip
          formatter={(v: number) => formatCLP(v)}
          contentStyle={tooltipStyle}
          cursor={{ fill: "rgba(15,122,90,0.06)" }}
        />
        <Bar dataKey="monto" name="Gasto" radius={[0, 6, 6, 0]} barSize={22}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETA[i % PALETA.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Mini sparkline de ingresos. */
export function Sparkline({ data }: { data: number[] }) {
  const puntos = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={puntos} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="gradSpark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity={0.2} />
            <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={BRAND}
          strokeWidth={2}
          fill="url(#gradSpark)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
