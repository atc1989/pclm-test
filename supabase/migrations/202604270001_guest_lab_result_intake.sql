alter table public.lab_result_ingestions
  alter column patient_id drop not null;

alter table public.lab_result_files
  alter column patient_id drop not null;

alter table public.lab_result_ingestions
  add column if not exists guest_claim_token text;

create index if not exists lab_result_ingestions_guest_claim_token_idx
  on public.lab_result_ingestions (guest_claim_token)
  where guest_claim_token is not null;
