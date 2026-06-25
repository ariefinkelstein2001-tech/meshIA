"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { Button, Field, inputClass } from "@/components/ui";
import { esEmailValido } from "@/lib/validate";

function LoginInner() {
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">(
    "idle",
  );
  const [mensaje, setMensaje] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!esEmailValido(email)) {
      setEstado("error");
      setMensaje("Escribe un correo válido, por ejemplo tu@correo.cl.");
      return;
    }
    setEstado("enviando");
    setMensaje("");

    const supabase = createClient();
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setEstado("error");
      setMensaje("No pudimos enviar el enlace. Intenta de nuevo en un rato.");
      return;
    }
    setEstado("ok");
    setMensaje("Te enviamos un enlace mágico. Revisa tu correo para entrar.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 inline-block" aria-label="Inicio">
          <Logo />
        </Link>

        <div className="rounded-card border border-line bg-paper p-6 shadow-card">
          <h1 className="font-display text-2xl font-bold text-ink">Entrar</h1>
          <p className="mt-1 text-sm text-muted">
            Te mandamos un enlace mágico al correo. Sin contraseñas.
          </p>

          {estado === "ok" ? (
            <div
              className="mt-5 rounded-soft border border-brand/30 bg-brand/5 p-4 text-sm text-brand-deep"
              role="status"
            >
              {mensaje}
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
              <Field label="Tu correo">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.cl"
                  className={inputClass}
                  disabled={estado === "enviando"}
                />
              </Field>
              {estado === "error" ? (
                <p className="text-sm text-red-700" role="alert">
                  {mensaje}
                </p>
              ) : null}
              <Button
                type="submit"
                className="w-full"
                disabled={estado === "enviando"}
              >
                {estado === "enviando" ? "Enviando…" : "Enviar enlace mágico"}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          ¿Aún no tienes cuenta? Con el mismo enlace creamos tu empresa.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
