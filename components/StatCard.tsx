import { Card } from "@/components/ui";
import { formatPct } from "@/lib/format";

export function StatCard({
  label,
  valor,
  delta,
  tono = "neutro",
}: {
  label: string;
  valor: string;
  delta?: number;
  tono?: "neutro" | "bueno" | "alerta";
}) {
  const color =
    tono === "bueno"
      ? "text-brand-deep"
      : tono === "alerta"
        ? "text-red-700"
        : "text-ink";

  return (
    <Card>
      <div className="text-sm text-muted">{label}</div>
      <div className={`tabular mt-1 text-2xl font-bold ${color}`}>{valor}</div>
      {delta !== undefined ? (
        <div
          className={`mt-1 text-xs ${
            delta >= 0 ? "text-brand" : "text-red-700"
          }`}
        >
          {delta >= 0 ? "▲" : "▼"} {formatPct(delta)} vs mes anterior
        </div>
      ) : null}
    </Card>
  );
}
