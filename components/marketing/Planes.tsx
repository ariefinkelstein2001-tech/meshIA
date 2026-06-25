import { PLANES_LISTA } from "@/lib/planes";
import { formatCLP } from "@/lib/format";
import { Badge, ButtonLink, Card } from "@/components/ui";

/** Grilla de planes reutilizada en la landing y en /planes. */
export function Planes() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {PLANES_LISTA.map((plan) => (
        <Card
          key={plan.id}
          className={`flex flex-col ${
            plan.destacado ? "ring-2 ring-brand" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-ink">
              {plan.nombre}
            </h3>
            {plan.destacado ? <Badge>Más elegido</Badge> : null}
          </div>

          <p className="mt-1 text-sm text-muted">{plan.pitch}</p>

          <p className="mt-4">
            <span className="tabular text-3xl font-bold text-ink">
              {formatCLP(plan.precio)}
            </span>
            <span className="text-sm text-muted"> /mes</span>
          </p>

          <ul className="mt-4 space-y-2 text-sm text-ink">
            {plan.features.map((f) => (
              <li key={f} className="flex gap-2">
                <span aria-hidden className="text-brand">
                  ✓
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-2">
            <ButtonLink
              href="/#waitlist"
              variant={plan.destacado ? "primary" : "secondary"}
              className="w-full"
            >
              Quiero {plan.nombre}
            </ButtonLink>
          </div>
        </Card>
      ))}
    </div>
  );
}
