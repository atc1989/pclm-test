"use client";

import { createClient } from "@/lib/supabase/client";

type SupabaseOAuthProvider = "google" | "facebook" | "github";

function getRedirectTo() {
  return `${window.location.origin}/auth/callback`;
}

function signInWithOAuth(provider: SupabaseOAuthProvider) {
  const supabase = createClient();

  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: getRedirectTo(),
    },
  });
}

export function signInWithGoogle() {
  return signInWithOAuth("google");
}

export function signInWithFacebook() {
  return signInWithOAuth("facebook");
}

export function signInWithGitHub() {
  return signInWithOAuth("github");
}

export function signInWithTikTok() {
  // TikTok uses a fully custom OAuth flow served by /api/auth/tiktok/start.
  // Navigate the top-level window so the redirect chain to TikTok works
  // even when called from inside a modal/component.
  window.location.href = "/api/auth/tiktok/start";
}
