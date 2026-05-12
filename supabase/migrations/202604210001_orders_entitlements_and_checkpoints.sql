do $$
begin
  if not exists (select 1 from pg_type where typname = 'patient_order_status') then
    create type public.patient_order_status as enum (
      'placed',
      'confirmed',
      'cancelled',
      'fulfilled'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'patient_protocol_entitlement_status'
  ) then
    create type public.patient_protocol_entitlement_status as enum (
      'checkout_pending',
      'ordered',
      'active',
      'follow_up_due',
      'completed',
      'cancelled',
      'declined'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'follow_up_checkpoint_status'
  ) then
    create type public.follow_up_checkpoint_status as enum (
      'scheduled',
      'due',
      'submitted',
      'reviewed',
      'missed'
    );
  end if;
end
$$;

alter type public.patient_event_name add value if not exists 'order_placed';
alter type public.patient_event_name add value if not exists 'checkpoint_submitted';
alter type public.patient_event_name add value if not exists 'checkpoint_reviewed';

alter table public.protocol_plans
  add column if not exists entitlement_status public.patient_protocol_entitlement_status not null default 'checkout_pending';

update public.protocol_plans
set entitlement_status =
  case status
    when 'active' then 'active'::public.patient_protocol_entitlement_status
    when 'completed' then 'completed'::public.patient_protocol_entitlement_status
    when 'cancelled' then 'cancelled'::public.patient_protocol_entitlement_status
    else 'checkout_pending'::public.patient_protocol_entitlement_status
  end
where entitlement_status is distinct from
  case status
    when 'active' then 'active'::public.patient_protocol_entitlement_status
    when 'completed' then 'completed'::public.patient_protocol_entitlement_status
    when 'cancelled' then 'cancelled'::public.patient_protocol_entitlement_status
    else 'checkout_pending'::public.patient_protocol_entitlement_status
  end;

create table if not exists public.patient_orders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  protocol_plan_id uuid unique references public.protocol_plans (id) on delete set null,
  bioscan_review_id uuid references public.bioscan_reviews (id) on delete set null,
  protocol_key public.patient_protocol_key not null,
  order_status public.patient_order_status not null default 'confirmed',
  full_name text not null,
  phone text not null,
  city text not null,
  address_line text not null,
  total_amount numeric(12, 2) not null,
  per_capsule_amount numeric(12, 2),
  capsule_count integer not null,
  bottle_count integer not null,
  supply_days integer not null,
  scans_included integer not null default 1,
  confirmation_code text not null unique,
  ordered_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.protocol_checkpoints (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  protocol_plan_id uuid not null references public.protocol_plans (id) on delete cascade,
  checkpoint_code text not null,
  title text not null,
  recommended_day integer not null check (recommended_day > 0),
  due_at timestamptz not null,
  status public.follow_up_checkpoint_status not null default 'scheduled',
  lab_result_id uuid references public.lab_results (id) on delete set null,
  bioscan_review_id uuid references public.bioscan_reviews (id) on delete set null,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint protocol_checkpoints_unique_code unique (protocol_plan_id, checkpoint_code)
);

create index if not exists patient_orders_patient_id_idx
  on public.patient_orders (patient_id, created_at desc);

create index if not exists patient_orders_protocol_plan_id_idx
  on public.patient_orders (protocol_plan_id);

create index if not exists protocol_checkpoints_patient_id_idx
  on public.protocol_checkpoints (patient_id, due_at asc);

create index if not exists protocol_checkpoints_plan_id_idx
  on public.protocol_checkpoints (protocol_plan_id, due_at asc);

create index if not exists protocol_checkpoints_status_idx
  on public.protocol_checkpoints (status, due_at asc);

drop trigger if exists patient_orders_set_updated_at on public.patient_orders;
create trigger patient_orders_set_updated_at
before update on public.patient_orders
for each row execute procedure public.set_updated_at();

drop trigger if exists protocol_checkpoints_set_updated_at on public.protocol_checkpoints;
create trigger protocol_checkpoints_set_updated_at
before update on public.protocol_checkpoints
for each row execute procedure public.set_updated_at();

alter table public.patient_orders enable row level security;
alter table public.protocol_checkpoints enable row level security;

drop policy if exists "Patients can view their own orders" on public.patient_orders;
create policy "Patients can view their own orders"
on public.patient_orders
for select
to authenticated
using (auth.uid() = patient_id);

drop policy if exists "Patients can insert their own orders" on public.patient_orders;
create policy "Patients can insert their own orders"
on public.patient_orders
for insert
to authenticated
with check (auth.uid() = patient_id);

drop policy if exists "Patients can update their own orders" on public.patient_orders;
create policy "Patients can update their own orders"
on public.patient_orders
for update
to authenticated
using (auth.uid() = patient_id)
with check (auth.uid() = patient_id);

drop policy if exists "Patients can view their own protocol checkpoints" on public.protocol_checkpoints;
create policy "Patients can view their own protocol checkpoints"
on public.protocol_checkpoints
for select
to authenticated
using (auth.uid() = patient_id);

drop policy if exists "Patients can insert their own protocol checkpoints" on public.protocol_checkpoints;
create policy "Patients can insert their own protocol checkpoints"
on public.protocol_checkpoints
for insert
to authenticated
with check (auth.uid() = patient_id);

drop policy if exists "Patients can update their own protocol checkpoints" on public.protocol_checkpoints;
create policy "Patients can update their own protocol checkpoints"
on public.protocol_checkpoints
for update
to authenticated
using (auth.uid() = patient_id)
with check (auth.uid() = patient_id);

insert into public.protocol_checkpoints (
  patient_id,
  protocol_plan_id,
  checkpoint_code,
  title,
  recommended_day,
  due_at,
  status,
  completed_at,
  created_at,
  updated_at
)
select
  plans.patient_id,
  plans.id,
  checkpoints.checkpoint_code,
  checkpoints.title,
  checkpoints.recommended_day,
  coalesce(plans.started_at, plans.created_at) + make_interval(days => checkpoints.recommended_day),
  case
    when plans.status = 'completed' then 'reviewed'::public.follow_up_checkpoint_status
    when coalesce(plans.started_at, plans.created_at) + make_interval(days => checkpoints.recommended_day) <= timezone('utc', now())
      then 'due'::public.follow_up_checkpoint_status
    else 'scheduled'::public.follow_up_checkpoint_status
  end,
  case
    when plans.status = 'completed' then coalesce(plans.completed_at, plans.updated_at, plans.created_at)
    else null
  end,
  plans.created_at,
  plans.updated_at
from public.protocol_plans as plans
cross join lateral (
  select *
  from (
    values
      ('day_30', '30-day checkpoint review', 30),
      ('day_60', '60-day follow-up review', 60),
      ('day_90', '90-day completion review', 90)
  ) as checkpoints(checkpoint_code, title, recommended_day)
  where
    (plans.protocol_key in ('maintenance', 'start') and checkpoints.recommended_day = 30)
    or (plans.protocol_key = 'grow' and checkpoints.recommended_day in (30, 60))
    or (plans.protocol_key = 'power' and checkpoints.recommended_day in (30, 60, 90))
) as checkpoints
where not exists (
  select 1
  from public.protocol_checkpoints as existing
  where existing.protocol_plan_id = plans.id
    and existing.checkpoint_code = checkpoints.checkpoint_code
);
