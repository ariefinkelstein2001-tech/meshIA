import {
  requireOperador,
  getEmpresaPorId,
  getFuentes,
} from "@/lib/operador";
import { formatFecha } from "@/lib/format";
import { Card } from "@/components/ui";
import { DatosForm } from "@/components/DatosForm";
import { conectarFuente } from "./actions";

export default async function ClienteDatos({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOperador();
  const { id } = await params;
  const empresa = await getEmpresaPorId(id);

  const lista = await getFuentes(empresa.id);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">Datos</h2>
        <p className="mt-1 text-sm text-muted">
          Conecta las ventas y gastos del cliente. Cada sincronización reemplaza
          los datos de esa fuente con la versión más nueva.
        </p>
      </div>

      <DatosForm empresaId={empresa.id} action={conectarFuente} />

      <section>
        <h3 className="mb-3 font-display text-base font-bold text-ink">
          Fuentes conectadas
        </h3>
        {lista.length === 0 ? (
          <p className="text-sm text-muted">
            Todavía no hay ninguna fuente conectada.
          </p>
        ) : (
          <div className="space-y-2">
            {lista.map((f) => (
              <Card key={f.id} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-ink">
                    {f.tipo === "sheet" ? "Google Sheet" : "Archivo CSV"}
                  </span>
                  {typeof f.config?.url === "string" ? (
                    <span className="ml-2 break-all text-xs text-muted">
                      {String(f.config.url)}
                    </span>
                  ) : null}
                </div>
                <span className="shrink-0 text-xs text-muted">
                  {f.last_synced_at
                    ? `Sincronizado ${formatFecha(f.last_synced_at.slice(0, 10))}`
                    : "Sin sincronizar"}
                </span>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card className="bg-paper/60">
        <h3 className="font-display text-sm font-bold text-ink">
          ¿Cómo debe verse la planilla?
        </h3>
        <p className="mt-1 text-xs text-muted">
          Una fila por movimiento, con estas columnas:
        </p>
        <pre className="tabular mt-2 overflow-auto rounded-soft border border-line bg-canvas/60 p-3 text-xs text-ink">
{`fecha,tipo,categoria,monto,descripcion
2025-11-03,ingreso,ventas,120000,Venta tienda
2025-11-04,gasto,arriendo,350000,Arriendo local`}
        </pre>
      </Card>
    </div>
  );
}
