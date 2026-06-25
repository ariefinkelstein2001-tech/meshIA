import { Card, Pill } from "@/components/ui";

type Tono = "neutro" | "bueno" | "danger";

const numColor: Record<Tono, string> = {
  neutro: "text-ink",
  bueno: "text-brand-deep",
  danger: "text-danger-deep",
};

export interface KpiPill {
  tono: "bueno" | "alerta" | "danger" | "neutro";
  texto: string;
  /** Flecha opcional: 'up' | 'down'. */
  dir?: "up" | "down";
}

/**
 * Tarjeta KPI del dashboard Pulso.
 * - Etiqueta chica en mayúsculas mono (identidad de datos)
 * - Número grande en CLP, Space Mono (tabular)
 * - Pill verde/ámbar/danger con el % de cambio o un caption de contexto
 */
export function StatCard({
  label,
  valor,
  tono = "neutro",
  pill,
  caption,
}: {
  label: string;
  valor: string;
  tono?: Tono;
  pill?: KpiPill;
  caption?: string;
}) {
  return (
    <Card hover className="flex flex-col">
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted sm:text-[11px]">
        {label}
      </div>
      <div
        className={`tabular mt-2 text-2xl font-bold leading-none sm:text-[28px] ${numColor[tono]}`}
      >
        {valor}
      </div>
      <div className="mt-2.5 min-h-[20px]">
        {pill ? (
          <Pill tono={pill.tono}>
            {pill.dir === "up" ? "▲" : pill.dir === "down" ? "▼" : null}
            {pill.texto}
          </Pill>
        ) : caption ? (
          <span className="text-xs text-muted">{caption}</span>
        ) : null}
      </div>
    </Card>
  );
}
