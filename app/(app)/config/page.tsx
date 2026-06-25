import { getEmpresaActual } from "@/lib/empresa";
import { ConfigForm } from "./ConfigForm";
import { Card } from "@/components/ui";

export default async function ConfigPage() {
  const { empresa, userEmail } = await getEmpresaActual();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Ajustes</h1>
        <p className="mt-1 text-sm text-muted">
          Datos de tu empresa y plan. Sesión iniciada como {userEmail}.
        </p>
      </div>

      <Card>
        <ConfigForm empresa={empresa} />
      </Card>
    </div>
  );
}
