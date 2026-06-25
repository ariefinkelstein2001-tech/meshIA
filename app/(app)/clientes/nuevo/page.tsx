import Link from "next/link";
import { requireOperador } from "@/lib/operador";
import { Card } from "@/components/ui";
import { NuevoClienteForm } from "./NuevoClienteForm";

export default async function NuevoClientePage() {
  await requireOperador();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href="/clientes"
          className="text-sm text-muted transition-colors hover:text-ink"
        >
          ← Clientes
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink">
          Nuevo cliente
        </h1>
        <p className="mt-1 text-sm text-muted">
          Crea la ficha del cliente. Después conectas su Google Sheet o CSV.
        </p>
      </div>
      <Card>
        <NuevoClienteForm />
      </Card>
    </div>
  );
}
