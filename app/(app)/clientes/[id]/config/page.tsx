import { requireOperador, getEmpresaPorId } from "@/lib/operador";
import { Card } from "@/components/ui";
import { ConfigForm } from "@/components/ConfigForm";
import { SharePanel } from "@/components/SharePanel";
import { actualizarEmpresa } from "./actions";

export default async function ClienteConfig({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOperador();
  const { id } = await params;
  const empresa = await getEmpresaPorId(id);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">Ajustes</h2>
        <p className="mt-1 text-sm text-muted">
          Datos del cliente, plan y el link que le compartes.
        </p>
      </div>

      <Card>
        <ConfigForm empresa={empresa} action={actualizarEmpresa} />
      </Card>

      <Card>
        <SharePanel
          empresaId={empresa.id}
          tokenInicial={empresa.public_token}
          publicoInicial={empresa.panel_publico}
        />
      </Card>
    </div>
  );
}
