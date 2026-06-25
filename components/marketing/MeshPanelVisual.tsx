import { formatCLP } from "@/lib/format";

/**
 * Visual del hero: datos sueltos (mesh) que se ordenan en un panel (Pulso).
 * Decorativo, mobile-first. Sin animación que moleste con prefers-reduced-motion.
 */
export function MeshPanelVisual() {
  return (
    <div
      className="relative rounded-card border border-line bg-paper p-5 shadow-card"
      aria-hidden
    >
      {/* nodos sueltos arriba (la malla) */}
      <div className="mb-4 flex flex-wrap gap-2">
        {["Ventas", "Gastos", "Banco", "Sheet", "CSV"].map((n, i) => (
          <span
            key={n}
            className={`rounded-pill px-2.5 py-1 text-xs ${
              i % 2 === 0
                ? "bg-brand/10 text-brand-deep"
                : "bg-accent/15 text-ink"
            }`}
          >
            {n}
          </span>
        ))}
      </div>

      {/* flecha → */}
      <div className="mb-4 flex items-center gap-2 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        meshIA ordena todo
        <span className="h-px flex-1 bg-line" />
      </div>

      {/* el panel */}
      <div className="grid grid-cols-2 gap-3">
        <MiniStat label="Ingresos del mes" valor={formatCLP(3120000)} up />
        <MiniStat label="Gastos del mes" valor={formatCLP(1840000)} />
        <MiniStat label="Flujo de caja" valor={formatCLP(1280000)} up />
        <MiniStat label="Ventas" valor="48" />
      </div>

      <div className="mt-3 rounded-soft border border-line bg-canvas/60 p-3">
        <div className="mb-2 text-xs text-muted">Ingresos por mes</div>
        <div className="flex h-16 items-end gap-1.5">
          {[40, 52, 48, 63, 58, 72, 80].map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-t bg-brand"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  valor,
  up,
}: {
  label: string;
  valor: string;
  up?: boolean;
}) {
  return (
    <div className="rounded-soft border border-line bg-canvas/60 p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="tabular mt-1 text-lg font-bold text-ink">{valor}</div>
      {up ? <div className="text-xs text-brand">▲ creciendo</div> : null}
    </div>
  );
}
