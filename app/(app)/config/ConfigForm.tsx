"use client";

import { useState, useTransition } from "react";
import { actualizarEmpresa } from "./actions";
import { PLANES_LISTA } from "@/lib/planes";
import { formatCLP } from "@/lib/format";
import { Button, Field, inputClass } from "@/components/ui";
import type { Empresa } from "@/lib/types";

export function ConfigForm({ empresa }: { empresa: Empresa }) {
  const [pending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(
    null,
  );

  function onSubmit(formData: FormData) {
    setMensaje(null);
    startTransition(async () => {
      const res = await actualizarEmpresa(formData);
      if (res?.error) {
        setMensaje({ tipo: "error", texto: res.error });
      } else {
        setMensaje({ tipo: "ok", texto: "Cambios guardados." });
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <Field label="Nombre de la empresa">
        <input
          name="nombre"
          defaultValue={empresa.nombre}
          required
          className={inputClass}
        />
      </Field>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-ink">Plan</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANES_LISTA.map((plan) => (
            <label
              key={plan.id}
              className="flex cursor-pointer items-start gap-3 rounded-soft border border-line bg-paper p-3 has-[:checked]:border-brand has-[:checked]:ring-1 has-[:checked]:ring-brand"
            >
              <input
                type="radio"
                name="plan"
                value={plan.id}
                defaultChecked={empresa.plan === plan.id}
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
        <p className="text-xs text-muted">
          Cambiar el plan ajusta qué puedes hacer (ej. cuántas fuentes conectar).
          Aún no se cobra.
        </p>
      </fieldset>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar cambios"}
        </Button>
        {mensaje ? (
          <span
            role="status"
            className={`text-sm ${
              mensaje.tipo === "ok" ? "text-brand-deep" : "text-red-700"
            }`}
          >
            {mensaje.texto}
          </span>
        ) : null}
      </div>
    </form>
  );
}
