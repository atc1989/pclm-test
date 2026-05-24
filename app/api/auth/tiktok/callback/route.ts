import { NextRequest, NextResponse } from "next/server";

import { createAdminClient, createClient } from "@/lib/supabase/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
const TIKTOK_REDIRECT_URI =
  process.env.TIKTOK_REDIRECT_URI ?? (APP_URL ? `${APP_URL}/api/auth/tiktok/callback` : null);
const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/";

const SIGN_IN_PATH = "/patient/sign-in";
const SIGNED_IN_PATH = "/patient/dashboard";

type TikTokTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  open_id?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type TikTokUserInfoResponse = {
  data?: {
    user?: {
      open_id?: string;
      union_id?: string;
      avatar_url?: string;
      avatar_url_100?: string;
      avatar_large_url?: string;
      display_name?: string;
    };
  };
  error?: {
    code?: string;
    message?: string;
    log_id?: string;
  };
};

type TikTokProfile = {
  open_id?: string;
  union_id?: string;
  avatar_url?: string;
  avatar_url_100?: string;
  avatar_large_url?: string;
  display_name?: string;
};

type SocialIdentityRow = {
  id: string;
  user_id: string | null;
};

function isSupabaseOpaqueKey(key: string) {
  return key.startsWith("sb_publishable_") || key.startsWith("sb_secret_");
}

function serviceRoleHeaders(extra: Record<string, string> = {}) {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    ...extra,
  };

  if (!isSupabaseOpaqueKey(SUPABASE_SERVICE_ROLE_KEY)) {
    headers.Authorization = `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`;
  }

  return headers;
}

function getRedirectUrl(origin: string, path: string) {
  return new URL(path, origin);
}

