create table if not exists public.admin_biomarker_thresholds (
  key text primary key,
  moderate_value numeric(10, 2) not null,
  high_value numeric(10, 2) not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_protocol_rules (
  protocol_key public.patient_protocol_key primary key,
  title text not null,
  band text not null,
  cadence text not null,
  checkpoints text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_payout_settings (
  config_key text primary key default 'default',
  start_credit numeric(10, 2) not null,
  grow_credit numeric(10, 2) not null,
  power_credit numeric(10, 2) not null,
  reserve_rate numeric(10, 2) not null,
  monthly_release_day integer not null check (monthly_release_day between 1 and 28),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists admin_biomarker_thresholds_set_updated_at on public.admin_biomarker_thresholds;
create trigger admin_biomarker_thresholds_set_updated_at
before update on public.admin_biomarker_thresholds
for each row execute procedure public.set_updated_at();

drop trigger if exists admin_protocol_rules_set_updated_at on public.admin_protocol_rules;
create trigger admin_protocol_rules_set_updated_at
before update on public.admin_protocol_rules
for each row execute procedure public.set_updated_at();

drop trigger if exists admin_payout_settings_set_updated_at on public.admin_payout_settings;
create trigger admin_payout_settings_set_updated_at
before update on public.admin_payout_settings
for each row execute procedure public.set_updated_at();

insert into public.admin_biomarker_thresholds (key, moderate_value, high_value)
values
  ('hs_crp', 1.00, 3.00),
  ('nlr', 2.00, 3.00),
  ('tg_hdl', 2.00, 4.00),
  ('fasting_glucose', 100.00, 125.00),
  ('hba1c', 5.70, 6.40)
on conflict (key) do update
set
  moderate_value = excluded.moderate_value,
  high_value = excluded.high_value,
  updated_at = timezone('utc', now());

insert into public.admin_protocol_rules (
  protocol_key,
  title,
  band,
  cadence,
  checkpoints
)
values
  ('maintenance', 'Maintenance', '<30 IBI', 'Low-touch maintenance cadence', 'Monthly habit review'),
  ('start', 'Start Protocol', '30-60 IBI', 'Foundational daily support', '30-day pulse check'),
  ('grow', 'Grow Protocol', '60-80 IBI', 'Escalated recovery support', '45-day mid-check'),
  ('power', 'Power Protocol', '>80 IBI', 'Highest-intensity recovery track', '30-day doctor review')
on conflict (protocol_key) do update
set
  title = excluded.title,
  band = excluded.band,
  cadence = excluded.cadence,
  checkpoints = excluded.checkpoints,
  updated_at = timezone('utc', now());

insert into public.admin_payout_settings (
  config_key,
  start_credit,
  grow_credit,
  power_credit,
  reserve_rate,
  monthly_release_day
)
values ('default', 1200.00, 2600.00, 5200.00, 12.00, 5)
on conflict (config_key) do update
set
  start_credit = excluded.start_credit,
  grow_credit = excluded.grow_credit,
  power_credit = excluded.power_credit,
  reserve_rate = excluded.reserve_rate,
  monthly_release_day = excluded.monthly_release_day,
  updated_at = timezone('utc', now());

alter table public.admin_biomarker_thresholds enable row level security;
alter table public.admin_protocol_rules enable row level security;
alter table public.admin_payout_settings enable row level security;
