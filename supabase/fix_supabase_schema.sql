-- =========================================================================
-- SMARTCITY AI - ADAPTIVE SUPABASE FIX SCRIPT (ZERO COLUMN CONFLICTS)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- =========================================================================

-- 1. ADD MISSING COLUMNS SAFELY IF TABLE ALREADY EXISTS
alter table if exists public.departments add column if not exists head text;
alter table if exists public.departments add column if not exists phone text;

alter table if exists public.complaints add column if not exists ticket_number text;
alter table if exists public.complaints add column if not exists department_name text;
alter table if exists public.complaints add column if not exists landmark text;
alter table if exists public.complaints add column if not exists ward text;
alter table if exists public.complaints add column if not exists reported_by text;

alter table if exists public.complaint_updates add column if not exists action text;
alter table if exists public.complaint_updates add column if not exists officer text;

alter table if exists public.notifications add column if not exists type text default 'info';


-- =========================================================================
-- 2. ENSURE ALL TABLES EXIST
-- =========================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  role text not null default 'citizen' check (role in ('citizen', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  head text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  ticket_number text,
  citizen_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text not null,
  category text,
  priority text not null default 'medium',
  status text not null default 'pending',
  department_id uuid references public.departments(id) on delete set null,
  department_name text,
  address text,
  landmark text,
  ward text,
  latitude double precision,
  longitude double precision,
  image_url text,
  ai_category text,
  ai_priority text,
  ai_department text,
  ai_summary text,
  reported_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.complaint_updates (
  id uuid primary key default gen_random_uuid(),
  complaint_id text,
  user_id uuid references auth.users(id) on delete set null,
  status text,
  comment text,
  action text,
  officer text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text default 'info',
  read boolean not null default false,
  created_at timestamptz not null default now()
);


-- =========================================================================
-- 3. GRANT PERMISSIONS TO ANON & AUTHENTICATED ROLES
-- =========================================================================

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on all tables in schema public to postgres, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert, update on all tables in schema public to anon;

grant all privileges on all sequences in schema public to postgres, service_role, authenticated, anon;
grant all privileges on all functions in schema public to postgres, service_role, authenticated, anon;

alter default privileges in schema public grant all on tables to postgres, service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant select, insert, update on tables to anon;


-- =========================================================================
-- 4. PERMISSIVE ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_updates enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Allow select departments" on public.departments;
drop policy if exists "Allow insert departments" on public.departments;
drop policy if exists "Allow all complaints select" on public.complaints;
drop policy if exists "Allow all complaints insert" on public.complaints;
drop policy if exists "Allow all complaints update" on public.complaints;
drop policy if exists "Allow all updates select" on public.complaint_updates;
drop policy if exists "Allow all updates insert" on public.complaint_updates;
drop policy if exists "Allow notifications select" on public.notifications;
drop policy if exists "Allow notifications insert" on public.notifications;
drop policy if exists "Allow profiles select" on public.profiles;
drop policy if exists "Allow profiles update" on public.profiles;

create policy "Allow select departments" on public.departments for select using (true);
create policy "Allow insert departments" on public.departments for all using (true) with check (true);

create policy "Allow all complaints select" on public.complaints for select using (true);
create policy "Allow all complaints insert" on public.complaints for insert with check (true);
create policy "Allow all complaints update" on public.complaints for update using (true) with check (true);

create policy "Allow all updates select" on public.complaint_updates for select using (true);
create policy "Allow all updates insert" on public.complaint_updates for insert with check (true);

create policy "Allow notifications select" on public.notifications for select using (true);
create policy "Allow notifications insert" on public.notifications for insert with check (true);

create policy "Allow profiles select" on public.profiles for select using (true);
create policy "Allow profiles update" on public.profiles for update using (true) with check (true);


-- =========================================================================
-- 5. SEED DEFAULT DEPARTMENTS (COMPATIBLE WITH ORIGINAL & EXTENDED SCHEMA)
-- =========================================================================

insert into public.departments (name, description)
values
  ('Roads & Infrastructure', 'Road damage, potholes, footpaths, signals'),
  ('Street Lighting', 'Streetlight outages and public lighting issues'),
  ('Waste Management', 'Garbage collection, bins, and waste clearing'),
  ('Traffic Management', 'Traffic signals, congestion, and road traffic'),
  ('Water & Drainage', 'Water supply, pipe leakage, and drainage issues'),
  ('Public Safety', 'Public safety, emergency hazards, and civic response'),
  ('Parks & Environment', 'Parks, lake conservation, and environmental cleanliness')
on conflict (name) do nothing;


-- =========================================================================
-- 6. VERIFY RESULTS
-- =========================================================================

select 'Departments count' as metric, count(*)::text as value from public.departments
union all
select 'Complaints count', count(*)::text from public.complaints
union all
select 'Profiles count', count(*)::text from public.profiles;
