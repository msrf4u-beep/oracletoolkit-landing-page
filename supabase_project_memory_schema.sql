-- OracleToolkit Project Memory V2 Schema Fix
-- Aligns Supabase with existing OracleToolkit convention: Clerk user id is stored as clerk_user_id.
-- Run this in Supabase SQL Editor before retesting Project Memory V2.

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  project_name text not null,
  client_name text,
  sector text,
  phase text,
  module text,
  go_live_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects add column if not exists clerk_user_id text;
alter table public.projects add column if not exists project_name text;
alter table public.projects add column if not exists client_name text;
alter table public.projects add column if not exists sector text;
alter table public.projects add column if not exists phase text;
alter table public.projects add column if not exists module text;
alter table public.projects add column if not exists go_live_date date;
alter table public.projects add column if not exists notes text;
alter table public.projects add column if not exists created_at timestamptz not null default now();
alter table public.projects add column if not exists updated_at timestamptz not null default now();

create table if not exists public.accelerator_runs (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  project_id uuid references public.projects(id) on delete cascade,
  accelerator_name text not null,
  module text,
  status text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.accelerator_runs add column if not exists clerk_user_id text;
alter table public.accelerator_runs add column if not exists project_id uuid references public.projects(id) on delete cascade;
alter table public.accelerator_runs add column if not exists accelerator_name text;
alter table public.accelerator_runs add column if not exists module text;
alter table public.accelerator_runs add column if not exists status text;
alter table public.accelerator_runs add column if not exists notes text;
alter table public.accelerator_runs add column if not exists created_at timestamptz not null default now();

create table if not exists public.design_decisions (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  decision_id text,
  module text,
  decision text not null,
  reason text,
  impact text,
  owner text,
  decision_date date,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discovery_outputs (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  requirement text not null,
  pain_point text,
  priority text,
  module text,
  open_questions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rice_items (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  rice_type text not null,
  title text not null,
  description text,
  module text,
  owner text,
  complexity text,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coa_memory (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  ledger text,
  legal_entity text,
  business_unit text,
  segment_structure text,
  hierarchy text,
  financial_categories text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testing_memory (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  scenario text not null,
  module text,
  expected_result text,
  status text,
  evidence_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.accelerator_runs enable row level security;
alter table public.design_decisions enable row level security;
alter table public.discovery_outputs enable row level security;
alter table public.rice_items enable row level security;
alter table public.coa_memory enable row level security;
alter table public.testing_memory enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'projects',
    'accelerator_runs',
    'design_decisions',
    'discovery_outputs',
    'rice_items',
    'coa_memory',
    'testing_memory'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', t || '_select_own', t);
    execute format('drop policy if exists %I on public.%I', t || '_insert_own', t);
    execute format('drop policy if exists %I on public.%I', t || '_update_own', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete_own', t);

    execute format('create policy %I on public.%I for select using (clerk_user_id = auth.jwt() ->> ''sub'')', t || '_select_own', t);
    execute format('create policy %I on public.%I for insert with check (clerk_user_id = auth.jwt() ->> ''sub'')', t || '_insert_own', t);
    execute format('create policy %I on public.%I for update using (clerk_user_id = auth.jwt() ->> ''sub'') with check (clerk_user_id = auth.jwt() ->> ''sub'')', t || '_update_own', t);
    execute format('create policy %I on public.%I for delete using (clerk_user_id = auth.jwt() ->> ''sub'')', t || '_delete_own', t);
  end loop;
end $$;



-- v2.1.0-alpha Project Memory Bridge
-- Adds project_memory_key so external Streamlit accelerators can save into the selected project context.
-- This key is not a Supabase secret. It is a project-scoped bridge token.

alter table public.projects
add column if not exists project_memory_key uuid default gen_random_uuid();

update public.projects
set project_memory_key = gen_random_uuid()
where project_memory_key is null;

create index if not exists idx_projects_memory_key on public.projects(project_memory_key);
