"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import {
  togglePanelPublico,
  regenerarToken,
} from "@/app/(app)/clientes/[id]/config/actions";

/**
 * Bloque "compartir": activa el link público de solo lectura del panel,
 * lo copia, y permite regenerar el token (Fase 6 — entrega a la pyme).
 */
export function SharePanel({
  empresaId,
  tokenInicial,
  publicoInicial,
}: {
  empresaId: string;
  tokenInicial: string;
  publicoInicial: boolean;
}) {
  const [publico, setPublico] = useState(publicoInicial);
  const [token, setToken] = useState(tokenInicial);
  const [copiado, setCopiado] = useState(false);
  const [pending, startTransition] = useTransition();

  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const url = `${base}/r/${token}`;

  function toggle() {
    startTransition(async () => {
      const res = await togglePanelPublico(empresaId, !publico);
      if (res.ok) setPublico(res.panel_publico);
    });
  }

  function regenerar() {
    startTransition(async () => {
      const res = await regenerarToken(empresaId);
      if (res.ok) {
        setToken(res.public_token);
        setCopiado(false);
      }
    });
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-base font-bold text-ink">
            Link para la pyme
          </h3>
          <p className="mt-1 text-sm text-muted">
            Panel de solo lectura que le compartes al cliente. No necesita cuenta.
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          role="switch"
          aria-checked={publico}
          aria-label="Activar link público"
          className={`relative mt-1 h-6 w-11 shrink-0 rounded-pill transition-colors ${
            publico ? "bg-brand" : "bg-line"
          } disabled:opacity-60`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-all ${
              publico ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {publico ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={url}
              className="tabular w-full rounded-soft border border-line bg-canvas/60 px-3 py-2 text-xs text-ink"
              onFocus={(e) => e.currentTarget.select()}
            />
            <Button type="button" onClick={copiar} className="shrink-0">
              {copiado ? "¡Copiado!" : "Copiar link"}
            </Button>
          </div>
          <button
            type="button"
            onClick={regenerar}
            disabled={pending}
            className="text-xs font-medium text-muted underline-offset-2 hover:text-ink hover:underline disabled:opacity-60"
          >
            Regenerar link (invalida el anterior)
          </button>
        </div>
      ) : (
        <p className="text-sm text-muted">
          El link está desactivado. Actívalo para compartir el panel.
        </p>
      )}
    </div>
  );
}