function clearStateCookie(response: NextResponse) {
  response.cookies.set({
    name: "tiktok_oauth_state",
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function getExpiryIso(expiresInSeconds: number | undefined) {
  if (!expiresInSeconds || !Number.isFinite(expiresInSeconds)) {
    return null;
  }

  return new Date(Date.now() + expiresInSeconds * 1000).toISOString();
}

function syntheticEmailFor(openId: string) {
  // .invalid is reserved by RFC 2606, guaranteed never-routable — no email
  // is ever sent because we call createUser with email_confirm: true.
  return `tiktok-${openId.toLowerCase()}@social.gutguard.invalid`;
}

async function exchangeCodeForToken(code: string) {
  if (!TIKTOK_CLIENT_KEY || !TIKTOK_CLIENT_SECRET || !TIKTOK_REDIRECT_URI) {
    throw new Error("Missing TikTok OAuth environment variables.");
  }

  const body = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    client_secret: TIKTOK_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: TIKTOK_REDIRECT_URI,
  });

  const response = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body: body.toString(),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as TikTokTokenResponse | null;

  if (!response.ok || !payload?.access_token) {
    throw new Error(payload?.error_description || payload?.error || "TikTok token exchange failed.");
  }

  return payload as TikTokTokenResponse & { access_token: string };
}

async function fetchTikTokProfile(accessToken: string) {
  const profileUrl = new URL(TIKTOK_USER_INFO_URL);
  profileUrl.searchParams.set(
    "fields",
    "open_id,union_id,avatar_url,avatar_url_100,avatar_large_url,display_name",
  );

  const response = await fetch(profileUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as TikTokUserInfoResponse | null;
  const user = payload?.data?.user;

  if (!response.ok || !user?.open_id) {
    throw new Error(payload?.error?.message || "TikTok profile fetch failed.");
  }

  return user as TikTokProfile & { open_id: string };
}

async function findExistingIdentity(openId: string): Promise<SocialIdentityRow | null> {
  if (!SUPABASE_URL) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");

  const url = `${SUPABASE_URL}/rest/v1/social_identities?provider=eq.tiktok&provider_user_id=eq.${encodeURIComponent(openId)}&select=id,user_id&order=user_id.desc.nullslast&limit=1`;
  const response = await fetch(url, { headers: serviceRoleHeaders(), cache: "no-store" });

  if (!response.ok) {
    // social_identities may not exist yet (migration not run) — surface clear error
    throw new Error(`social_identities lookup failed: ${await response.text()}`);
  }

  const rows = (await response.json().catch(() => [])) as SocialIdentityRow[];
  return rows[0] ?? null;
}

async function upsertIdentity(params: {
  existing: SocialIdentityRow | null;
  userId: string;
  profile: TikTokProfile;
  token: TikTokTokenResponse;
  request: NextRequest;
}) {
  if (!SUPABASE_URL) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");

  const { existing, userId, profile, token, request } = params;

  const record = {
    user_id: userId,
    provider: "tiktok",
    provider_user_id: profile.open_id ?? null,
    provider_union_id: profile.union_id ?? null,
    provider_display_name: profile.display_name ?? null,
    avatar_url:
      profile.avatar_large_url ?? profile.avatar_url_100 ?? profile.avatar_url ?? null,
    access_token: token.access_token,
    refresh_token: token.refresh_token ?? null,
    scope: token.scope ?? null,
    token_expires_at: getExpiryIso(token.expires_in),
    refresh_token_expires_at: getExpiryIso(token.refresh_expires_in),
    profile_data: profile ?? {},
    metadata: {
      linked_from: "tiktok_oauth_callback",
      user_agent: request.headers.get("user-agent"),
      updated_via: existing ? "update" : "insert",
    },
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/social_identities?id=eq.${existing.id}`,
      {
        method: "PATCH",
        headers: serviceRoleHeaders({ Prefer: "return=minimal" }),
        body: JSON.stringify(record),
        cache: "no-store",
      },
    );
    if (!response.ok) throw new Error(await response.text());
    return existing.id;
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/social_identities`, {
    method: "POST",
    headers: serviceRoleHeaders({ Prefer: "return=representation" }),
    body: JSON.stringify(record),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await response.text());

  const [row] = (await response.json().catch(() => [])) as Array<{ id?: string }>;
  return row?.id ?? null;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const storedState = request.cookies.get("tiktok_oauth_state")?.value;

  if (!state || !storedState || state !== storedState) {
    const response = NextResponse.redirect(
      getRedirectUrl(requestUrl.origin, `${SIGN_IN_PATH}?error=tiktok_invalid_state`),
    );
    clearStateCookie(response);
    return response;
  }

  if (!code) {
    const response = NextResponse.redirect(
      getRedirectUrl(requestUrl.origin, `${SIGN_IN_PATH}?error=tiktok_callback_failed`),
    );
    clearStateCookie(response);
    return response;
  }

  try {
    // 1. Exchange TikTok code for tokens + profile
    const token = await exchangeCodeForToken(code);
    const profile = await fetchTikTokProfile(token.access_token);
    const openId = profile.open_id;
    const email = syntheticEmailFor(openId);
    const displayName = profile.display_name ?? null;
    const avatarUrl =
      profile.avatar_large_url ?? profile.avatar_url_100 ?? profile.avatar_url ?? null;

    // 2. Look up any existing linked identity
    const existing = await findExistingIdentity(openId);
    let userId = existing?.user_id ?? null;

    const admin = await createAdminClient();

    // 3. Create a Supabase user if this TikTok account hasn't been linked yet
    if (!userId) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          role: "patient",
          full_name: displayName,
          avatar_url: avatarUrl,
          provider: "tiktok",
          tiktok_open_id: openId,
          tiktok_display_name: displayName,
        },
      });

      if (createErr || !created?.user) {
        throw new Error(createErr?.message ?? "Failed to create Supabase user for TikTok login.");
      }

      userId = created.user.id;
    }

    // 4. Upsert the social_identities row so tokens are refreshed every sign-in
    await upsertIdentity({ existing, userId, profile, token, request });

    // 5. Issue a Supabase session: generate a magic-link via admin, verify it
    //    server-side so the SSR cookie adapter writes the session cookies.
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    const hashedToken = linkData?.properties?.hashed_token;
    if (linkErr || !hashedToken) {
      throw new Error(linkErr?.message ?? "Failed to generate sign-in token.");
    }

    const supabase = await createClient();
    const { error: verifyErr } = await supabase.auth.verifyOtp({
      token_hash: hashedToken,
      type: "magiclink",
    });
    if (verifyErr) {
      throw new Error(verifyErr.message);
    }

    // 6. Done. Session cookies are set on the response by the SSR adapter.
    const response = NextResponse.redirect(getRedirectUrl(requestUrl.origin, SIGNED_IN_PATH));
    clearStateCookie(response);
    return response;
  } catch (error) {
    console.error("TikTok callback failed:", error);
    const response = NextResponse.redirect(
      getRedirectUrl(requestUrl.origin, `${SIGN_IN_PATH}?error=tiktok_callback_failed`),
    );
    clearStateCookie(response);
    return response;
  }
}
