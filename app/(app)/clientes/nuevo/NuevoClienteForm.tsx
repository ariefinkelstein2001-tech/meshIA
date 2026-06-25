"use client";

import { useActionState } from "react";
import { crearCliente } from "../actions";
import { PLANES_LISTA } from "@/lib/planes";
import { formatCLP } from "@/lib/format";
import { Button, Field, inputClass } from "@/components/ui";

export function NuevoClienteForm() {
  const [estado, action, pending] = useActionState(crearCliente, null);

  return (
    <form action={action} className="space-y-6">
      <Field label="Nombre del cliente" hint="El nombre de la pyme o del negocio.">
        <input
          name="nombre"
          required
          autoFocus
          placeholder="Ej: Tienda Don José"
          className={inputClass}
        />
      </Field>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-ink">Plan</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANES_LISTA.map((plan) => (
            <label
              key={plan.id}
              className="flex cursor-pointer items-start gap-3 rounded-soft border border-line bg-paper p-3 transition-colors has-[:checked]:border-brand has-[:checked]:ring-1 has-[:checked]:ring-brand"
            >
              <input
                type="radio"
                name="plan"
                value={plan.id}
                defaultChecked={plan.id === "pulso"}
                className="mt-1 accent-[var(--brand)]"
              />
              <span>
                <span className="block text-sm font-semibold text-ink">
                  {plan.nombre}
                </span>
                <span className="tabular block text-xs text-muted">
                  {formatCLP(plan.precio)}/mes
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Creando…" : "Crear cliente"}
        </Button>
        {estado?.error ? (
          <span role="alert" className="text-sm text-danger-deep">
            {estado.error}
          </span>
        ) : null}
      </div>
    </form>
  );
}
