-- Social identities table for third-party OAuth providers (TikTok, etc.)
--
-- The TikTok OAuth callback (app/api/auth/tiktok/callback) inserts rows here
-- using the service-role key. user_id is nullable so a TikTok login can be
-- recorded before the user has linked it to a Supabase auth account.

create table if not exists public.social_identities (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid references auth.users(id) on delete cascade,
  provider                    text not null,
  provider_user_id            text,
  provider_union_id           text,
  provider_display_name       text,
  avatar_url                  text,
  access_token                text,
  refresh_token               text,
  scope                       text,
  token_expires_at            timestamptz,
  refresh_token_expires_at    timestamptz,
  profile_data                jsonb not null default '{}'::jsonb,
  metadata                    jsonb not null default '{}'::jsonb,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists social_identities_user_id_idx
  on public.social_identities(user_id);

create index if not exists social_identities_provider_idx
  on public.social_identities(provider, provider_user_id);

alter table public.social_identities enable row level security;

-- Service role bypasses RLS; that's how the callback writes rows.
-- Authenticated users can read their own linked identities.
drop policy if exists "Users can read own social identities"
  on public.social_identities;

create policy "Users can read own social identities"
  on public.social_identities
  for select
  to authenticated
  using (auth.uid() = user_id);
