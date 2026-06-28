"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { archivoAFilas, esArchivoSoportado } from "@/lib/leer-archivo";
import {
  sugerirMapeo,
  aplicarMapeo,
  detectarFilaEncabezado,
  etiquetasColumnas,
  movimientosACsv,
  type Mapeo,
} from "@/lib/mapeo";
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
  const [filas, setFilas] = useState<string[][] | null>(null);
  const [mapeo, setMapeo] = useState<Mapeo | null>(null);

  const [guardado, formAction, guardando] = useActionState<
    ResultadoIngesta | null,
    FormData
  >(action, null);

  const headers = filas && mapeo ? filas[mapeo.filaEncabezado] ?? [] : [];
  const etiquetas = useMemo(() => etiquetasColumnas(headers), [headers]);

  const parse = useMemo(() => {
    if (!filas || !mapeo) return null;
    return aplicarMapeo(filas, mapeo);
  }, [filas, mapeo]);

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

  const contenidoCsv = useMemo(
    () => (parse ? movimientosACsv(parse.movimientos) : ""),
    [parse],
  );

  async function procesar(file: File) {
    setErrorLectura("");
    setFilas(null);
    setMapeo(null);
    setNombre(file.name);

    if (!esArchivoSoportado(file)) {
      setErrorLectura("Formato no soportado. Sube un archivo .xlsx o .csv.");
      return;
    }

    setLeyendo(true);
    try {
      const f = await archivoAFilas(file);
      if (f.length < 2) {
        setErrorLectura("La planilla no tiene datos suficientes.");
        return;
      }
      const idx = detectarFilaEncabezado(f);
      setFilas(f);
      setMapeo(sugerirMapeo(f[idx] ?? [], idx));
    } catch (e) {
      setErrorLectura(
        e instanceof Error ? e.message : "No pudimos leer el archivo.",
      );
    } finally {
      setLeyendo(false);
    }
  }

  function set(patch: Partial<Mapeo>) {
    setMapeo((m) => (m ? { ...m, ...patch } : m));
  }

  function cambiarFilaEncabezado(idx: number) {
    if (!filas) return;
    // Al cambiar la fila de encabezados, re-sugerimos el mapeo con esos títulos.
    setMapeo(sugerirMapeo(filas[idx] ?? [], idx));
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
            onClick={() => document.getElementById("file-input")?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                document.getElementById("file-input")?.click();
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
              {leyendo ? "Leyendo archivo…" : "Arrastra tu Excel o CSV aquí"}
            </p>
            <p className="text-xs text-muted">
              Lo leemos tal como lo tiene tu empresa · .xlsx o .csv
            </p>
            {nombre && !leyendo ? (
              <p className="tabular mt-1 text-xs text-brand-deep">{nombre}</p>
            ) : null}
            <input
              id="file-input"
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

          {filas && mapeo ? (
            <Mapeador
              filas={filas}
              mapeo={mapeo}
              etiquetas={etiquetas}
              set={set}
              cambiarFilaEncabezado={cambiarFilaEncabezado}
            />
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

function Mapeador({
  filas,
  mapeo,
  etiquetas,
  set,
  cambiarFilaEncabezado,
}: {
  filas: string[][];
  mapeo: Mapeo;
  etiquetas: string[];
  set: (patch: Partial<Mapeo>) => void;
  cambiarFilaEncabezado: (idx: number) => void;
}) {
  return (
    <Card className="space-y-4">
      <div>
        <h3 className="font-display text-base font-bold text-ink">
          ¿Cómo leemos tu planilla?
        </h3>
        <p className="mt-1 text-xs text-muted">
          Adivinamos las columnas. Revisa y ajusta si algo no calza — el panel se
          actualiza al instante.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Fila de los títulos">
          <select
            className={inputClass}
            value={mapeo.filaEncabezado}
            onChange={(e) => cambiarFilaEncabezado(Number(e.target.value))}
          >
            {filas.slice(0, 8).map((_, i) => (
              <option key={i} value={i}>
                Fila {i + 1}
              </option>
            ))}
          </select>
        </Field>

        <ColSelect
          label="Fecha"
          etiquetas={etiquetas}
          value={mapeo.fecha}
          onChange={(v) => set({ fecha: v ?? 0 })}
        />
      </div>

      <Field label="¿Cómo se distinguen ingresos de gastos?">
        <select
          className={inputClass}
          value={mapeo.tipoEstrategia}
          onChange={(e) => {
            const tipoEstrategia = e.target.value as Mapeo["tipoEstrategia"];
            // rellena defaults razonables al cambiar de estrategia
            set({
              tipoEstrategia,
              montoCol: mapeo.montoCol ?? 0,
              tipoCol: mapeo.tipoCol ?? 0,
              ingresosCol: mapeo.ingresosCol ?? 0,
              gastosCol: mapeo.gastosCol ?? 0,
            });
          }}
        >
          <option value="columna">Una columna dice el tipo (ingreso/gasto)</option>
          <option value="signo">Un monto: negativo = gasto, positivo = ingreso</option>
          <option value="dos-columnas">Columnas separadas de ingresos y gastos</option>
          <option value="fijo">Todo el archivo es de un solo tipo</option>
        </select>
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        {mapeo.tipoEstrategia === "columna" ? (
          <>
            <ColSelect
              label="Columna del tipo"
              etiquetas={etiquetas}
              value={mapeo.tipoCol}
              onChange={(v) => set({ tipoCol: v })}
            />
            <ColSelect
              label="Columna del monto"
              etiquetas={etiquetas}
              value={mapeo.montoCol}
              onChange={(v) => set({ montoCol: v })}
            />
          </>
        ) : null}

        {mapeo.tipoEstrategia === "signo" ? (
          <ColSelect
            label="Columna del monto (con signo)"
            etiquetas={etiquetas}
            value={mapeo.montoCol}
            onChange={(v) => set({ montoCol: v })}
          />
        ) : null}

        {mapeo.tipoEstrategia === "dos-columnas" ? (
          <>
            <ColSelect
              label="Columna de ingresos"
              etiquetas={etiquetas}
              value={mapeo.ingresosCol}
              onChange={(v) => set({ ingresosCol: v })}
            />
            <ColSelect
              label="Columna de gastos"
              etiquetas={etiquetas}
              value={mapeo.gastosCol}
              onChange={(v) => set({ gastosCol: v })}
            />
          </>
        ) : null}

        {mapeo.tipoEstrategia === "fijo" ? (
          <>
            <ColSelect
              label="Columna del monto"
              etiquetas={etiquetas}
              value={mapeo.montoCol}
              onChange={(v) => set({ montoCol: v })}
            />
            <Field label="Todo es…">
              <select
                className={inputClass}
                value={mapeo.tipoFijo}
                onChange={(e) =>
                  set({ tipoFijo: e.target.value as "ingreso" | "gasto" })
                }
              >
                <option value="ingreso">Ingreso</option>
                <option value="gasto">Gasto</option>
              </select>
            </Field>
          </>
        ) : null}

        <ColSelect
          label="Categoría (opcional)"
          etiquetas={etiquetas}
          value={mapeo.categoria}
          onChange={(v) => set({ categoria: v })}
          opcional
        />
        <ColSelect
          label="Descripción (opcional)"
          etiquetas={etiquetas}
          value={mapeo.descripcion}
          onChange={(v) => set({ descripcion: v })}
          opcional
        />
      </div>
    </Card>
  );
}

function ColSelect({
  label,
  etiquetas,
  value,
  onChange,
  opcional = false,
}: {
  label: string;
  etiquetas: string[];
  value: number | null;
  onChange: (v: number | null) => void;
  opcional?: boolean;
}) {
  return (
    <Field label={label}>
      <select
        className={inputClass}
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
      >
        {opcional ? <option value="">— ninguna —</option> : null}
        {etiquetas.map((et, i) => (
          <option key={i} value={i}>
            {et}
          </option>
        ))}
      </select>
    </Field>
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
  parse: ReturnType<typeof aplicarMapeo>;
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
      <Card
        className={
          validos > 0 ? "border-brand/30 bg-brand/5" : "border-danger/30 bg-danger/5"
        }
      >
        <p
          className={`text-sm font-medium ${validos > 0 ? "text-brand-deep" : "text-danger-deep"}`}
        >
          {validos > 0
            ? `${validos} movimiento(s) leídos correctamente`
            : "No encontramos movimientos válidos con este mapeo"}
          {parse.errores.length > 0
            ? ` · ${parse.errores.length} con problemas`
            : ""}
        </p>
        {parse.errores.length > 0 ? (
          <ul className="mt-2 max-h-40 space-y-1 overflow-auto text-xs text-danger-deep">
            {parse.errores.slice(0, 30).map((e, i) => (
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
