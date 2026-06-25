"use client";

import { useState } from "react";
import { Button, inputClass } from "@/components/ui";

type Estado = "idle" | "enviando" | "ok" | "error";

export function WaitlistForm({ fuente = "landing" }: { fuente?: string }) {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<Estado>("idle");
  const [mensaje, setMensaje] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    setMensaje("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fuente }),
      });
      const data = await res.json();

      if (!res.ok) {
        setEstado("error");
        setMensaje(data.error ?? "No pudimos guardar tu correo. Intenta de nuevo.");
        return;
      }

      setEstado("ok");
      setMensaje("¡Listo! Te avisamos apenas tengamos un cupo para ti.");
      setEmail("");
    } catch {
      setEstado("error");
      setMensaje("Hubo un problema de conexión. Intenta de nuevo en un rato.");
    }
  }

  if (estado === "ok") {
    return (
      <div
        className="rounded-card border border-brand/30 bg-brand/5 p-4 text-sm text-brand-deep"
        role="status"
      >
        {mensaje}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.cl"
          aria-label="Tu correo"
          className={inputClass}
          disabled={estado === "enviando"}
        />
        <Button type="submit" disabled={estado === "enviando"} className="shrink-0">
          {estado === "enviando" ? "Enviando…" : "Quiero un cupo"}
        </Button>
      </div>
      {estado === "error" ? (
        <p className="text-sm text-red-700" role="alert">
          {mensaje}
        </p>
      ) : (
        <p className="text-xs text-muted">
          Sin spam. Te escribimos solo cuando haya cupo de socio fundador.
        </p>
      )}
    </form>
  );
}
