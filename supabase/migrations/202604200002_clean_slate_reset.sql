-- WARNING:
-- This migration is intentionally destructive.
-- It wipes patient/physician workflow data but preserves:
-- 1) any auth user whose profile role is internal_admin
-- 2) the matching internal_admin profile row
-- 3) admin configuration tables
--
-- Use only for clean-slate testing in non-production environments.

-- Reset all mutable public workflow tables introduced by the legacy app
-- and the PRD-aligned rebuild, but keep admin config + profiles intact.
do $$
declare
  reset_tables text;
begin
  select string_agg(format('public.%I', tablename), ', ' order by tablename)
  into reset_tables
  from pg_tables
  where schemaname = 'public'
    and tablename in (
      'biomarker_records',
      'bioscan_reviews',
      'doctor_clinics',
      'doctor_credit_transactions',
      'doctor_notes',
      'doctor_patient_assignments',
      'doctor_protocol_overrides',
      'doctor_verifications',
      'event_logs',
      'inflammation_scores',
      'lab_results',
      'onboarding_status',
      'patient_messages',
      'patient_orders',
      'protocol_checkpoints',
      'protocol_days',
      'protocol_plans',
      'transformation_logs'
    );

  if reset_tables is not null then
    execute format('truncate table %s restart identity cascade', reset_tables);
  end if;
end
$$;

delete from auth.users
where id not in (
  select id
  from public.profiles
  where role = 'internal_admin'
);

delete from public.profiles
where role <> 'internal_admin';
