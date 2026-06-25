-- ============================================================================
-- meshIA — esquema de base de datos (Supabase / Postgres)
-- Modelo de datos del brief §6 + Fase 6 (consola interna "hecho-para-ti").
-- Montos en CLP como entero (bigint, sin decimales).
--
-- Cómo aplicarlo:
--   Supabase Studio -> SQL Editor -> pega este archivo -> Run.
-- Es idempotente: se puede correr varias veces (sobre una DB nueva o sobre la v1).
--
-- Modelo de acceso (Fase 6): la app es interna, para el EQUIPO meshIA.
-- Un "operador" (correo en la tabla `operadores`) administra TODAS las empresas
-- de los clientes. Las pymes NO inician sesión: reciben un link público de solo
-- lectura (empresas.public_token) que el equipo les comparte.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table if not exists empresas (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  slug          text not null unique,
  plan          text not null default 'pulso' check (plan in ('sitio', 'pulso', 'pro')),
  owner_user_id uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now()
);

-- Columnas de la Fase 6 (idempotentes para DB que ya tenía la v1).
alter table empresas alter column owner_user_id drop not null;
alter table empresas add column if not exists created_by uuid references auth.users (id) on delete set null;
alter table empresas add column if not exists public_token uuid not null default gen_random_uuid();
alter table empresas add column if not exists panel_publico boolean not null default false;

-- Allowlist del equipo. Solo estos correos pueden entrar a la consola.
create table if not exists operadores (
  email      text primary key,
  created_at timestamptz not null default now()
);

create table if not exists fuentes (
  id             uuid primary key default gen_random_uuid(),
  empresa_id     uuid not null references empresas (id) on delete cascade,
  tipo           text not null check (tipo in ('sheet', 'csv')),
  config         jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz
);

create table if not exists transacciones (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references empresas (id) on delete cascade,
  fecha       date not null,
  tipo        text not null check (tipo in ('ingreso', 'gasto')),
  categoria   text not null,
  monto       bigint not null check (monto >= 0),
  descripcion text,
  fuente_id   uuid references fuentes (id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  fuente     text,
  created_at timestamptz not null default now()
);

-- Índices.
create index if not exists idx_tx_empresa_fecha on transacciones (empresa_id, fecha);
create index if not exists idx_fuentes_empresa on fuentes (empresa_id);
create unique index if not exists idx_empresas_public_token on empresas (public_token);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Operadores (equipo) ven y administran TODAS las empresas y sus datos.
-- La lectura pública del panel NO pasa por aquí: el server la resuelve con la
-- service role, scopeada por public_token (ver lib/supabase/server.ts).
-- ---------------------------------------------------------------------------

alter table empresas      enable row level security;
alter table fuentes       enable row level security;
alter table transacciones enable row level security;
alter table operadores    enable row level security;
alter table waitlist      enable row level security;

-- Helper: ¿el usuario autenticado es operador del equipo?
create or replace function es_operador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from operadores
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- Limpia las policies/objetos del modelo anterior (Fase 2), si existían.
drop policy if exists "empresas: dueño lee" on empresas;
drop policy if exists "empresas: dueño crea" on empresas;
drop policy if exists "empresas: dueño actualiza" on empresas;
drop policy if exists "fuentes: de mi empresa" on fuentes;
drop policy if exists "transacciones: de mi empresa" on transacciones;
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists crear_empresa_para_usuario();
drop function if exists es_mi_empresa(uuid);

-- empresas / fuentes / transacciones: acceso total para operadores.
drop policy if exists "empresas: operador" on empresas;
create policy "empresas: operador" on empresas
  for all using (es_operador()) with check (es_operador());

drop policy if exists "fuentes: operador" on fuentes;
create policy "fuentes: operador" on fuentes
  for all using (es_operador()) with check (es_operador());

drop policy if exists "transacciones: operador" on transacciones;
create policy "transacciones: operador" on transacciones
  for all using (es_operador()) with check (es_operador());

-- operadores: un operador puede ver la lista (para administración); nadie más.
drop policy if exists "operadores: lee operador" on operadores;
create policy "operadores: lee operador" on operadores
  for select using (es_operador());

-- waitlist: cualquiera (anon) puede inscribirse; nadie la lee con anon key.
drop policy if exists "waitlist: inserta público" on waitlist;
create policy "waitlist: inserta público" on waitlist
  for insert to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- Semilla del equipo. CAMBIA / AGREGA los correos de tus operadores aquí.
-- Solo estos correos podrán entrar a la consola interna.
-- ---------------------------------------------------------------------------
insert into operadores (email) values
  ('arie.finkelstein2001@gmail.com')
on conflict (email) do nothing;
