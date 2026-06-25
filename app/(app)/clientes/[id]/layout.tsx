import Link from "next/link";
import { requireOperador, getEmpresaPorId } from "@/lib/operador";
import { PLANES } from "@/lib/planes";
import { Badge } from "@/components/ui";
import { ClienteNav } from "@/components/ClienteNav";

export default async function ClienteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  await requireOperador();
  const { id } = await params;
  const empresa = await getEmpresaPorId(id);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          href="/clientes"
          className="text-sm text-muted transition-colors hover:text-ink"
        >
          ← Clientes
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 pb-3">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-xl font-bold text-ink">
              {empresa.nombre}
            </h1>
            <Badge>{PLANES[empresa.plan].nombre}</Badge>
            {empresa.panel_publico ? (
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-brand">
                Link activo
              </span>
            ) : null}
          </div>
          <ClienteNav empresaId={empresa.id} />
        </div>
      </div>

      {children}
    </div>
  );
}
