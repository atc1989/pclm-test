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
      when new.raw_user_meta_data ->> 'role' = 'internal_admin' then 'internal_admin'::public.user_role
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

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (
  auth.uid() = id
  and role in ('doctor', 'patient', 'internal_admin')
);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role in ('doctor', 'patient', 'internal_admin')
);
