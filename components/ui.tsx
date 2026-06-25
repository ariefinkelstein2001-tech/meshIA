import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill px-5 py-2.5 text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-paper shadow-card hover:bg-brand-deep hover:shadow-md",
  secondary: "bg-paper text-ink border border-line hover:border-brand hover:text-brand-deep",
  ghost: "text-ink hover:bg-paper/60",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: { variant?: Variant } & ComponentProps<"button">) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: { variant?: Variant } & ComponentProps<typeof Link>) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}

export function Card({
  className = "",
  hover = false,
  children,
}: {
  className?: string;
  hover?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-card border border-line bg-paper p-5 shadow-card ${
        hover
          ? "transition-shadow duration-200 hover:shadow-md motion-reduce:transition-none"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-pill border border-line bg-paper px-3 py-1 text-xs font-medium text-muted">
      {children}
    </span>
  );
}

type PillTono = "bueno" | "alerta" | "danger" | "neutro";

const pillTonos: Record<PillTono, string> = {
  bueno: "bg-brand/10 text-brand-deep",
  alerta: "bg-accent/15 text-[var(--danger-deep)]",
  danger: "bg-danger/10 text-danger-deep",
  neutro: "bg-canvas text-muted border border-line",
};

/** Pill compacto para % de cambio y etiquetas de estado (mono, numérico). */
export function Pill({
  tono = "neutro",
  children,
}: {
  tono?: PillTono;
  children: ReactNode;
}) {
  return (
    <span
      className={`tabular inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-medium ${pillTonos[tono]}`}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-soft border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none";
