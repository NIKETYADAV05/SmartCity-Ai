-- =========================================================
-- SMARTCITY AI - ADMIN EXTENSION & SETUP
-- Run this in your Supabase SQL Editor
-- =========================================================

-- 1. UPGRADE THE NEW USER TRIGGER
-- Automatically grants 'admin' role if:
--   a) The email is 'admin@smartcity.gov' or ends with '@smartcity.gov'
--   b) Or 'role': 'admin' is passed in signup user metadata
-- Otherwise defaults to 'citizen'.
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

-- Re-attach trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();


-- =========================================================
-- 2. HELPER FUNCTIONS TO MANAGE ADMINS EASILY
-- =========================================================

-- Function to promote any user by email:
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

  -- Also update auth user metadata if present
  update auth.users
  set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', 'admin')
  where id = target_id;

  return 'User ' || target_email || ' has been successfully promoted to admin.';
end;
$$;

-- Function to demote a user back to citizen:
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
-- 3. INSTANT ADMIN SEED (Pre-configured login)
-- Creates an admin account immediately with verified email
-- Email:    admin@smartcity.gov
-- Password: AdminPassword123!
-- =========================================================
do $$
declare
  new_admin_id uuid := gen_random_uuid();
  encrypted_pw text;
begin
  -- Check if admin@smartcity.gov already exists
  if not exists (select 1 from auth.users where email = 'admin@smartcity.gov') then
    
    -- Encrypt password with pgcrypto / bcrypt
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

    -- Ensure profile entry is set to admin
    insert into public.profiles (id, name, email, role)
    values (
      new_admin_id,
      'System Administrator',
      'admin@smartcity.gov',
      'admin'
    )
    on conflict (id) do update set role = 'admin';

  else
    -- If user already existed, ensure role is 'admin'
    update public.profiles 
    set role = 'admin' 
    where email = 'admin@smartcity.gov';
  end if;
end $$;


-- =========================================================
-- 4. VIEW ALL ADMIN USERS
-- Run this anytime to verify who has admin privileges
-- =========================================================
select id, name, email, role, created_at 
from public.profiles 
where role = 'admin';
