"use client";

import { useActionState, useRef, useState } from "react";
import { Button, Card, Field, inputClass } from "@/components/ui";
import type { ResultadoIngesta } from "@/lib/ingesta";

type Tab = "sheet" | "csv";

type Accion = (
  prev: ResultadoIngesta | null,
  formData: FormData,
) => Promise<ResultadoIngesta>;

/** Conecta un Sheet o sube un CSV para una empresa (cliente) dada. */
export function DatosForm({
  empresaId,
  action,
}: {
  empresaId: string;
  action: Accion;
}) {
  const [tab, setTab] = useState<Tab>("sheet");
  const [estado, formAction, pending] = useActionState<
    ResultadoIngesta | null,
    FormData
  >(action, null);

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-pill border border-line bg-paper p-1">
        <TabBtn activo={tab === "sheet"} onClick={() => setTab("sheet")}>
          Google Sheet
        </TabBtn>
        <TabBtn activo={tab === "csv"} onClick={() => setTab("csv")}>
          Subir CSV
        </TabBtn>
      </div>

      <Card>
        {tab === "sheet" ? (
          <SheetForm action={formAction} pending={pending} empresaId={empresaId} />
        ) : (
          <CsvForm action={formAction} pending={pending} empresaId={empresaId} />
        )}
      </Card>

      {estado ? <Resultado estado={estado} /> : null}
    </div>
  );
}

function TabBtn({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-pill px-4 py-1.5 text-sm font-medium transition-colors ${
        activo ? "bg-brand text-paper" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function SheetForm({
  action,
  pending,
  empresaId,
}: {
  action: (fd: FormData) => void;
  pending: boolean;
  empresaId: string;
}) {
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="tipo" value="sheet" />
      <input type="hidden" name="empresaId" value={empresaId} />
      <Field
        label="URL del Google Sheet"
        hint="Publica la planilla (Archivo → Compartir → Publicar en la web) o compártela como 'cualquiera con el enlace'."
      >
        <input
          name="url"
          type="url"
          required
          placeholder="https://docs.google.com/spreadsheets/d/…"
          className={inputClass}
        />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Conectando…" : "Conectar y sincronizar"}
      </Button>
    </form>
  );
}

function CsvForm({
  action,
  pending,
  empresaId,
}: {
  action: (fd: FormData) => void;
  pending: boolean;
  empresaId: string;
}) {
  const [contenido, setContenido] = useState("");
  const [nombre, setNombre] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNombre(file.name);
    const reader = new FileReader();
    reader.onload = () => setContenido(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="tipo" value="csv" />
      <input type="hidden" name="empresaId" value={empresaId} />
      <input type="hidden" name="contenido" value={contenido} />

      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink">
          Archivo CSV
        </span>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
          >
            Elegir archivo
          </Button>
          <span className="text-sm text-muted">
            {nombre || "Ningún archivo seleccionado"}
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onFile}
          className="sr-only"
        />
        <p className="mt-1.5 text-xs text-muted">
          Columnas: fecha, tipo, categoria, monto, descripcion.
        </p>
      </div>

      <Button type="submit" disabled={pending || !contenido}>
        {pending ? "Procesando…" : "Subir y guardar"}
      </Button>
    </form>
  );
}

function Resultado({ estado }: { estado: ResultadoIngesta }) {
  return (
    <Card
      className={
        estado.ok ? "border-brand/30 bg-brand/5" : "border-danger/30 bg-danger/5"
      }
    >
      <p
        className={`text-sm font-medium ${
          estado.ok ? "text-brand-deep" : "text-danger-deep"
        }`}
        role="status"
      >
        {estado.mensaje}
      </p>

      {estado.errores.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs font-medium text-muted">
            Filas con problemas ({estado.errores.length}):
          </p>
          <ul className="mt-1 max-h-48 space-y-1 overflow-auto text-xs text-danger-deep">
            {estado.errores.slice(0, 50).map((e, i) => (
              <li key={i}>
                Fila {e.fila}: {e.mensaje}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
