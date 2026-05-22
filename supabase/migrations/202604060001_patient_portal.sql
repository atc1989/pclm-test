create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'patient_scan_stage') then
    create type public.patient_scan_stage as enum ('baseline', 'mid_check', 'follow_up');
  end if;

  if not exists (select 1 from pg_type where typname = 'patient_protocol_key') then
    create type public.patient_protocol_key as enum ('maintenance', 'start', 'grow', 'power');
  end if;

  if not exists (select 1 from pg_type where typname = 'patient_protocol_status') then
    create type public.patient_protocol_status as enum ('recommended', 'active', 'completed', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'transformation_entry_type') then
    create type public.transformation_entry_type as enum ('protocol', 'scan', 'story');
  end if;

  if not exists (select 1 from pg_type where typname = 'patient_event_name') then
    create type public.patient_event_name as enum (
      'lab_upload',
      'score_generated',
      'protocol_started',
      'protocol_completed',
      'doctor_review',
      'follow_up_scan'
    );
  end if;
end
$$;

alter table public.profiles
  alter column role set default 'patient';

alter table public.profiles
  add column if not exists display_name text,
  add column if not exists age integer,
  add column if not exists sex text;

create or replace function public.handle_new_platform_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.user_role;
  computed_display_name text;
begin
  requested_role :=
    case
      when new.raw_user_meta_data ->> 'role' = 'doctor' then 'doctor'::public.user_role
      else 'patient'::public.user_role
    end;

  computed_display_name := nullif(
    trim(
      concat_ws(
        ' ',
        new.raw_user_meta_data ->> 'first_name',
        new.raw_user_meta_data ->> 'last_name'
      )
    ),
    ''
  );

  insert into public.profiles (
    id,
    role,
    first_name,
    last_name,
    email,
    mobile,
    display_name,
    age,
    sex
  )
  values (
    new.id,
    requested_role,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.email,
    new.raw_user_meta_data ->> 'mobile',
    coalesce(new.raw_user_meta_data ->> 'display_name', computed_display_name),
    nullif(new.raw_user_meta_data ->> 'age', '')::integer,
    new.raw_user_meta_data ->> 'sex'
  )
  on conflict (id) do update
  set
    role = excluded.role,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    email = excluded.email,
    mobile = excluded.mobile,
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    age = coalesce(excluded.age, public.profiles.age),
    sex = coalesce(excluded.sex, public.profiles.sex),
    updated_at = timezone('utc', now());

  if requested_role = 'doctor' then
    insert into public.onboarding_status (doctor_id, status)
    values (new.id, 'draft')
    on conflict (doctor_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_platform_user();

update public.profiles as profiles
set
  role = 'patient',
  display_name = coalesce(
    nullif(profiles.display_name, ''),
    nullif(trim(concat_ws(' ', profiles.first_name, profiles.last_name)), '')
  ),
  updated_at = timezone('utc', now())
from auth.users as users
where profiles.id = users.id
  and users.raw_user_meta_data ->> 'role' = 'patient';

delete from public.onboarding_status as onboarding_status
using public.profiles as profiles
where onboarding_status.doctor_id = profiles.id
  and profiles.role = 'patient';

create table if not exists public.lab_results (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  stage public.patient_scan_stage not null,
  lab_name text not null,
  source_type text not null default 'manual_upload',
  test_date date not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.biomarker_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  lab_result_id uuid not null unique references public.lab_results (id) on delete cascade,
  hs_crp numeric(10, 2),
  neutrophils numeric(10, 2),
  lymphocytes numeric(10, 2),
  triglycerides numeric(10, 2),
  hdl numeric(10, 2),
  fasting_glucose numeric(10, 2),
  hba1c numeric(10, 2),
  esr numeric(10, 2),
  derived_nlr numeric(10, 2),
  derived_tg_hdl numeric(10, 2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inflammation_scores (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  lab_result_id uuid not null unique references public.lab_results (id) on delete cascade,
  ibi_score integer not null check (ibi_score >= 0 and ibi_score <= 100),
  interpretation text not null,
  hs_crp_score numeric(10, 2) not null default 0,
  nlr_score numeric(10, 2) not null default 0,
  tg_hdl_score numeric(10, 2) not null default 0,
  metabolic_score numeric(10, 2) not null default 0,
  recommended_protocol public.patient_protocol_key not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.protocol_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  source_score_id uuid references public.inflammation_scores (id) on delete set null,
  protocol_key public.patient_protocol_key not null,
  status public.patient_protocol_status not null default 'recommended',
  handoff_method text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.protocol_days (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  protocol_plan_id uuid not null references public.protocol_plans (id) on delete cascade,
  day_number integer not null check (day_number > 0),
  status text not null default 'pending',
  note text,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint protocol_days_unique_plan_day unique (protocol_plan_id, day_number)
);

create table if not exists public.transformation_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  protocol_plan_id uuid references public.protocol_plans (id) on delete set null,
  lab_result_id uuid references public.lab_results (id) on delete set null,
  entry_type public.transformation_entry_type not null,
  title text not null,
  detail text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.doctor_notes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  doctor_id uuid references public.profiles (id) on delete set null,
  note text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.event_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  lab_result_id uuid references public.lab_results (id) on delete set null,
  event_name public.patient_event_name not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists lab_results_patient_id_idx
  on public.lab_results (patient_id, created_at desc);

create index if not exists biomarker_records_patient_id_idx
  on public.biomarker_records (patient_id, created_at desc);

create index if not exists inflammation_scores_patient_id_idx
  on public.inflammation_scores (patient_id, created_at desc);

create index if not exists protocol_plans_patient_id_idx
  on public.protocol_plans (patient_id, created_at desc);

create index if not exists protocol_days_patient_id_idx
  on public.protocol_days (patient_id, protocol_plan_id, day_number);

create index if not exists transformation_logs_patient_id_idx
  on public.transformation_logs (patient_id, created_at desc);

create index if not exists doctor_notes_patient_id_idx
  on public.doctor_notes (patient_id, created_at desc);

create index if not exists doctor_notes_doctor_id_idx
  on public.doctor_notes (doctor_id, created_at desc);

create index if not exists event_logs_patient_id_idx
  on public.event_logs (patient_id, created_at desc);

drop trigger if exists lab_results_set_updated_at on public.lab_results;
create trigger lab_results_set_updated_at
before update on public.lab_results
for each row execute procedure public.set_updated_at();

drop trigger if exists biomarker_records_set_updated_at on public.biomarker_records;
create trigger biomarker_records_set_updated_at
before update on public.biomarker_records
for each row execute procedure public.set_updated_at();

drop trigger if exists inflammation_scores_set_updated_at on public.inflammation_scores;
create trigger inflammation_scores_set_updated_at
before update on public.inflammation_scores
for each row execute procedure public.set_updated_at();

drop trigger if exists protocol_plans_set_updated_at on public.protocol_plans;
create trigger protocol_plans_set_updated_at
before update on public.protocol_plans
for each row execute procedure public.set_updated_at();

drop trigger if exists protocol_days_set_updated_at on public.protocol_days;
create trigger protocol_days_set_updated_at
before update on public.protocol_days
for each row execute procedure public.set_updated_at();

drop trigger if exists doctor_notes_set_updated_at on public.doctor_notes;
create trigger doctor_notes_set_updated_at
before update on public.doctor_notes
for each row execute procedure public.set_updated_at();

alter table public.lab_results enable row level security;
alter table public.biomarker_records enable row level security;
alter table public.inflammation_scores enable row level security;
alter table public.protocol_plans enable row level security;
alter table public.protocol_days enable row level security;
alter table public.transformation_logs enable row level security;
alter table public.doctor_notes enable row level security;
alter table public.event_logs enable row level security;

drop policy if exists "Doctors can view their own profile" on public.profiles;
drop policy if exists "Doctors can insert their own profile" on public.profiles;
drop policy if exists "Doctors can update their own profile" on public.profiles;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (
  auth.uid() = id
  and role in ('doctor', 'patient')
);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role in ('doctor', 'patient')
);

drop policy if exists "Patients can view their own lab results" on public.lab_results;
create policy "Patients can view their own lab results"
on public.lab_results
for select
to authenticated
using (auth.uid() = patient_id);

drop policy if exists "Patients can insert their own lab results" on public.lab_results;
create policy "Patients can insert their own lab results"
on public.lab_results
for insert
to authenticated
with check (auth.uid() = patient_id);

drop policy if exists "Patients can update their own lab results" on public.lab_results;
create policy "Patients can update their own lab results"
on public.lab_results
for update
to authenticated
using (auth.uid() = patient_id)
with check (auth.uid() = patient_id);

drop policy if exists "Patients can view their own biomarker records" on public.biomarker_records;
create policy "Patients can view their own biomarker records"
on public.biomarker_records
for select
to authenticated
using (auth.uid() = patient_id);

drop policy if exists "Patients can insert their own biomarker records" on public.biomarker_records;
create policy "Patients can insert their own biomarker records"
on public.biomarker_records
for insert
to authenticated
with check (auth.uid() = patient_id);

drop policy if exists "Patients can update their own biomarker records" on public.biomarker_records;
create policy "Patients can update their own biomarker records"
on public.biomarker_records
for update
to authenticated
using (auth.uid() = patient_id)
with check (auth.uid() = patient_id);

drop policy if exists "Patients can view their own inflammation scores" on public.inflammation_scores;
create policy "Patients can view their own inflammation scores"
on public.inflammation_scores
for select
to authenticated
using (auth.uid() = patient_id);

drop policy if exists "Patients can insert their own inflammation scores" on public.inflammation_scores;
create policy "Patients can insert their own inflammation scores"
on public.inflammation_scores
for insert
to authenticated
with check (auth.uid() = patient_id);

drop policy if exists "Patients can update their own inflammation scores" on public.inflammation_scores;
create policy "Patients can update their own inflammation scores"
on public.inflammation_scores
for update
to authenticated
using (auth.uid() = patient_id)
with check (auth.uid() = patient_id);

drop policy if exists "Patients can view their own protocol plans" on public.protocol_plans;
create policy "Patients can view their own protocol plans"
on public.protocol_plans
for select
to authenticated
using (auth.uid() = patient_id);

drop policy if exists "Patients can insert their own protocol plans" on public.protocol_plans;
create policy "Patients can insert their own protocol plans"
on public.protocol_plans
for insert
to authenticated
with check (auth.uid() = patient_id);

drop policy if exists "Patients can update their own protocol plans" on public.protocol_plans;
create policy "Patients can update their own protocol plans"
on public.protocol_plans
for update
to authenticated
using (auth.uid() = patient_id)
with check (auth.uid() = patient_id);

drop policy if exists "Patients can view their own protocol days" on public.protocol_days;
create policy "Patients can view their own protocol days"
on public.protocol_days
for select
to authenticated
using (auth.uid() = patient_id);

drop policy if exists "Patients can insert their own protocol days" on public.protocol_days;
create policy "Patients can insert their own protocol days"
on public.protocol_days
for insert
to authenticated
with check (auth.uid() = patient_id);

drop policy if exists "Patients can update their own protocol days" on public.protocol_days;
create policy "Patients can update their own protocol days"
on public.protocol_days
for update
to authenticated
using (auth.uid() = patient_id)
with check (auth.uid() = patient_id);

drop policy if exists "Patients can view their own transformation logs" on public.transformation_logs;
create policy "Patients can view their own transformation logs"
on public.transformation_logs
for select
to authenticated
using (auth.uid() = patient_id);

drop policy if exists "Patients can insert their own transformation logs" on public.transformation_logs;
create policy "Patients can insert their own transformation logs"
on public.transformation_logs
for insert
to authenticated
with check (auth.uid() = patient_id);

drop policy if exists "Patients can update their own transformation logs" on public.transformation_logs;
create policy "Patients can update their own transformation logs"
on public.transformation_logs
for update
to authenticated
using (auth.uid() = patient_id)
with check (auth.uid() = patient_id);

drop policy if exists "Patients can view their own doctor notes" on public.doctor_notes;
create policy "Patients can view their own doctor notes"
on public.doctor_notes
for select
to authenticated
using (auth.uid() = patient_id or auth.uid() = doctor_id);

drop policy if exists "Doctors can insert their own doctor notes" on public.doctor_notes;
create policy "Doctors can insert their own doctor notes"
on public.doctor_notes
for insert
to authenticated
with check (
  auth.uid() = doctor_id
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'doctor'
  )
);

drop policy if exists "Doctors can update their own doctor notes" on public.doctor_notes;
create policy "Doctors can update their own doctor notes"
on public.doctor_notes
for update
to authenticated
using (
  auth.uid() = doctor_id
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'doctor'
  )
)
with check (auth.uid() = doctor_id);

drop policy if exists "Patients can view their own event logs" on public.event_logs;
create policy "Patients can view their own event logs"
on public.event_logs
for select
to authenticated
using (auth.uid() = patient_id);

drop policy if exists "Patients can insert their own event logs" on public.event_logs;
create policy "Patients can insert their own event logs"
on public.event_logs
for insert
to authenticated
with check (auth.uid() = patient_id);
