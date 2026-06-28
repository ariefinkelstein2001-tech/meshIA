# meshIA

Plataforma para independientes y pymes chicas en Chile. Dos productos: **Pulso**
(dashboard de ventas, gastos y flujo de caja) y **Sitio** (páginas web). Todo en
CLP, en español, mobile-first.

La spec viva del proyecto está en [`BRIEF.md`](./BRIEF.md).

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** con los tokens del sistema de diseño
- **Supabase** (Postgres + Auth con magic link) con Row Level Security
- **Recharts** para gráficos
- **Resend** para emails (resumen semanal)
- Deploy en **Vercel** · Gestor de paquetes **pnpm**

## Puesta en marcha

```bash
pnpm install
cp .env.example .env.local   # completa los valores (ver abajo)
pnpm dev                      # http://localhost:3000
```

### Base de datos

1. Crea un proyecto en [Supabase](https://supabase.com) (free tier).
2. En **SQL Editor**, pega y corre [`supabase/schema.sql`](./supabase/schema.sql).
   Crea las tablas, la RLS y la tabla `operadores` (allowlist del equipo).
   **Edita la semilla** del final con los correos de tus operadores.
3. En **Authentication → URL Configuration**, agrega
   `http://localhost:3000/auth/callback` (y tu dominio de Vercel) como redirect.

### Variables de entorno

Documentadas en [`.env.example`](./.env.example):

| Variable                          | Para qué                                             |
| --------------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | URL del proyecto Supabase                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Anon key (cliente, respeta RLS)                      |
| `SUPABASE_SERVICE_ROLE_KEY`       | Service role (solo server: cron de resumen)          |
| `RESEND_API_KEY` / `RESEND_FROM`  | Envío de emails del resumen semanal                  |
| `NEXT_PUBLIC_SITE_URL`            | URL pública (magic link, links de email)             |
| `CRON_SECRET`                     | Protege el endpoint `/api/resumen` del cron          |

## Scripts

```bash
pnpm dev          # desarrollo
pnpm build        # build de producción
pnpm start        # sirve el build
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm resumen      # dispara el resumen semanal (todas o `pnpm resumen <empresaId>`)
```

## Estructura

```
app/
  (marketing)/             landing + /planes (públicas)
  (app)/clientes           consola interna: lista de clientes (operador)
  (app)/clientes/nuevo     crear cliente
  (app)/clientes/[id]/     dashboard · datos · config por cliente
  r/[token]                panel público de solo lectura (lo que ve la pyme)
  login, auth/             magic link del equipo + callback + signout
  api/                     waitlist, ingesta, resumen
components/
  DashboardView.tsx        panel Pulso reutilizado (consola + link público)
  DatosForm, ConfigForm, SharePanel, ClienteNav, charts, ui, StatCard
lib/
  format.ts                formato CLP es-CL
  parsers.ts               parser de planillas con validación en español
  metrics.ts               cálculos del dashboard
  resumen.ts               texto del resumen semanal
  planes.ts                catálogo de planes + reglas de gating
  operador.ts              sesión de operador + acceso a empresas (consola)
  ingesta.ts               núcleo de la ingesta (Sheet/CSV → transacciones)
  supabase/                clients (browser, server, middleware)
  adapters/                sheet, csv (implementados) + banco, sii, pagos (stubs)
fixtures/                  planillas CSV de ejemplo
supabase/schema.sql        esquema + RLS + operadores
scripts/resumen.ts         runner manual del resumen semanal
```

## Datos del cliente

El cliente entrega una planilla (Google Sheet publicado o CSV) con una fila por
movimiento. Columnas: `fecha, tipo, categoria, monto, descripcion`. Ejemplos en
[`fixtures/`](./fixtures). El parser valida y reporta errores claros por fila;
acepta fechas `YYYY-MM-DD` y `DD/MM/YYYY`, y montos con `$`/puntos de miles.

## Estado por fases

- [x] **Fase 0 — Setup.** Next.js + TS + Tailwind con tokens y fuentes, clients
      de Supabase, branding, README. Listo para desplegar a Vercel.
- [x] **Fase 1 — Marketing.** Landing portada a `(marketing)`, página de planes,
      waitlist real → tabla `waitlist` vía `/api/waitlist`.
- [x] **Fase 2 — Auth + empresas.** Login con magic link, empresa creada al
      registrarse (trigger), `/config`, RLS activa.
- [x] **Fase 3 — Pulso.** `/datos` (Sheet/CSV → parsea → guarda), `/dashboard`
      con KPIs, gráficos (Recharts) y estados de vacío/error.
- [x] **Fase 4 — Resumen semanal.** Texto por empresa enviado con Resend, cron de
      Vercel (`vercel.json`), stub `enviarWhatsapp()`, `pnpm resumen`.
- [x] **Fase 5 — Planes (gating, sin cobro).** Límites por `empresa.plan`
      (fuentes, acceso a Pulso, resumen). Stubs de banco/SII/pagos.
- [x] **Fase 6 — Consola interna (hecho-para-ti).** La app autenticada es para el
      **equipo meshIA** (operadores, allowlist en `operadores`): administra muchas
      pymes en `/clientes`, arma el Pulso de cada una y comparte un **link público
      de solo lectura** (`/r/[token]`). Las pymes **no inician sesión**.

## Suposiciones (las simples, como pide el brief)

- **`meshia.html` no estaba en el repo** al iniciar. La landing se reconstruyó
  desde el copy y la estructura descritos en el brief (§7), reutilizando los
  tokens y las secciones. Si aparece el HTML original, se puede afinar el copy.
- **Consola interna (Fase 6).** Un **operador** (correo en `operadores`) administra
  **todas** las empresas de los clientes; no hay asignación por-operador todavía.
  Las pymes no tienen cuenta: reciben el link público `/r/[token]` (token UUID
  inadivinable, con on/off y regeneración). El acceso público se resuelve
  server-side con la service role, así la RLS se mantiene simple.
- **Ingesta = reemplazo por fuente.** Se mantiene una fuente por tipo
  (`sheet`/`csv`) por empresa; cada sincronización reemplaza sus transacciones,
  así re-subir la misma planilla no duplica datos.
- **Sin cobro** (Fase 5): los planes solo controlan gating, no hay pasarela.
- Pagos en Chile previstos: **Flow / Mercado Pago / Webpay** (no Stripe).

## Modo demo (temporal)

Si **no** hay `NEXT_PUBLIC_SUPABASE_URL` configurada, la app entra en **modo demo**
(`lib/demo.ts`): la consola interna se abre **sin login** y muestra **datos de
ejemplo** (no se guardan). Sirve para ver/usar el panel antes de conectar la base.
En cuanto se configuran las llaves de Supabase, el modo demo **se apaga solo** y
vuelve a exigir login + datos reales.

## Notas

- Sin dependencias pesadas fuera del stack del brief. El parser CSV es propio
  (sin librerías) para mantener liviano el bundle.
- Deploy: conectar el repo a Vercel, setear las env vars y desplegar.
- **Diseño**: toda la app (no solo la landing) usa los tokens del §5 y las fuentes
  Bricolage / Inter / Space Mono. Los montos van siempre en Space Mono (tabular).
  Componentes compartidos en `components/ui.tsx` (`Button`, `Card`, `Field`,
  `Pill`) y `components/StatCard.tsx` (KPIs).
- **Token `--danger`** (`#b3412c`): extensión de paleta — el §5 no define un rojo.
  Se usa solo para flujo negativo y estados de error, afinado con los verdes.
- **Cron desactivado**: `vercel.json` tiene `crons: []` para no enviar correos
  reales durante pruebas. Para reactivarlo, agrega al array `crons` el objeto
  `{ "path": "/api/resumen", "schedule": "0 13 * * 1" }`. (Vercel no admite
  comentarios ni claves extra en `vercel.json`.) El resumen igual se puede
  disparar a mano con `pnpm resumen <empresaId>`.
