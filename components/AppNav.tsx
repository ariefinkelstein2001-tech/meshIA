"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Pulso" },
  { href: "/datos", label: "Datos" },
  { href: "/config", label: "Ajustes" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-page gap-1 px-3 pb-1">
      {LINKS.map((l) => {
        const activo = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={activo ? "page" : undefined}
            className={`relative px-3 py-2 text-sm font-medium transition-colors ${
              activo ? "text-brand-deep" : "text-muted hover:text-ink"
            }`}
          >
            {l.label}
            {activo ? (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
