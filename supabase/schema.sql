-- =========================================================
-- SMARTCITY AI - COMPLETE UNIFIED DATABASE SCHEMA
-- Includes Core Database, Security (RLS), Admin Controls & Seed
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- =========================================================

-- 1. PROFILES
-- Extends Supabase Auth users with application-specific data.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  role text not null default 'citizen'
    check (role in ('citizen', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. DEPARTMENTS
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

-- 3. COMPLAINTS / CITIZEN REPORTS
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),

  citizen_id uuid not null references public.profiles(id) on delete cascade,

  title text not null,
  description text not null,

  category text,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'critical')),

  status text not null default 'pending'
    check (status in (
      'pending',
      'under_review',
      'assigned',
      'in_progress',
      'resolved',
      'rejected'
    )),

  department_id uuid references public.departments(id) on delete set null,

  address text,
  latitude double precision,
  longitude double precision,

  image_url text,

  ai_category text,
  ai_priority text,
  ai_department text,
  ai_summary text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. COMPLAINT STATUS / ACTIVITY HISTORY
create table if not exists public.complaint_updates (
  id uuid primary key default gen_random_uuid(),

  complaint_id uuid not null references public.complaints(id) on delete cascade,

  user_id uuid references public.profiles(id) on delete set null,

  status text,
  comment text,

  created_at timestamptz not null default now()
);

-- 5. NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references public.profiles(id) on delete cascade,

  title text not null,
  message text not null,

  read boolean not null default false,

  created_at timestamptz not null default now()
);


-- =========================================================
-- INDEXES
-- =========================================================

create index if not exists complaints_citizen_id_idx
  on public.complaints(citizen_id);

create index if not exists complaints_status_idx
  on public.complaints(status);

create index if not exists complaints_category_idx
  on public.complaints(category);

create index if not exists complaints_department_id_idx
  on public.complaints(department_id);

create index if not exists complaint_updates_complaint_id_idx
  on public.complaint_updates(complaint_id);

create index if not exists notifications_user_id_idx
  on public.notifications(user_id);


-- =========================================================
-- ENABLE ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_updates enable row level security;
alter table public.notifications enable row level security;


-- =========================================================
-- ADMIN CHECK FUNCTION
-- SECURITY DEFINER prevents RLS recursion.
-- =========================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;


-- =========================================================
-- PROFILE POLICIES
-- =========================================================

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
);

create policy "Admins can view all profiles"
on public.profiles
for select
to authenticated
using (
  public.is_admin()
);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
)
with check (
  id = auth.uid()
);

create policy "Admins can update all profiles"
on public.profiles
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- =========================================================
-- DEPARTMENT POLICIES
-- =========================================================

create policy "Authenticated users can view departments"
on public.departments
for select
to authenticated
using (true);

create policy "Admins can create departments"
on public.departments
for insert
to authenticated
with check (
  public.is_admin()
);

create policy "Admins can update departments"
on public.departments
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Admins can delete departments"
on public.departments
for delete
to authenticated
using (
  public.is_admin()
);


-- =========================================================
-- COMPLAINT POLICIES
-- =========================================================

create policy "Citizens can create complaints"
on public.complaints
for insert
to authenticated
with check (
  citizen_id = auth.uid()
);

create policy "Citizens can view their own complaints"
on public.complaints
for select
to authenticated
using (
  citizen_id = auth.uid()
);

create policy "Admins can view all complaints"
on public.complaints
for select
to authenticated
using (
  public.is_admin()
);

create policy "Citizens can update their own complaints"
on public.complaints
for update
to authenticated
using (
  citizen_id = auth.uid()
)
with check (
  citizen_id = auth.uid()
);

create policy "Admins can update all complaints"
on public.complaints
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Admins can delete complaints"
on public.complaints
for delete
to authenticated
using (
  public.is_admin()
);


-- =========================================================
-- COMPLAINT UPDATE POLICIES
-- =========================================================

create policy "Admins can create complaint updates"
on public.complaint_updates
for insert
to authenticated
with check (
  public.is_admin()
);

create policy "Users can view updates for their complaints"
on public.complaint_updates
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);


