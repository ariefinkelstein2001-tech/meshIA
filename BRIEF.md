# meshIA — Brief / spec viva

> Documento de referencia del proyecto. Si algo cambia, se actualiza aquí.

## 1. Qué es meshIA

Plataforma para **independientes y pymes chicas en Chile**. Dos productos:

- **Pulso** (el corazón): un dashboard que junta ventas, gastos y cuentas en un
  panel simple. El dueño entra y en 10 segundos sabe si está ganando plata,
  cuánto le queda y qué está creciendo. Todo en CLP, en español simple,
  mobile-first.
- **Sitio**: páginas web para esos mismos clientes (entrada fácil, ingreso
  recurrente).
- **Pro**: los dos juntos.

**Filosofía:** servicios primero, producto después. Las primeras ventas son
"hecho-para-ti": nosotros conectamos los datos del cliente. El MVP **no**
necesita conectores automáticos con todo. Necesita: ingerir datos desde Google
Sheets/CSV, mostrarlos claros, y un sitio de marketing que capte interesados.
Lo demás son adaptadores que dejamos preparados pero no implementamos aún.

## 2. Objetivo del repo

Construir, en fases ordenadas y desplegables:

1. El sitio de marketing (la landing es la base, §7).
2. Cuentas/login para los clientes.
3. El dashboard Pulso leyendo desde Google Sheets/CSV.
4. El resumen semanal automático.

**No construir:** integraciones con banco, SII ni pasarelas de pago (solo dejar
las interfaces listas). No microservicios. No features que nadie pidió.

## 3. Stack técnico (exacto)

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS (con los tokens de §5)
- Supabase (Postgres + Auth con magic link) — free tier
- Recharts para gráficos
- `Intl.NumberFormat('es-CL')` para todos los montos (CLP, sin decimales)
- Resend para emails (resumen semanal). WhatsApp queda para después.
- Deploy en Vercel
- Gestor de paquetes: pnpm

Documentar todas las variables de entorno en `.env.example` y el README.

## 4. Estructura

```
/app
  /(marketing)      -> landing, planes (rutas públicas)
  /(app)/dashboard  -> el panel Pulso (requiere login)
  /(app)/datos      -> conectar/subir fuentes de datos
  /(app)/config     -> ajustes de la empresa
  /api              -> endpoints (ingesta, resumen, waitlist)
/components
/lib                -> supabase client, formato CLP, parsers
/lib/adapters       -> adapters de fuentes (sheet, csv, y stubs: banco, sii, pagos)
```

## 5. Sistema de diseño

Tokens (CSS variables / Tailwind):

```
--ink: #14201c        (texto / oscuros)
--canvas: #edf0ea     (fondo)
--paper: #fbfcfa      (tarjetas)
--brand: #0f7a5a      (verde primario)
--brand-deep: #0a5a42
--accent: #f0a92b     (ámbar, acento cálido)
--line: #d6dcd4       (bordes hairline)
--muted: #586860      (texto secundario)
```

Tipografías: **Bricolage Grotesque** (títulos/display), **Inter** (cuerpo),
**Space Mono** (números, montos). Bordes redondeados ~14–18px. Mobile-first.
Accesible: foco visible por teclado, respeta `prefers-reduced-motion`.

## 6. Modelo de datos (Supabase)

```
empresas       (id, nombre, slug, plan['sitio'|'pulso'|'pro'], owner_user_id, created_at)
fuentes        (id, empresa_id, tipo['sheet'|'csv'], config jsonb, last_synced_at)
transacciones  (id, empresa_id, fecha date, tipo['ingreso'|'gasto'],
                categoria text, monto bigint, descripcion text, fuente_id, created_at)
waitlist       (id, email, fuente text, created_at)
```

`monto` en CLP como entero (sin decimales). Auth la maneja Supabase Auth; cada
usuario pertenece a una empresa. Row Level Security: cada empresa solo ve sus
datos.

## 7. La landing

Base del sitio de marketing: hero con visual "mesh → panel", problema, qué ves
en Pulso, integraciones, planes, socios fundadores. El formulario de lista de
espera se conecta de verdad a la tabla `waitlist` vía `/api/waitlist`.

> Nota: el archivo `meshia.html` mencionado en el brief original no estaba en el
> repo al iniciar. La landing se reconstruyó desde el copy y la estructura
> descritos aquí, usando los tokens de §5. Ver el README (Suposiciones).

## 8. Esquema de la planilla del cliente

Una fila por movimiento:

| fecha      | tipo    | categoria | monto  | descripcion     |
| ---------- | ------- | --------- | ------ | --------------- |
| 2025-11-03 | ingreso | ventas    | 120000 | Venta tienda    |
| 2025-11-04 | gasto   | arriendo  | 350000 | Arriendo local  |

Planillas de ejemplo en `/fixtures`.

## 9. Fases

- **Fase 0 — Setup.** Next.js + TS + Tailwind con tokens y fuentes, Supabase
  conectado, deploy a Vercel, README inicial.
- **Fase 1 — Marketing.** Landing en `(marketing)`, página de planes, waitlist
  real → tabla `waitlist`.
- **Fase 2 — Auth + empresas.** Login con magic link. Al registrarse se crea una
  empresa. Config básica. RLS activo.
- **Fase 3 — Pulso (núcleo).** `/datos` (pegar URL de Sheet o subir CSV → parsea
  → guarda). `/dashboard` con ingresos/gastos del mes, flujo, crecimiento,
  conteo de ventas. Gráficos. Estados de vacío/error claros.
- **Fase 4 — Resumen semanal.** Texto por empresa enviado por email con Resend.
  Stub `enviarWhatsapp()`. Programable (cron de Vercel).
- **Fase 5 — Planes (gating, sin cobro).** Features limitadas según `empresa.plan`.
  Stubs e interfaces para banco (Fintoc), SII y pagos (Flow / Mercado Pago /
  Webpay — **Stripe no opera tarjetas locales en Chile, no usarlo**).

## 10. Reglas

- Commits chicos y descriptivos. Actualiza el README en cada fase.
- Pregunta antes de cambios destructivos (borrar tablas, reescribir archivos
  grandes).
- Formatea SIEMPRE los montos con
  `Intl.NumberFormat('es-CL', { style:'currency', currency:'CLP', maximumFractionDigits:0 })`.
- Copy claro y específico, en chileno neutro.
- No agregar dependencias pesadas sin justificarlo en el README.
