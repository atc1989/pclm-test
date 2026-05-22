create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('doctor');
  end if;

  if not exists (
    select 1 from pg_type where typname = 'verification_status'
  ) then
    create type public.verification_status as enum ('pending', 'approved', 'rejected');
  end if;

  if not exists (select 1 from pg_type where typname = 'onboarding_state') then
    create type public.onboarding_state as enum (
      'draft',
      'submitted',
      'under_review',
      'approved',
      'rejected'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'qr_activation_status') then
    create type public.qr_activation_status as enum ('inactive', 'active');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'doctor',
  first_name text,
  last_name text,
  email text not null unique,
  mobile text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.doctor_clinics (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null unique references public.profiles (id) on delete cascade,
  clinic_name text not null,
  city text not null,
  province text not null,
  specialty text not null,
  clinic_slug text not null unique,
  qr_code_url text,
  qr_activation_status public.qr_activation_status not null default 'inactive',
  qr_activated_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint doctor_clinics_slug_format check (clinic_slug = lower(clinic_slug))
);

create table if not exists public.doctor_verifications (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null unique references public.profiles (id) on delete cascade,
  prc_license_number text not null unique,
  prc_id_file_path text,
  verification_status public.verification_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.onboarding_status (
  doctor_id uuid primary key references public.profiles (id) on delete cascade,
  status public.onboarding_state not null default 'draft',
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists doctor_clinics_doctor_id_idx
  on public.doctor_clinics (doctor_id);

create index if not exists doctor_verifications_doctor_id_idx
  on public.doctor_verifications (doctor_id);

create index if not exists onboarding_status_state_idx
  on public.onboarding_status (status);

create or replace function public.handle_new_doctor_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    role,
    first_name,
    last_name,
    email,
    mobile
  )
  values (
    new.id,
    'doctor',
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.email,
    new.raw_user_meta_data ->> 'mobile'
  )
  on conflict (id) do update
  set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    email = excluded.email,
    mobile = excluded.mobile,
    updated_at = timezone('utc', now());

  insert into public.onboarding_status (doctor_id, status)
  values (new.id, 'draft')
  on conflict (doctor_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_doctor_user();

create or replace function public.sync_onboarding_timestamps()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'draft' then
    new.submitted_at = null;
    new.approved_at = null;
  else
    if new.submitted_at is null then
      new.submitted_at = timezone('utc', now());
    end if;

    if new.status = 'approved' then
      if new.approved_at is null then
        new.approved_at = timezone('utc', now());
      end if;
    else
      new.approved_at = null;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists doctor_clinics_set_updated_at on public.doctor_clinics;
create trigger doctor_clinics_set_updated_at
before update on public.doctor_clinics
for each row execute procedure public.set_updated_at();

drop trigger if exists doctor_verifications_set_updated_at on public.doctor_verifications;
create trigger doctor_verifications_set_updated_at
before update on public.doctor_verifications
for each row execute procedure public.set_updated_at();

drop trigger if exists onboarding_status_set_updated_at on public.onboarding_status;
create trigger onboarding_status_set_updated_at
before update on public.onboarding_status
for each row execute procedure public.set_updated_at();

drop trigger if exists onboarding_status_sync_timestamps on public.onboarding_status;
create trigger onboarding_status_sync_timestamps
before insert or update on public.onboarding_status
for each row execute procedure public.sync_onboarding_timestamps();

alter table public.profiles enable row level security;
alter table public.doctor_clinics enable row level security;
alter table public.doctor_verifications enable row level security;
alter table public.onboarding_status enable row level security;

drop policy if exists "Doctors can view their own profile" on public.profiles;
create policy "Doctors can view their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Doctors can insert their own profile" on public.profiles;
create policy "Doctors can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id and role = 'doctor');

drop policy if exists "Doctors can update their own profile" on public.profiles;
create policy "Doctors can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id and role = 'doctor');

drop policy if exists "Doctors can view their own clinic" on public.doctor_clinics;
create policy "Doctors can view their own clinic"
on public.doctor_clinics
for select
to authenticated
using (auth.uid() = doctor_id);

drop policy if exists "Doctors can insert their own clinic" on public.doctor_clinics;
create policy "Doctors can insert their own clinic"
on public.doctor_clinics
for insert
to authenticated
with check (auth.uid() = doctor_id);

drop policy if exists "Doctors can update their own clinic" on public.doctor_clinics;
create policy "Doctors can update their own clinic"
on public.doctor_clinics
for update
to authenticated
using (auth.uid() = doctor_id)
with check (auth.uid() = doctor_id);

drop policy if exists "Doctors can view their own verification" on public.doctor_verifications;
create policy "Doctors can view their own verification"
on public.doctor_verifications
for select
to authenticated
using (auth.uid() = doctor_id);

drop policy if exists "Doctors can insert their own verification" on public.doctor_verifications;
create policy "Doctors can insert their own verification"
on public.doctor_verifications
for insert
to authenticated
with check (auth.uid() = doctor_id);

drop policy if exists "Doctors can update their own verification" on public.doctor_verifications;
create policy "Doctors can update their own verification"
on public.doctor_verifications
for update
to authenticated
using (auth.uid() = doctor_id)
with check (auth.uid() = doctor_id);

drop policy if exists "Doctors can view their own onboarding status" on public.onboarding_status;
create policy "Doctors can view their own onboarding status"
on public.onboarding_status
for select
to authenticated
using (auth.uid() = doctor_id);

drop policy if exists "Doctors can insert their own onboarding status" on public.onboarding_status;
create policy "Doctors can insert their own onboarding status"
on public.onboarding_status
for insert
to authenticated
with check (auth.uid() = doctor_id);

drop policy if exists "Doctors can update their own onboarding status" on public.onboarding_status;
create policy "Doctors can update their own onboarding status"
on public.onboarding_status
for update
to authenticated
using (auth.uid() = doctor_id)
with check (auth.uid() = doctor_id);
