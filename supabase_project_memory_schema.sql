-- OracleToolkit Supabase Project Memory Schema
-- Run this in Supabase SQL Editor if these tables/RLS policies are not already configured.
-- Clerk JWT template must be named: supabase
-- Clerk JWT must include user id in the `sub` claim.

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default (auth.jwt() ->> 'sub'),
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

create table if not exists public.accelerator_runs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default (auth.jwt() ->> 'sub'),
  project_id uuid not null references public.projects(id) on delete cascade,
  accelerator_name text not null,
  module text,
  status text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.accelerator_runs enable row level security;

drop policy if exists "projects_select_own" on public.projects;
drop policy if exists "projects_insert_own" on public.projects;
drop policy if exists "projects_update_own" on public.projects;
drop policy if exists "projects_delete_own" on public.projects;

create policy "projects_select_own" on public.projects
  for select using (user_id = auth.jwt() ->> 'sub');

create policy "projects_insert_own" on public.projects
  for insert with check (user_id = auth.jwt() ->> 'sub');

create policy "projects_update_own" on public.projects
  for update using (user_id = auth.jwt() ->> 'sub')
  with check (user_id = auth.jwt() ->> 'sub');

create policy "projects_delete_own" on public.projects
  for delete using (user_id = auth.jwt() ->> 'sub');

drop policy if exists "runs_select_own" on public.accelerator_runs;
drop policy if exists "runs_insert_own" on public.accelerator_runs;
drop policy if exists "runs_delete_own" on public.accelerator_runs;

create policy "runs_select_own" on public.accelerator_runs
  for select using (user_id = auth.jwt() ->> 'sub');

create policy "runs_insert_own" on public.accelerator_runs
  for insert with check (user_id = auth.jwt() ->> 'sub');

create policy "runs_delete_own" on public.accelerator_runs
  for delete using (user_id = auth.jwt() ->> 'sub');
