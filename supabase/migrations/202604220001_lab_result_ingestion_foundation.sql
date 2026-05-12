insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'lab-results-private',
  'lab-results-private',
  false,
  12582912,
  array[
    'application/pdf',
    'image/heic',
    'image/heif',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.lab_result_ingestions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  journey_position integer not null check (journey_position >= 0),
  follow_up_number integer,
  stage public.patient_scan_stage not null,
  status text not null,
  upload_source text not null,
  confirmed_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lab_result_files (
  id uuid primary key default gen_random_uuid(),
  ingestion_id uuid not null references public.lab_result_ingestions (id) on delete cascade,
  patient_id uuid not null references public.profiles (id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  mime_type text not null,
  file_size bigint not null check (file_size > 0),
  original_filename text,
  uploaded_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lab_result_ocr_runs (
  id uuid primary key default gen_random_uuid(),
  ingestion_id uuid not null references public.lab_result_ingestions (id) on delete cascade,
  provider text not null,
  provider_model text,
  status text not null,
  raw_text text,
  raw_json jsonb not null default '{}'::jsonb,
  tables_json jsonb not null default '[]'::jsonb,
  confidence_json jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lab_result_normalizations (
  id uuid primary key default gen_random_uuid(),
  ingestion_id uuid not null references public.lab_result_ingestions (id) on delete cascade,
  provider text not null,
  provider_model text,
  status text not null,
  normalized_json jsonb not null default '{}'::jsonb,
  warnings_json jsonb not null default '[]'::jsonb,
  field_confidence_json jsonb not null default '{}'::jsonb,
  missing_fields_json jsonb not null default '[]'::jsonb,
  conflicts_json jsonb not null default '[]'::jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lab_result_confirmations (
  id uuid primary key default gen_random_uuid(),
  ingestion_id uuid not null references public.lab_result_ingestions (id) on delete cascade,
  patient_id uuid not null references public.profiles (id) on delete cascade,
  confirmed_json jsonb not null default '{}'::jsonb,
  edited_fields_json jsonb not null default '[]'::jsonb,
  confirmation_mode text not null,
  confirmed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists lab_result_ingestions_patient_id_idx
  on public.lab_result_ingestions (patient_id, created_at desc);

create index if not exists lab_result_ingestions_status_idx
  on public.lab_result_ingestions (status, created_at desc);

create index if not exists lab_result_files_patient_id_idx
  on public.lab_result_files (patient_id, created_at desc);

create index if not exists lab_result_ocr_runs_ingestion_id_idx
  on public.lab_result_ocr_runs (ingestion_id, created_at desc);

create index if not exists lab_result_normalizations_ingestion_id_idx
  on public.lab_result_normalizations (ingestion_id, created_at desc);

create index if not exists lab_result_confirmations_patient_id_idx
  on public.lab_result_confirmations (patient_id, created_at desc);

drop trigger if exists lab_result_ingestions_set_updated_at on public.lab_result_ingestions;
create trigger lab_result_ingestions_set_updated_at
before update on public.lab_result_ingestions
for each row execute procedure public.set_updated_at();

alter table public.lab_result_ingestions enable row level security;
alter table public.lab_result_files enable row level security;
alter table public.lab_result_ocr_runs enable row level security;
alter table public.lab_result_normalizations enable row level security;
alter table public.lab_result_confirmations enable row level security;

drop policy if exists "Patients can view their own lab result ingestions" on public.lab_result_ingestions;
create policy "Patients can view their own lab result ingestions"
on public.lab_result_ingestions
for select
to authenticated
using (auth.uid() = patient_id);

drop policy if exists "Patients can insert their own lab result ingestions" on public.lab_result_ingestions;
create policy "Patients can insert their own lab result ingestions"
on public.lab_result_ingestions
for insert
to authenticated
with check (auth.uid() = patient_id);

drop policy if exists "Patients can update their own lab result ingestions" on public.lab_result_ingestions;
create policy "Patients can update their own lab result ingestions"
on public.lab_result_ingestions
for update
to authenticated
using (auth.uid() = patient_id)
with check (auth.uid() = patient_id);

drop policy if exists "Patients can view their own lab result files" on public.lab_result_files;
create policy "Patients can view their own lab result files"
on public.lab_result_files
for select
to authenticated
using (auth.uid() = patient_id);

drop policy if exists "Patients can insert their own lab result files" on public.lab_result_files;
create policy "Patients can insert their own lab result files"
on public.lab_result_files
for insert
to authenticated
with check (auth.uid() = patient_id);

drop policy if exists "Patients can update their own lab result files" on public.lab_result_files;
create policy "Patients can update their own lab result files"
on public.lab_result_files
for update
to authenticated
using (auth.uid() = patient_id)
with check (auth.uid() = patient_id);

drop policy if exists "Patients can view their own lab result ocr runs" on public.lab_result_ocr_runs;
create policy "Patients can view their own lab result ocr runs"
on public.lab_result_ocr_runs
for select
to authenticated
using (
  exists (
    select 1
    from public.lab_result_ingestions
    where lab_result_ingestions.id = lab_result_ocr_runs.ingestion_id
      and lab_result_ingestions.patient_id = auth.uid()
  )
);

drop policy if exists "Patients can insert their own lab result ocr runs" on public.lab_result_ocr_runs;
create policy "Patients can insert their own lab result ocr runs"
on public.lab_result_ocr_runs
for insert
to authenticated
with check (
  exists (
    select 1
    from public.lab_result_ingestions
    where lab_result_ingestions.id = lab_result_ocr_runs.ingestion_id
      and lab_result_ingestions.patient_id = auth.uid()
  )
);

drop policy if exists "Patients can update their own lab result ocr runs" on public.lab_result_ocr_runs;
create policy "Patients can update their own lab result ocr runs"
on public.lab_result_ocr_runs
for update
to authenticated
using (
  exists (
    select 1
    from public.lab_result_ingestions
    where lab_result_ingestions.id = lab_result_ocr_runs.ingestion_id
      and lab_result_ingestions.patient_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.lab_result_ingestions
    where lab_result_ingestions.id = lab_result_ocr_runs.ingestion_id
      and lab_result_ingestions.patient_id = auth.uid()
  )
);

drop policy if exists "Patients can view their own lab result normalizations" on public.lab_result_normalizations;
create policy "Patients can view their own lab result normalizations"
on public.lab_result_normalizations
for select
to authenticated
using (
  exists (
    select 1
    from public.lab_result_ingestions
    where lab_result_ingestions.id = lab_result_normalizations.ingestion_id
      and lab_result_ingestions.patient_id = auth.uid()
  )
);

drop policy if exists "Patients can insert their own lab result normalizations" on public.lab_result_normalizations;
create policy "Patients can insert their own lab result normalizations"
on public.lab_result_normalizations
for insert
to authenticated
with check (
  exists (
    select 1
    from public.lab_result_ingestions
    where lab_result_ingestions.id = lab_result_normalizations.ingestion_id
      and lab_result_ingestions.patient_id = auth.uid()
  )
);

drop policy if exists "Patients can update their own lab result normalizations" on public.lab_result_normalizations;
create policy "Patients can update their own lab result normalizations"
on public.lab_result_normalizations
for update
to authenticated
using (
  exists (
    select 1
    from public.lab_result_ingestions
    where lab_result_ingestions.id = lab_result_normalizations.ingestion_id
      and lab_result_ingestions.patient_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.lab_result_ingestions
    where lab_result_ingestions.id = lab_result_normalizations.ingestion_id
      and lab_result_ingestions.patient_id = auth.uid()
  )
);

drop policy if exists "Patients can view their own lab result confirmations" on public.lab_result_confirmations;
create policy "Patients can view their own lab result confirmations"
on public.lab_result_confirmations
for select
to authenticated
using (auth.uid() = patient_id);

drop policy if exists "Patients can insert their own lab result confirmations" on public.lab_result_confirmations;
create policy "Patients can insert their own lab result confirmations"
on public.lab_result_confirmations
for insert
to authenticated
with check (auth.uid() = patient_id);

drop policy if exists "Patients can update their own lab result confirmations" on public.lab_result_confirmations;
create policy "Patients can update their own lab result confirmations"
on public.lab_result_confirmations
for update
to authenticated
using (auth.uid() = patient_id)
with check (auth.uid() = patient_id);

drop policy if exists "Patients can upload their own private lab result files" on storage.objects;
create policy "Patients can upload their own private lab result files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'lab-results-private'
  and (storage.foldername(name))[1] = 'patients'
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists "Patients can view their own private lab result files" on storage.objects;
create policy "Patients can view their own private lab result files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'lab-results-private'
  and (storage.foldername(name))[1] = 'patients'
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists "Patients can update their own private lab result files" on storage.objects;
create policy "Patients can update their own private lab result files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'lab-results-private'
  and (storage.foldername(name))[1] = 'patients'
  and (storage.foldername(name))[2] = auth.uid()::text
)
with check (
  bucket_id = 'lab-results-private'
  and (storage.foldername(name))[1] = 'patients'
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists "Patients can delete their own private lab result files" on storage.objects;
create policy "Patients can delete their own private lab result files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'lab-results-private'
  and (storage.foldername(name))[1] = 'patients'
  and (storage.foldername(name))[2] = auth.uid()::text
);
