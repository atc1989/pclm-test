import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

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

function isSupabaseOpaqueKey(key: string) {
  return key.startsWith("sb_publishable_") || key.startsWith("sb_secret_");
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
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as TikTokUserInfoResponse | null;
  const user = payload?.data?.user;

  if (!response.ok || !user?.open_id) {
    throw new Error(payload?.error?.message || "TikTok profile fetch failed.");
  }

  return user;
}

async function storeSocialIdentity(params: {
  accessToken: string;
  profile: TikTokProfile;
  refreshToken: string | undefined;
  request: NextRequest;
  scope: string | undefined;
  tokenExpiresIn: number | undefined;
  refreshTokenExpiresIn: number | undefined;
  supabaseUserId: string | null;
}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Prefer: "return=representation",
  };

  if (!isSupabaseOpaqueKey(SUPABASE_SERVICE_ROLE_KEY)) {
    headers.Authorization = `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`;
  }

  const identityRecord = {
    user_id: params.supabaseUserId,
    provider: "tiktok",
    provider_user_id: params.profile?.open_id ?? null,
    provider_union_id: params.profile?.union_id ?? null,
    provider_display_name: params.profile?.display_name ?? null,
    avatar_url:
      params.profile?.avatar_large_url ??
      params.profile?.avatar_url_100 ??
      params.profile?.avatar_url ??
      null,
    access_token: params.accessToken,
    refresh_token: params.refreshToken ?? null,
    scope: params.scope ?? null,
    token_expires_at: getExpiryIso(params.tokenExpiresIn),
    refresh_token_expires_at: getExpiryIso(params.refreshTokenExpiresIn),
    profile_data: params.profile ?? {},
    metadata: {
      linked_from: "tiktok_oauth_callback",
      user_agent: params.request.headers.get("user-agent"),
    },
  };

  const response = await fetch(`${SUPABASE_URL}/rest/v1/social_identities`, {
    method: "POST",
    headers,
    body: JSON.stringify(identityRecord),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to store social identity.");
  }

  const [savedIdentity] = (await response.json().catch(() => [])) as Array<{ id?: string }>;

  return savedIdentity?.id ?? null;
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
    const token = await exchangeCodeForToken(code);
    const profile = await fetchTikTokProfile(token.access_token);
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const savedIdentityId = await storeSocialIdentity({
      accessToken: token.access_token,
      profile,
      refreshToken: token.refresh_token,
      request,
      scope: token.scope,
      tokenExpiresIn: token.expires_in,
      refreshTokenExpiresIn: token.refresh_expires_in,
      supabaseUserId: userData.user?.id ?? null,
    });

    const response = userData.user
      ? NextResponse.redirect(getRedirectUrl(requestUrl.origin, SIGNED_IN_PATH))
      : NextResponse.redirect(
          getRedirectUrl(requestUrl.origin, `${SIGN_IN_PATH}?provider=tiktok`),
        );

    clearStateCookie(response);

    if (!userData.user && savedIdentityId) {
      response.cookies.set({
        name: "tiktok_link_identity",
        value: savedIdentityId,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }

    return response;
  } catch {
    const response = NextResponse.redirect(
      getRedirectUrl(requestUrl.origin, `${SIGN_IN_PATH}?error=tiktok_callback_failed`),
    );
    clearStateCookie(response);
    return response;
  }
}
