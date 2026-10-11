-- =========================================================================
-- SMARTCITY AI - FULL COMPLETE & TESTED SQL SETUP SCRIPT
-- Paste and Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/znrkknelrwvlnxcufvng/sql
-- =========================================================================

-- 1. ADD EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";


-- =========================================================================
-- 2. CREATE / UPDATE TABLES (WITH PROPER DATA TYPES)
-- =========================================================================

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  role text not null default 'citizen' check (role in ('citizen', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- DEPARTMENTS
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  head text,
  phone text,
  created_at timestamptz not null default now()
);

-- COMPLAINTS
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

-- COMPLAINT UPDATES (Fixed user_id data type as uuid)
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

-- NOTIFICATIONS (Fixed user_id data type as uuid)
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
-- 3. ENSURE NEW COLUMNS EXIST IF TABLES WERE CREATED EARLIER
-- =========================================================================

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
-- 4. GRANT PERMISSIONS (FIXES "PERMISSION DENIED" ERRORS)
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
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_updates enable row level security;
alter table public.notifications enable row level security;

-- Drop prior policies to avoid duplicate errors
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
-- 6. POPULATE DEFAULT DEPARTMENTS
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
-- 7. AUTOMATIC PROFILE TRIGGER ON SIGNUP (WITH AUTO-ADMIN)
-- =========================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role text;
begin
  if new.email = 'admin@smartcity.gov' 
     or new.email like '%@smartcity.gov'
     or (new.raw_user_meta_data->>'role') = 'admin' then
    assigned_role := 'admin';
  else
    assigned_role := 'citizen';
  end if;

  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    assigned_role
  )
  on conflict (id) do update
  set 
    name = excluded.name,
    email = excluded.email,
    role = excluded.role,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();


-- =========================================================================
-- 8. VERIFICATION QUERY
-- =========================================================================

select 'Departments count' as metric, count(*)::text as value from public.departments
union all
select 'Complaints count', count(*)::text from public.complaints
union all
select 'Profiles count', count(*)::text from public.profiles;
