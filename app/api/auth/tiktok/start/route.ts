import crypto from "node:crypto";
import { NextResponse } from "next/server";

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
const TIKTOK_REDIRECT_URI =
  process.env.TIKTOK_REDIRECT_URI ?? (APP_URL ? `${APP_URL}/api/auth/tiktok/callback` : null);
const TIKTOK_AUTHORIZE_URL = "https://www.tiktok.com/v2/auth/authorize/";

function getErrorResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET() {
  if (!TIKTOK_CLIENT_KEY || !TIKTOK_REDIRECT_URI) {
    return getErrorResponse("Missing TikTok OAuth environment variables.");
  }

  const state = crypto.randomBytes(32).toString("hex");
  const authorizeUrl = new URL(TIKTOK_AUTHORIZE_URL);

  authorizeUrl.searchParams.set("client_key", TIKTOK_CLIENT_KEY);
  authorizeUrl.searchParams.set("scope", "user.info.basic");
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("redirect_uri", TIKTOK_REDIRECT_URI);
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl);

  response.cookies.set({
    name: "tiktok_oauth_state",
    value: state,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
