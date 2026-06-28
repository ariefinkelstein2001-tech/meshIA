/** Marca meshIA: dos arcadas (gris + verde) que forman una "m" tipo malla. */

const GRIS = "#8e9591";
const VERDE = "#6fb23f";

/** Lockup horizontal: símbolo + "meshIA". Se usa en headers y footers. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Mark className="h-7 w-auto" />
      <span className="font-display text-xl font-bold tracking-tight text-ink">
        mesh<span style={{ color: VERDE }}>IA</span>
      </span>
    </span>
  );
}

/** Solo el símbolo (dos arcadas). */
export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 58"
      className={className}
      role="img"
      aria-label="meshIA"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        fill="none"
        strokeWidth={13}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* arcada izquierda (gris) */}
        <path d="M9 50 L9 21 A12 12 0 0 1 33 21 L33 50" stroke={GRIS} />
        {/* arcada derecha (verde), encima */}
        <path d="M31 50 L31 21 A12 12 0 0 1 55 21 L55 50" stroke={VERDE} />
      </g>
    </svg>
  );
}

/** Versión apilada (símbolo arriba, wordmark abajo). Para portadas/og-image. */
export function LogoStacked({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <Mark className="h-12 w-auto" />
      <span className="font-display text-2xl font-bold tracking-tight text-ink">
        mesh<span style={{ color: VERDE }}>IA</span>
      </span>
    </span>
  );
}
