import type { CSSProperties } from "react";
import { Pill } from "@/components/ui";

/**
 * Firma de la landing: las fuentes sueltas del negocio (ventas, gastos, banco,
 * planilla, caja) se ordenan en un solo Pulso con el número claro en pesos.
 * Es la tesis de meshIA — el desorden se vuelve claridad — y el nombre (mesh).
 * Animación de entrada por CSS; respeta prefers-reduced-motion (globals).
 */

const FUENTES: { t: string; rot: string; tono: "verde" | "ambar" }[] = [
  { t: "Ventas", rot: "-5deg", tono: "verde" },
  { t: "Gastos", rot: "4deg", tono: "ambar" },
  { t: "Banco", rot: "-3deg", tono: "verde" },
  { t: "Planilla", rot: "6deg", tono: "ambar" },
  { t: "Caja", rot: "-2deg", tono: "verde" },
];

const BARRAS = [38, 52, 46, 61, 55, 70, 84];

export function HeroPulso() {
  return (
    <div className="relative">
      {/* halo cálido sutil detrás del panel (único acento ámbar) */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[28px] bg-accent/10 blur-2xl"
      />
      <div className="rounded-card border border-line bg-paper p-6 shadow-card">
        {/* número-tesis */}
        <div
          className="anim-rise"
          style={{ animationDelay: "0.05s" } as CSSProperties}
        >
          <p className="eyebrow">Pulso · noviembre</p>
          <p className="tabular mt-2 text-[2.75rem] font-bold leading-none text-brand-deep sm:text-5xl">
            $1.280.000
          </p>
          <p className="mt-2 flex items-center gap-2">
            <span className="eyebrow">Te quedó este mes</span>
            <Pill tono="bueno">▲ 12%</Pill>
          </p>
        </div>

        {/* las fuentes sueltas que se ordenan (mesh) */}
        <div className="mt-6 flex flex-wrap gap-2">
          {FUENTES.map((f, i) => (
            <span
              key={f.t}
              className={`anim-settle rounded-pill border px-2.5 py-1 text-xs font-medium ${
                f.tono === "verde"
                  ? "border-brand/20 bg-brand/5 text-brand-deep"
                  : "border-accent/30 bg-accent/10 text-ink"
              }`}
              style={
                {
                  animationDelay: `${0.22 + i * 0.09}s`,
                  "--rot": f.rot,
                } as CSSProperties
              }
            >
              {f.t}
            </span>
          ))}
        </div>

        {/* mini gráfico */}
        <div
          className="anim-rise mt-5 rounded-soft border border-line bg-canvas/50 p-3"
          style={{ animationDelay: "0.35s" } as CSSProperties}
        >
          <p className="eyebrow">Ingresos por mes</p>
          <div className="mt-2 flex h-20 items-end gap-1.5">
            {BARRAS.map((h, i) => (
              <span
                key={i}
                className="anim-bar flex-1 rounded-t bg-brand"
                style={
                  {
                    height: `${h}%`,
                    animationDelay: `${0.5 + i * 0.06}s`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
