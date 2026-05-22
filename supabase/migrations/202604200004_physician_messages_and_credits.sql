do $$
begin
  if not exists (select 1 from pg_type where typname = 'patient_message_type') then
    create type public.patient_message_type as enum (
      'approval',
      'scan_reminder',
      'clinical_findings',
      'progress_update'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'doctor_credit_transaction_type'
  ) then
    create type public.doctor_credit_transaction_type as enum (
      'bioscan_review',
      'adjustment',
      'redemption'
    );
  end if;
end
$$;

alter type public.patient_event_name add value if not exists 'message_sent';

alter table public.protocol_plans
  add column if not exists bioscan_review_id uuid references public.bioscan_reviews (id) on delete set null,
  add column if not exists approved_by uuid references public.profiles (id) on delete set null,
  add column if not exists approved_at timestamptz;

create index if not exists protocol_plans_bioscan_review_id_idx
  on public.protocol_plans (bioscan_review_id);

create table if not exists public.patient_messages (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  doctor_id uuid references public.profiles (id) on delete set null,
  protocol_plan_id uuid references public.protocol_plans (id) on delete set null,
  bioscan_review_id uuid references public.bioscan_reviews (id) on delete set null,
  message_type public.patient_message_type not null,
  subject text not null,
  body text not null,
  sent_at timestamptz not null default timezone('utc', now()),
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.doctor_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.profiles (id) on delete cascade,
  patient_id uuid references public.profiles (id) on delete set null,
  bioscan_review_id uuid references public.bioscan_reviews (id) on delete set null,
  protocol_key public.patient_protocol_key,
  transaction_type public.doctor_credit_transaction_type not null,
  amount numeric(12, 2) not null default 0,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists doctor_credit_transactions_review_unique_idx
  on public.doctor_credit_transactions (bioscan_review_id)
  where transaction_type = 'bioscan_review';

create index if not exists patient_messages_patient_id_idx
  on public.patient_messages (patient_id, sent_at desc);

create index if not exists patient_messages_doctor_id_idx
  on public.patient_messages (doctor_id, sent_at desc);

create index if not exists doctor_credit_transactions_doctor_id_idx
  on public.doctor_credit_transactions (doctor_id, created_at desc);

create index if not exists doctor_credit_transactions_patient_id_idx
  on public.doctor_credit_transactions (patient_id, created_at desc);

drop trigger if exists patient_messages_set_updated_at on public.patient_messages;
create trigger patient_messages_set_updated_at
before update on public.patient_messages
for each row execute procedure public.set_updated_at();

alter table public.patient_messages enable row level security;
alter table public.doctor_credit_transactions enable row level security;

drop policy if exists "Patients can view their own patient messages" on public.patient_messages;
create policy "Patients can view their own patient messages"
on public.patient_messages
for select
to authenticated
using (auth.uid() = patient_id);

drop policy if exists "Doctors can view their own patient messages" on public.patient_messages;
create policy "Doctors can view their own patient messages"
on public.patient_messages
for select
to authenticated
using (auth.uid() = doctor_id);

drop policy if exists "Doctors can insert their own patient messages" on public.patient_messages;
create policy "Doctors can insert their own patient messages"
on public.patient_messages
for insert
to authenticated
with check (auth.uid() = doctor_id);

drop policy if exists "Doctors can update their own patient messages" on public.patient_messages;
create policy "Doctors can update their own patient messages"
on public.patient_messages
for update
to authenticated
using (auth.uid() = doctor_id)
with check (auth.uid() = doctor_id);

drop policy if exists "Doctors can view their own credit transactions" on public.doctor_credit_transactions;
create policy "Doctors can view their own credit transactions"
on public.doctor_credit_transactions
for select
to authenticated
using (auth.uid() = doctor_id);

drop policy if exists "Doctors can insert their own credit transactions" on public.doctor_credit_transactions;
create policy "Doctors can insert their own credit transactions"
on public.doctor_credit_transactions
for insert
to authenticated
with check (auth.uid() = doctor_id);
