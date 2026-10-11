-- =========================================================================
-- FIX SUPABASE AUTH USER & RE-CREATE CLEAN WORKING ADMIN ACCOUNT
-- Paste & Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/znrkknelrwvlnxcufvng/sql
-- =========================================================================

-- 1. DELETE ANY CORRUPTED / PARTIALLY INSERTED AUTH USER RECORD
delete from public.profiles where email = 'admin@smartcity.gov';
delete from auth.users where email = 'admin@smartcity.gov';

-- 2. CREATE CLEAN, FULLY CONFIGURED AUTH USER FOR SUPABASE GO-TRUE
-- Compatible with all Supabase Go-True schema versions
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'admin@smartcity.gov',
  crypt('AdminPassword123!', gen_salt('bf')),
  now(),
  null,
  '',
  null,
  '',
  null,
  '',
  '',
  null,
  now(),
  '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
  '{"name": "System Administrator", "role": "admin"}'::jsonb,
  false,
  now(),
  now(),
  null,
  null,
  '',
  '',
  null,
  '',
  0,
  null,
  '',
  null,
  false,
  null
);

-- 3. ENSURE MATCHING ROW IN AUTH.IDENTITIES (REQUIRED BY SUPABASE TO VERIFY SCHEMA)
delete from auth.identities where identity_data->>'email' = 'admin@smartcity.gov';

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
values (
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  '{"sub": "a0000000-0000-0000-0000-000000000001", "email": "admin@smartcity.gov", "email_verified": true}'::jsonb,
  'email',
  'admin@smartcity.gov',
  now(),
  now(),
  now()
);

-- 4. ENSURE ROW IN PUBLIC.PROFILES WITH ADMIN ROLE
insert into public.profiles (id, name, email, role, created_at, updated_at)
values (
  'a0000000-0000-0000-0000-000000000001',
  'System Administrator',
  'admin@smartcity.gov',
  'admin',
  now(),
  now()
)
on conflict (id) do update
set role = 'admin', name = 'System Administrator', updated_at = now();

-- 5. VERIFY
select 
  u.id, 
  u.email, 
  u.email_confirmed_at, 
  p.role, 
  i.provider 
from auth.users u
left join public.profiles p on p.id = u.id
left join auth.identities i on i.user_id = u.id
where u.email = 'admin@smartcity.gov';
