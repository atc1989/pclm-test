do $$
begin
  if not exists (select 1 from pg_type where typname = 'bioscan_review_status') then
    create type public.bioscan_review_status as enum (
      'pending_review',
      'approved',
      'declined'
    );
  end if;
end
$$;

alter table public.inflammation_scores
  add column if not exists physician_confirmed boolean not null default false,
  add column if not exists confirmed_at timestamptz,
  add column if not exists confirmed_by uuid references public.profiles (id) on delete set null;

create table if not exists public.bioscan_reviews (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  lab_result_id uuid not null unique references public.lab_results (id) on delete cascade,
  assigned_doctor_id uuid references public.profiles (id) on delete set null,
  status public.bioscan_review_status not null default 'pending_review',
  approved_protocol public.patient_protocol_key,
  review_note text,
  decline_reason text,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists bioscan_reviews_patient_id_idx
  on public.bioscan_reviews (patient_id, created_at desc);

create index if not exists bioscan_reviews_status_idx
  on public.bioscan_reviews (status, created_at desc);

create index if not exists bioscan_reviews_assigned_doctor_id_idx
  on public.bioscan_reviews (assigned_doctor_id, created_at desc);

drop trigger if exists bioscan_reviews_set_updated_at on public.bioscan_reviews;
create trigger bioscan_reviews_set_updated_at
before update on public.bioscan_reviews
for each row execute procedure public.set_updated_at();

alter table public.bioscan_reviews enable row level security;

drop policy if exists "Patients can view their own bioscan reviews" on public.bioscan_reviews;
create policy "Patients can view their own bioscan reviews"
on public.bioscan_reviews
for select
to authenticated
using (auth.uid() = patient_id);

drop policy if exists "Patients can insert their own bioscan reviews" on public.bioscan_reviews;
create policy "Patients can insert their own bioscan reviews"
on public.bioscan_reviews
for insert
to authenticated
with check (
  auth.uid() = patient_id
  and assigned_doctor_id is null
  and status = 'pending_review'
);

drop policy if exists "Patients can update their own pending bioscan reviews" on public.bioscan_reviews;
create policy "Patients can update their own pending bioscan reviews"
on public.bioscan_reviews
for update
to authenticated
using (auth.uid() = patient_id and status = 'pending_review')
with check (auth.uid() = patient_id);
