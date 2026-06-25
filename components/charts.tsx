"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCLP } from "@/lib/format";

const BRAND = "#0f7a5a";
const ACCENT = "#f0a92b";
const MUTED = "#586860";
const LINE = "#d6dcd4";

const PALETA = [BRAND, ACCENT, "#0a5a42", "#86a397", "#c98a1f", "#3f5b50"];

function montoCorto(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${n}`;
}

/** Ingresos vs gastos por mes (líneas). */
export function IngresosPorMes({
  data,
}: {
  data: { etiqueta: string; ingresos: number; gastos: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <XAxis
          dataKey="etiqueta"
          tick={{ fill: MUTED, fontSize: 12 }}
          axisLine={{ stroke: LINE }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={montoCorto}
          tick={{ fill: MUTED, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          formatter={(v: number) => formatCLP(v)}
          labelStyle={{ color: "#14201c" }}
          contentStyle={{
            borderRadius: 12,
            border: `1px solid ${LINE}`,
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="ingresos"
          name="Ingresos"
          stroke={BRAND}
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="gastos"
          name="Gastos"
          stroke={ACCENT}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
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
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 38)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
      >
        <XAxis type="number" hide tickFormatter={montoCorto} />
        <YAxis
          type="category"
          dataKey="categoria"
          tick={{ fill: "#14201c", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={96}
        />
        <Tooltip
          formatter={(v: number) => formatCLP(v)}
          contentStyle={{
            borderRadius: 12,
            border: `1px solid ${LINE}`,
            fontSize: 12,
          }}
          cursor={{ fill: "rgba(15,122,90,0.06)" }}
        />
        <Bar dataKey="monto" name="Gasto" radius={[0, 6, 6, 0]}>
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
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={puntos} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <Area
          type="monotone"
          dataKey="v"
          stroke={BRAND}
          strokeWidth={2}
          fill="rgba(15,122,90,0.12)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
