-- Guarantee at most one row per (provider, provider_user_id) so the TikTok
-- callback's SELECT-then-INSERT pattern stays consistent under concurrent
-- sign-ins. Partial index so rows without a provider_user_id (legacy /
-- in-flight) aren't constrained.

create unique index if not exists social_identities_provider_user_uniq
  on public.social_identities (provider, provider_user_id)
  where provider_user_id is not null;
