-- ============================================================================
-- meshIA — esquema de base de datos (Supabase / Postgres)
-- Modelo de datos del brief §6. Montos en CLP como entero (bigint, sin decimales).
--
-- Cómo aplicarlo:
--   Supabase Studio -> SQL Editor -> pega este archivo -> Run.
--   (O psql contra la connection string del proyecto.)
-- Es idempotente: se puede correr varias veces.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table if not exists empresas (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  slug          text not null unique,
  plan          text not null default 'pulso' check (plan in ('sitio', 'pulso', 'pro')),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  created_at    timestamptz not null default now()
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

-- Índices para las consultas del dashboard.
create index if not exists idx_tx_empresa_fecha on transacciones (empresa_id, fecha);
create index if not exists idx_fuentes_empresa on fuentes (empresa_id);
create index if not exists idx_empresas_owner on empresas (owner_user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Regla del brief: cada empresa solo ve sus datos. En el MVP, un usuario es
-- dueño (owner_user_id) de su empresa; pertenece a una sola empresa.
-- ---------------------------------------------------------------------------

alter table empresas      enable row level security;
alter table fuentes       enable row level security;
alter table transacciones enable row level security;
alter table waitlist      enable row level security;

-- Helper: ¿la empresa pertenece al usuario autenticado?
create or replace function es_mi_empresa(p_empresa_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from empresas
    where id = p_empresa_id and owner_user_id = auth.uid()
  );
$$;

-- empresas: el dueño ve y administra su empresa.
drop policy if exists "empresas: dueño lee" on empresas;
create policy "empresas: dueño lee" on empresas
  for select using (owner_user_id = auth.uid());

drop policy if exists "empresas: dueño crea" on empresas;
create policy "empresas: dueño crea" on empresas
  for insert with check (owner_user_id = auth.uid());

drop policy if exists "empresas: dueño actualiza" on empresas;
create policy "empresas: dueño actualiza" on empresas
  for update using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- fuentes: solo de mi empresa.
drop policy if exists "fuentes: de mi empresa" on fuentes;
create policy "fuentes: de mi empresa" on fuentes
  for all using (es_mi_empresa(empresa_id))
  with check (es_mi_empresa(empresa_id));

-- transacciones: solo de mi empresa.
drop policy if exists "transacciones: de mi empresa" on transacciones;
create policy "transacciones: de mi empresa" on transacciones
  for all using (es_mi_empresa(empresa_id))
  with check (es_mi_empresa(empresa_id));

-- waitlist: cualquiera (anon) puede inscribirse; nadie puede leerla con anon key.
drop policy if exists "waitlist: inserta público" on waitlist;
create policy "waitlist: inserta público" on waitlist
  for insert to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- Trigger: al crearse un usuario en Supabase Auth, crea su empresa por defecto.
-- Así "al registrarse se crea una empresa" (Fase 2) sin lógica extra en la app.
-- El nombre/slug se pueden editar después en /config.
-- ---------------------------------------------------------------------------

create or replace function crear_empresa_para_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug text;
begin
  v_slug := 'empresa-' || left(replace(new.id::text, '-', ''), 8);
  insert into empresas (nombre, slug, plan, owner_user_id)
  values ('Mi empresa', v_slug, 'pulso', new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function crear_empresa_para_usuario();
