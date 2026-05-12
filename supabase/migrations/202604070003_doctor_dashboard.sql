create table if not exists public.doctor_patient_assignments (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.profiles (id) on delete cascade,
  patient_id uuid not null references public.profiles (id) on delete cascade,
  source_type text not null default 'manual',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint doctor_patient_assignments_unique unique (doctor_id, patient_id)
);

create table if not exists public.doctor_protocol_overrides (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.profiles (id) on delete cascade,
  patient_id uuid not null references public.profiles (id) on delete cascade,
  protocol_key public.patient_protocol_key not null,
  reason text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists doctor_patient_assignments_doctor_id_idx
  on public.doctor_patient_assignments (doctor_id, created_at desc);

create index if not exists doctor_patient_assignments_patient_id_idx
  on public.doctor_patient_assignments (patient_id, created_at desc);

create index if not exists doctor_protocol_overrides_doctor_id_idx
  on public.doctor_protocol_overrides (doctor_id, created_at desc);

create index if not exists doctor_protocol_overrides_patient_id_idx
  on public.doctor_protocol_overrides (patient_id, created_at desc);

drop trigger if exists doctor_patient_assignments_set_updated_at on public.doctor_patient_assignments;
create trigger doctor_patient_assignments_set_updated_at
before update on public.doctor_patient_assignments
for each row execute procedure public.set_updated_at();

drop trigger if exists doctor_protocol_overrides_set_updated_at on public.doctor_protocol_overrides;
create trigger doctor_protocol_overrides_set_updated_at
before update on public.doctor_protocol_overrides
for each row execute procedure public.set_updated_at();

alter table public.doctor_patient_assignments enable row level security;
alter table public.doctor_protocol_overrides enable row level security;

drop policy if exists "Doctors can view their own patient assignments" on public.doctor_patient_assignments;
create policy "Doctors can view their own patient assignments"
on public.doctor_patient_assignments
for select
to authenticated
using (auth.uid() = doctor_id);

drop policy if exists "Doctors can insert their own patient assignments" on public.doctor_patient_assignments;
create policy "Doctors can insert their own patient assignments"
on public.doctor_patient_assignments
for insert
to authenticated
with check (auth.uid() = doctor_id);

drop policy if exists "Doctors can update their own patient assignments" on public.doctor_patient_assignments;
create policy "Doctors can update their own patient assignments"
on public.doctor_patient_assignments
for update
to authenticated
using (auth.uid() = doctor_id)
with check (auth.uid() = doctor_id);

drop policy if exists "Doctors can view their own protocol overrides" on public.doctor_protocol_overrides;
create policy "Doctors can view their own protocol overrides"
on public.doctor_protocol_overrides
for select
to authenticated
using (auth.uid() = doctor_id);

drop policy if exists "Doctors can insert their own protocol overrides" on public.doctor_protocol_overrides;
create policy "Doctors can insert their own protocol overrides"
on public.doctor_protocol_overrides
for insert
to authenticated
with check (auth.uid() = doctor_id);

drop policy if exists "Doctors can update their own protocol overrides" on public.doctor_protocol_overrides;
create policy "Doctors can update their own protocol overrides"
on public.doctor_protocol_overrides
for update
to authenticated
using (auth.uid() = doctor_id)
with check (auth.uid() = doctor_id);