-- =========================================================
-- NOTIFICATION POLICIES
-- =========================================================

create policy "Users can view their notifications"
on public.notifications
for select
to authenticated
using (
  user_id = auth.uid()
);

create policy "Users can mark their notifications as read"
on public.notifications
for update
to authenticated
using (
  user_id = auth.uid()
)
with check (
  user_id = auth.uid()
);

create policy "Admins can create notifications"
on public.notifications
for insert
to authenticated
with check (
  public.is_admin()
);

create policy "Admins can view all notifications"
on public.notifications
for select
to authenticated
using (
  public.is_admin()
);


-- =========================================================
-- AUTOMATIC PROFILE CREATION AFTER SIGNUP (WITH AUTO-ADMIN)
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role text;
begin
  -- Determine role based on email or signup metadata
  if new.email = 'admin@smartcity.gov' 
     or new.email like '%@smartcity.gov'
     or (new.raw_user_meta_data->>'role') = 'admin' then
    assigned_role := 'admin';
  else
    assigned_role := 'citizen';
  end if;

  insert into public.profiles (
    id,
    name,
    email,
    role
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
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


-- =========================================================
-- ADMIN MANAGEMENT HELPER FUNCTIONS
-- =========================================================

-- Promote any user to admin by email:
create or replace function public.promote_to_admin(target_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  select id into target_id from public.profiles where email = target_email;

  if target_id is null then
    return 'User with email ' || target_email || ' not found in profiles.';
  end if;

  update public.profiles
  set role = 'admin', updated_at = now()
  where id = target_id;

  update auth.users
  set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', 'admin')
  where id = target_id;

  return 'User ' || target_email || ' has been successfully promoted to admin.';
end;
$$;

-- Demote a user back to citizen:
create or replace function public.demote_to_citizen(target_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  select id into target_id from public.profiles where email = target_email;

  if target_id is null then
    return 'User with email ' || target_email || ' not found in profiles.';
  end if;

  update public.profiles
  set role = 'citizen', updated_at = now()
  where id = target_id;

  update auth.users
  set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', 'citizen')
  where id = target_id;

  return 'User ' || target_email || ' has been changed to citizen.';
end;
$$;


-- =========================================================
-- DEFAULT CITY DEPARTMENTS
-- =========================================================

insert into public.departments (name, description)
values
  ('Roads & Infrastructure', 'Road damage, potholes and infrastructure issues'),
  ('Street Lighting', 'Streetlight and public lighting issues'),
  ('Waste Management', 'Garbage collection and waste-related issues'),
  ('Traffic Management', 'Traffic signals, congestion and road traffic issues'),
  ('Water & Drainage', 'Water supply, leakage and drainage issues'),
  ('Public Safety', 'Public safety and emergency-related civic issues'),
  ('Parks & Environment', 'Parks, cleanliness and environmental issues')
on conflict (name) do nothing;


-- =========================================================
-- INSTANT SEED ADMIN USER
-- Creates verified admin: admin@smartcity.gov / AdminPassword123!
-- =========================================================

do $$
declare
  new_admin_id uuid := gen_random_uuid();
  encrypted_pw text;
begin
  if not exists (select 1 from auth.users where email = 'admin@smartcity.gov') then
    
    encrypted_pw := extensions.crypt('AdminPassword123!', extensions.gen_salt('bf'));

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      new_admin_id,
      'authenticated',
      'authenticated',
      'admin@smartcity.gov',
      encrypted_pw,
      now(),
      '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
      '{"name": "System Administrator", "role": "admin"}'::jsonb,
      now(),
      now()
    );

    insert into public.profiles (id, name, email, role)
    values (
      new_admin_id,
      'System Administrator',
      'admin@smartcity.gov',
      'admin'
    )
    on conflict (id) do update set role = 'admin';

  else
    update public.profiles 
    set role = 'admin' 
    where email = 'admin@smartcity.gov';
  end if;
end $$;


-- =========================================================
-- VERIFY ADMINS
-- =========================================================
select id, name, email, role, created_at 
from public.profiles 
where role = 'admin';
