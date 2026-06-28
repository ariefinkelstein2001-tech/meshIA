"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { archivoACsv, esArchivoSoportado } from "@/lib/leer-archivo";
import { parsearPlanilla, type ResultadoParseo } from "@/lib/parsers";
import { calcularMetricas } from "@/lib/metrics";
import { Button, Card, Field, inputClass } from "@/components/ui";
import { DashboardView } from "@/components/DashboardView";
import type { Empresa, Transaccion } from "@/lib/types";
import type { ResultadoIngesta } from "@/lib/ingesta";

type Accion = (
  prev: ResultadoIngesta | null,
  formData: FormData,
) => Promise<ResultadoIngesta>;

type Tab = "archivo" | "sheet";

export function ConectarDatos({
  empresa,
  action,
}: {
  empresa: Empresa;
  action: Accion;
}) {
  const [tab, setTab] = useState<Tab>("archivo");
  const [dragging, setDragging] = useState(false);
  const [leyendo, setLeyendo] = useState(false);
  const [nombre, setNombre] = useState("");
  const [errorLectura, setErrorLectura] = useState("");
  const [parse, setParse] = useState<ResultadoParseo | null>(null);
  const [contenidoCsv, setContenidoCsv] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [guardado, formAction, guardando] = useActionState<
    ResultadoIngesta | null,
    FormData
  >(action, null);

  // Métricas para la vista previa instantánea (cliente, sin tocar la base).
  const metricas = useMemo(() => {
    if (!parse) return null;
    const txs: Transaccion[] = parse.movimientos.map((mv, i) => ({
      id: `prev-${i}`,
      empresa_id: empresa.id,
      fecha: mv.fecha,
      tipo: mv.tipo,
      categoria: mv.categoria,
      monto: mv.monto,
      descripcion: mv.descripcion || null,
      fuente_id: null,
      created_at: "",
    }));
    return calcularMetricas(txs);
  }, [parse, empresa.id]);

  async function procesar(file: File) {
    setErrorLectura("");
    setParse(null);
    setNombre(file.name);

    if (!esArchivoSoportado(file)) {
      setErrorLectura("Formato no soportado. Sube un archivo .xlsx o .csv.");
      return;
    }

    setLeyendo(true);
    try {
      const csv = await archivoACsv(file);
      const resultado = parsearPlanilla(csv);
      setContenidoCsv(csv);
      setParse(resultado);
    } catch (e) {
      setErrorLectura(
        e instanceof Error ? e.message : "No pudimos leer el archivo.",
      );
    } finally {
      setLeyendo(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) procesar(file);
  }

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-pill border border-line bg-paper p-1">
        <TabBtn activo={tab === "archivo"} onClick={() => setTab("archivo")}>
          Subir archivo
        </TabBtn>
        <TabBtn activo={tab === "sheet"} onClick={() => setTab("sheet")}>
          Google Sheet
        </TabBtn>
      </div>

      {tab === "archivo" ? (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed p-10 text-center transition-colors ${
              dragging
                ? "border-brand bg-brand/5"
                : "border-line bg-paper hover:border-brand/60"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-card bg-brand/10 text-2xl text-brand">
              ⬆
            </div>
            <p className="text-sm font-semibold text-ink">
              {leyendo
                ? "Leyendo archivo…"
                : "Arrastra tu Excel o CSV aquí"}
            </p>
            <p className="text-xs text-muted">
              o haz clic para elegirlo · .xlsx o .csv
            </p>
            {nombre && !leyendo ? (
              <p className="tabular mt-1 text-xs text-brand-deep">{nombre}</p>
            ) : null}
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,text/csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) procesar(file);
              }}
              className="sr-only"
            />
          </div>

          {errorLectura ? (
            <Card className="border-danger/30 bg-danger/5">
              <p className="text-sm font-medium text-danger-deep" role="alert">
                {errorLectura}
              </p>
            </Card>
          ) : null}

          {parse ? (
            <Resultado
              parse={parse}
              metricas={metricas}
              empresa={empresa}
              contenidoCsv={contenidoCsv}
              formAction={formAction}
              guardando={guardando}
              guardado={guardado}
            />
          ) : null}
        </>
      ) : (
        <Card>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="tipo" value="sheet" />
            <input type="hidden" name="empresaId" value={empresa.id} />
            <Field
              label="URL del Google Sheet"
              hint="Publica la planilla o compártela como 'cualquiera con el enlace'."
            >
              <input
                name="url"
                type="url"
                required
                placeholder="https://docs.google.com/spreadsheets/d/…"
                className={inputClass}
              />
            </Field>
            <Button type="submit" disabled={guardando}>
              {guardando ? "Conectando…" : "Conectar y sincronizar"}
            </Button>
            {guardado ? (
              <p
                className={`text-sm ${guardado.ok ? "text-brand-deep" : "text-danger-deep"}`}
                role="status"
              >
                {guardado.mensaje}
              </p>
            ) : null}
          </form>
        </Card>
      )}
    </div>
  );
}

function Resultado({
  parse,
  metricas,
  empresa,
  contenidoCsv,
  formAction,
  guardando,
  guardado,
}: {
  parse: ResultadoParseo;
  metricas: ReturnType<typeof calcularMetricas> | null;
  empresa: Empresa;
  contenidoCsv: string;
  formAction: (fd: FormData) => void;
  guardando: boolean;
  guardado: ResultadoIngesta | null;
}) {
  const validos = parse.movimientos.length;

  return (
    <div className="space-y-4">
      <Card className={validos > 0 ? "border-brand/30 bg-brand/5" : "border-danger/30 bg-danger/5"}>
        <p className={`text-sm font-medium ${validos > 0 ? "text-brand-deep" : "text-danger-deep"}`}>
          {validos > 0
            ? `${validos} movimiento(s) leídos correctamente`
            : "No encontramos movimientos válidos"}
          {parse.errores.length > 0 ? ` · ${parse.errores.length} con problemas` : ""}
        </p>
        {parse.errores.length > 0 ? (
          <ul className="mt-2 max-h-40 space-y-1 overflow-auto text-xs text-danger-deep">
            {parse.errores.slice(0, 50).map((e, i) => (
              <li key={i}>
                Fila {e.fila}: {e.mensaje}
              </li>
            ))}
          </ul>
        ) : null}
      </Card>

      {metricas?.hayDatos ? (
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Vista previa del panel
            </h3>
            <form action={formAction}>
              <input type="hidden" name="tipo" value="csv" />
              <input type="hidden" name="empresaId" value={empresa.id} />
              <input type="hidden" name="contenido" value={contenidoCsv} />
              <Button type="submit" disabled={guardando}>
                {guardando ? "Guardando…" : `Guardar para ${empresa.nombre}`}
              </Button>
            </form>
          </div>

          {guardado ? (
            <p
              className={`mb-3 text-sm ${guardado.ok ? "text-brand-deep" : "text-danger-deep"}`}
              role="status"
            >
              {guardado.mensaje}
            </p>
          ) : null}

          <Card>
            <DashboardView empresa={empresa} m={metricas} modo="publico" />
          </Card>
        </div>
      ) : null}
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
