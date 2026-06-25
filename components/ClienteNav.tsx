"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ClienteNav({ empresaId }: { empresaId: string }) {
  const pathname = usePathname();
  const base = `/clientes/${empresaId}`;
  const links = [
    { href: `${base}/dashboard`, label: "Pulso" },
    { href: `${base}/datos`, label: "Datos" },
    { href: `${base}/config`, label: "Ajustes" },
  ];

  return (
    <nav className="flex gap-1">
      {links.map((l) => {
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
