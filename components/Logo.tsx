/** Marca meshIA: un nodo "mesh" que se ordena en un panel. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Mark className="h-7 w-7" />
      <span className="font-display text-xl font-bold tracking-tight text-ink">
        mesh<span className="text-brand">IA</span>
      </span>
    </span>
  );
}

export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="meshIA"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="9" fill="var(--brand)" />
      {/* nodos de la malla */}
      <circle cx="10" cy="10" r="2.4" fill="var(--paper)" />
      <circle cx="22" cy="10" r="2.4" fill="var(--paper)" />
      <circle cx="10" cy="22" r="2.4" fill="var(--accent)" />
      <circle cx="22" cy="22" r="2.4" fill="var(--paper)" />
      {/* conexiones */}
      <path
        d="M10 10h12M10 10v12M22 10v12M10 22h12"
        stroke="var(--paper)"
        strokeWidth="1.4"
        strokeOpacity="0.6"
      />
    </svg>
  );
}
