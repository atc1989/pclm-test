"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithFacebook,
  signInWithGitHub,
  signInWithGoogle,
  signInWithTikTok,
} from "@/lib/auth/social-login";

const TIKTOK_ERRORS: Record<string, string> = {
  tiktok_invalid_state: "Your TikTok sign-in session expired. Please try again.",
  tiktok_callback_failed: "We could not complete your TikTok sign-in. Please try again.",
};

function PatientSignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/patient/dashboard";
  const errorParam = searchParams.get("error");
  const providerParam = searchParams.get("provider");

  const [isNew, setIsNew] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (errorParam && TIKTOK_ERRORS[errorParam]) {
      setError(TIKTOK_ERRORS[errorParam]);
    }
    if (providerParam === "tiktok") {
      setInfo("TikTok connected. Sign in or create an account to link it.");
    }
  }, [errorParam, providerParam]);

  async function handleSignIn(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/patient-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(next);
      } else {
        setError(data.error || "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/patient-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(next);
      } else if (data.confirmEmail) {
        setInfo("Check your email to confirm your account, then sign in here.");
        setError("");
        setIsNew(false);
      } else if (data.userExists) {
        setError("An account with this email already exists. Sign in instead.");
        setIsNew(false);
      } else {
        setError(data.error || "Could not create account. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{pageStyles}</style>
      <div className="auth-page">
        {/* ── Left: GLIS ring + wisdom ── */}
        <aside className="auth-art" aria-hidden="true">
          <div className="auth-art-orb auth-art-orb-1" />
          <div className="auth-art-orb auth-art-orb-2" />
          <div className="auth-art-orb auth-art-orb-3" />
          <div className="auth-art-noise" />

          <div className="auth-art-inner">
            <div className="auth-art-tag">
              <span className="auth-art-dot" /> A Wise Word
            </div>

            <div className="auth-ring-wrap">
              <div className="auth-ring-glow" />
              <div className="auth-ring-trk" />
              <div className="auth-ring-fill" />
              <div className="auth-ring-ctr">
                <span className="auth-ring-score">31</span>
                <span className="auth-ring-lbl">GLIS</span>
              </div>
            </div>
            <div className="auth-ring-verdict">✓ Inflammation Controlled</div>

            <div className="auth-art-copy">
              <h1 className="auth-art-h">
                Get the <em>direction</em>
                <br />
                you actually need.
              </h1>
              <p className="auth-art-p">
                Your inflammation has a number. The right protocol moves it.
                Your physician watches every step.
              </p>
            </div>

            <div className="auth-art-trust">
              <span>FDA-PH Registered</span>
              <span>Physician-reviewed</span>
              <span>90-day guarantee</span>
            </div>
          </div>
        </aside>

        {/* ── Right: form panel ── */}
        <main className="auth-panel">
          <div className="auth-card">
            <div className="auth-logo">
              <div className="auth-shield">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span className="auth-wordmark">
                Gut<em>Guard</em>
              </span>
            </div>

            <div className="auth-head">
              <h2 className="auth-h">{isNew ? "Create your account" : "Welcome back"}</h2>
              <p className="auth-sub">
                {isNew
                  ? "Sign up to save your score and start your protocol."
                  : "Enter your email and password to access your account."}
              </p>
            </div>

            {error && (
              <div className="auth-alert auth-alert-err" role="alert">
                {error}
              </div>
            )}
            {info && !error && (
              <div className="auth-alert auth-alert-ok" role="status">
                {info}
              </div>
            )}

            <form className="auth-form" onSubmit={isNew ? handleSignUp : handleSignIn}>
              <div className="auth-field">
                <label htmlFor="auth-email">Email</label>
                <input
                  id="auth-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="auth-password">Password</label>
                <div className="auth-input-wrap">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isNew ? "Min. 8 characters" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={isNew ? 8 : undefined}
                    autoComplete={isNew ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="auth-row">
                <label className="auth-check">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                {!isNew && (
                  <a href="#" className="auth-link-muted">
                    Forgot password?
                  </a>
                )}
              </div>

              <button type="submit" className={`auth-submit${loading ? " is-loading" : ""}`} disabled={loading}>
                {loading ? "Working…" : isNew ? "Create Account" : "Sign In"}
              </button>
            </form>

            <div className="auth-divider">
              <span>Or continue with</span>
            </div>

            <div className="auth-socials">
              <button type="button" className="auth-social auth-social-google" onClick={() => signInWithGoogle()}>
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
              <button type="button" className="auth-social auth-social-tiktok" onClick={signInWithTikTok}>
                <TikTokIcon />
                <span>Continue with TikTok</span>
              </button>
              <button type="button" className="auth-social auth-social-fb" onClick={() => signInWithFacebook()}>
                <FacebookIcon />
                <span>Continue with Facebook</span>
              </button>
              <button type="button" className="auth-social auth-social-gh" onClick={() => signInWithGitHub()}>
                <GitHubIcon />
                <span>Continue with GitHub</span>
              </button>
            </div>

            <div className="auth-foot">
              {isNew ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                className="auth-link"
                onClick={() => {
                  setIsNew((v) => !v);
                  setError("");
                  setInfo("");
                }}
              >
                {isNew ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12.24 10.285v3.955h5.518c-.223 1.273-.963 2.352-2.074 3.076l3.355 2.603c1.955-1.8 3.081-4.451 3.081-7.604 0-.724-.065-1.419-.184-2.03z" />
      <path fill="#34A853" d="M12 22c2.79 0 5.13-.925 6.84-2.502l-3.355-2.603c-.925.62-2.104.992-3.485.992-2.68 0-4.95-1.81-5.762-4.244H2.77v2.684A9.997 9.997 0 0 0 12 22z" />
      <path fill="#4A90E2" d="M6.238 13.643A5.996 5.996 0 0 1 5.916 12c0-.57.099-1.125.322-1.643V7.673H2.77A9.997 9.997 0 0 0 2 12c0 1.61.387 3.131 1.07 4.327z" />
      <path fill="#FBBC05" d="M12 6.113c1.517 0 2.875.521 3.944 1.547l2.96-2.96C17.116 3.043 14.778 2 12 2 8.092 2 4.728 4.238 2.77 7.673l3.468 2.684C7.05 7.923 9.32 6.113 12 6.113z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.87.24-1.46 1.49-1.46H16V4.96c-.18-.02-.81-.08-1.54-.08-3.06 0-4.96 1.87-4.96 5.3V11H7v3h2.5v7h4z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.22c0 4.51 2.87 8.34 6.84 9.69.5.1.68-.22.68-.49 0-.24-.01-1.03-.01-1.87-2.78.62-3.37-1.21-3.37-1.21-.46-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.74 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.36 1.91-1.33 2.75-1.05 2.75-1.05.55 1.43.2 2.48.1 2.74.64.72 1.03 1.63 1.03 2.75 0 3.95-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.6.69.49A10.24 10.24 0 0 0 22 12.22C22 6.58 17.52 2 12 2z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14.5 3c.4 2.14 1.67 3.78 3.78 4.35v3.09a7.5 7.5 0 0 1-3.51-1.09v5.72a5.84 5.84 0 1 1-5.84-5.84c.28 0 .56.02.83.07v3.17a2.7 2.7 0 1 0 1.87 2.57V3z" />
    </svg>
  );
}

const pageStyles = `
.auth-page {
  min-height: 100dvh;
  background: var(--bg);
  color: #fff;
  font-family: var(--f);
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 1024px) {
  .auth-page { grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); }
}

/* ── Left art panel ────────────────────────────── */
.auth-art {
  display: none;
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at 30% 20%, rgba(59,130,200,.18), transparent 55%),
              radial-gradient(circle at 80% 80%, rgba(92,184,130,.16), transparent 50%),
              linear-gradient(180deg, #0A0E14 0%, #0C1017 100%);
  padding: clamp(32px, 5vw, 64px);
}
@media (min-width: 1024px) { .auth-art { display: flex; align-items: center; justify-content: center; } }
.auth-art-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .55; pointer-events: none; }
.auth-art-orb-1 { width: 480px; height: 480px; background: var(--bl); top: -120px; left: -100px; }
.auth-art-orb-2 { width: 380px; height: 380px; background: var(--grn); bottom: -120px; right: -80px; opacity: .45; }
.auth-art-orb-3 { width: 280px; height: 280px; background: var(--gld); top: 40%; left: 55%; opacity: .18; }
.auth-art-noise {
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(255,255,255,.03) 1px, transparent 1px);
  background-size: 3px 3px; pointer-events: none; mix-blend-mode: overlay;
}
.auth-art-inner {
  position: relative; z-index: 2; max-width: 520px; width: 100%;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  gap: clamp(20px, 3vh, 32px);
}
.auth-art-tag {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
  color: rgba(255,255,255,.55); padding: 8px 14px;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 999px;
}
.auth-art-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--grn); box-shadow: 0 0 12px var(--grn); }

/* GLIS ring */
.auth-ring-wrap {
  position: relative; width: clamp(220px, 24vw, 280px); aspect-ratio: 1;
  display: flex; align-items: center; justify-content: center;
}
.auth-ring-glow {
  position: absolute; inset: -20px; border-radius: 50%;
  background: radial-gradient(circle, rgba(92,184,130,.35) 0%, transparent 65%);
  filter: blur(20px); animation: authPulse 4s ease-in-out infinite;
}
.auth-ring-trk {
  position: absolute; inset: 0; border-radius: 50%;
  background: rgba(255,255,255,.06);
  -webkit-mask: radial-gradient(closest-side, transparent 89%, #000 89.5%, #000 98%, transparent 98.5%);
          mask: radial-gradient(closest-side, transparent 89%, #000 89.5%, #000 98%, transparent 98.5%);
}
.auth-ring-fill {
  position: absolute; inset: 0; border-radius: 50%;
  background: conic-gradient(from 180deg, #5CB882 0%, #7EBC6C 28%, #C4B044 55%, #D4A840 75%, #CC8844 100%);
  -webkit-mask-image: radial-gradient(closest-side, transparent 89%, #000 89.5%, #000 98%, transparent 98.5%),
                      conic-gradient(from 180deg, #000 111deg, transparent 111deg);
  -webkit-mask-composite: source-in;
          mask-image: radial-gradient(closest-side, transparent 89%, #000 89.5%, #000 98%, transparent 98.5%),
                      conic-gradient(from 180deg, #000 111deg, transparent 111deg);
          mask-composite: intersect;
}
.auth-ring-ctr {
  position: relative; display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.auth-ring-score { font-size: clamp(56px, 7vw, 76px); font-weight: 900; color: var(--grn); letter-spacing: -.04em; line-height: 1; }
.auth-ring-lbl { font-size: 11px; font-weight: 800; letter-spacing: .2em; color: rgba(255,255,255,.45); text-transform: uppercase; }
.auth-ring-verdict { font-size: 14px; font-weight: 700; color: var(--grn); letter-spacing: .02em; margin-top: -8px; }

.auth-art-copy { display: flex; flex-direction: column; gap: 12px; }
.auth-art-h {
  font-size: clamp(28px, 3.6vw, 44px); font-weight: 800; letter-spacing: -.03em; line-height: 1.1;
  color: #fff; margin: 0;
}
.auth-art-h em { font-style: normal; color: var(--grn); }
.auth-art-p { font-size: 15px; color: rgba(255,255,255,.6); line-height: 1.6; max-width: 420px; margin: 0 auto; }
.auth-art-trust {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 10px 18px;
  font-size: 12px; font-weight: 600; color: rgba(255,255,255,.4); letter-spacing: .04em;
}
.auth-art-trust span::before { content: "•"; margin-right: 6px; color: var(--bl); }
.auth-art-trust span:first-child::before { display: none; }

/* ── Right form panel ──────────────────────────── */
.auth-panel {
  display: flex; align-items: center; justify-content: center;
  padding: clamp(24px, 6vw, 48px) clamp(20px, 5vw, 56px);
  min-height: 100dvh;
}
.auth-card {
  width: 100%; max-width: 440px;
  display: flex; flex-direction: column; gap: 22px;
}
.auth-logo { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.auth-shield {
  width: 28px; height: 28px; border-radius: 8px; background: var(--bl);
  display: flex; align-items: center; justify-content: center;
}
.auth-wordmark { font-size: 18px; font-weight: 800; color: rgba(255,255,255,.92); letter-spacing: -.01em; }
.auth-wordmark em { font-style: normal; color: var(--grn); font-weight: 800; }

.auth-head { display: flex; flex-direction: column; gap: 8px; }
.auth-h { font-size: clamp(28px, 4vw, 34px); font-weight: 700; letter-spacing: -.02em; color: #fff; margin: 0; line-height: 1.15; }
.auth-sub { font-size: 15px; color: rgba(255,255,255,.55); margin: 0; line-height: 1.5; }

.auth-alert {
  padding: 12px 14px; border-radius: 12px; font-size: 14px; line-height: 1.45;
}
.auth-alert-err { background: rgba(212,32,32,.08); border: 1px solid rgba(212,32,32,.22); color: #FCA5A5; }
.auth-alert-ok  { background: rgba(92,184,130,.08); border: 1px solid rgba(92,184,130,.22); color: #86EFAC; }

.auth-form { display: flex; flex-direction: column; gap: 16px; }
.auth-field { display: flex; flex-direction: column; gap: 8px; }
.auth-field label { font-size: 13px; font-weight: 600; color: rgba(255,255,255,.72); letter-spacing: .01em; }
.auth-field input {
  width: 100%; padding: 14px 16px;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.10);
  border-radius: 12px; color: #fff; font-family: var(--f); font-size: 15px; outline: none;
  transition: border-color .15s, background .15s;
  box-sizing: border-box;
}
.auth-field input::placeholder { color: rgba(255,255,255,.32); }
.auth-field input:focus { border-color: rgba(59,130,200,.55); background: rgba(255,255,255,.06); }

.auth-input-wrap { position: relative; }
.auth-input-wrap input { padding-right: 44px; }
.auth-eye {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  width: 32px; height: 32px; border: none; background: transparent;
  color: rgba(255,255,255,.45); cursor: pointer; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.auth-eye:hover { color: rgba(255,255,255,.80); background: rgba(255,255,255,.05); }

.auth-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; }
.auth-check { display: inline-flex; align-items: center; gap: 8px; color: rgba(255,255,255,.65); cursor: pointer; user-select: none; }
.auth-check input { width: 16px; height: 16px; accent-color: var(--bl); cursor: pointer; }
.auth-link-muted { color: var(--bl); text-decoration: none; font-weight: 600; }
.auth-link-muted:hover { text-decoration: underline; }

.auth-submit {
  margin-top: 4px; width: 100%; min-height: 50px;
  padding: 14px 18px; border-radius: 12px; border: none;
  background: #fff; color: #0C1017; font-family: var(--f);
  font-size: 15px; font-weight: 700; letter-spacing: .01em;
  cursor: pointer; transition: transform .1s, background .15s;
}
.auth-submit:hover:not(:disabled) { background: #F3F4F6; }
.auth-submit:active:not(:disabled) { transform: scale(.99); }
.auth-submit:disabled { opacity: .55; cursor: not-allowed; }
.auth-submit.is-loading { background: rgba(255,255,255,.6); }

.auth-divider {
  display: flex; align-items: center; gap: 12px;
  font-size: 12px; font-weight: 600; color: rgba(255,255,255,.4);
  letter-spacing: .06em; text-transform: uppercase;
}
.auth-divider::before, .auth-divider::after { content: ""; flex: 1; height: 1px; background: rgba(255,255,255,.08); }

.auth-socials { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.auth-social {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  padding: 12px 14px; border-radius: 12px; cursor: pointer;
  font-family: var(--f); font-size: 14px; font-weight: 600;
  transition: transform .1s, background .15s, border-color .15s;
}
.auth-social:active { transform: scale(.98); }
.auth-social-google {
  background: #fff; color: #1A1A17; border: 1px solid #fff;
}
.auth-social-google:hover { background: #F3F4F6; }
.auth-social-tiktok {
  background: #000; color: #fff; border: 1px solid #000;
}
.auth-social-tiktok:hover { background: #111; }
.auth-social-fb {
  background: #1877F2; color: #fff; border: 1px solid #1877F2;
}
.auth-social-fb:hover { background: #166EE1; }
.auth-social-gh {
  background: rgba(255,255,255,.06); color: #fff; border: 1px solid rgba(255,255,255,.10);
}
.auth-social-gh:hover { background: rgba(255,255,255,.10); }

.auth-foot { text-align: center; font-size: 14px; color: rgba(255,255,255,.55); }
.auth-link {
  background: none; border: none; padding: 0; margin-left: 4px;
  color: var(--bl); font-weight: 700; font-family: var(--f); font-size: inherit; cursor: pointer;
}
.auth-link:hover { text-decoration: underline; }

@keyframes authPulse {
  0%, 100% { opacity: .35; transform: scale(1); }
  50%      { opacity: .55; transform: scale(1.04); }
}
`;

export default function PatientSignIn() {
  return (
    <Suspense fallback={null}>
      <PatientSignInContent />
    </Suspense>
  );
}
