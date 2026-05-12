"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PatientSignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/patient/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNew, setIsNew] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/patient-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (data.success) {
        router.push(next);
      } else {
        setError(data.error || "Invalid credentials. Please try again.");
      }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/patient-signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (data.success) {
        router.push(next);
      } else if (data.confirmEmail) {
        setError("Check your email to confirm your account, then sign in here.");
        setIsNew(false);
      } else if (data.userExists) {
        setError("An account with this email already exists. Sign in instead.");
        setIsNew(false);
      } else {
        setError(data.error || "Could not create account. Please try again.");
      }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column", fontFamily: "var(--f)", color: "#fff" }}>
      {/* Header */}
      <div style={{ padding: "24px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bl)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <div style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, color: "rgba(255,255,255,.88)" }}>GutGuard</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px" }}>
        <div style={{ marginBottom: 32 }}>
          <div id="loginHeading" style={{ fontSize: "clamp(24px,6.8vw,30px)", fontWeight: 700, color: "rgba(255,255,255,.88)", letterSpacing: "-.03em", lineHeight: 1.1 }}>
            {isNew ? "Create your account" : "Welcome back"}
          </div>
          <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "rgba(255,255,255,.70)", marginTop: 8, lineHeight: 1.5 }}>
            {isNew ? "Sign up to save your score and track your progress." : "Sign in to view your protocol and scan history."}
          </div>
        </div>

        {error && (
          <div style={{ padding: "12px 16px", background: "rgba(212,32,32,.08)", border: "1px solid rgba(212,32,32,.18)", borderRadius: 14, fontSize: "clamp(18px,5.2vw,21px)", color: "#F87171", marginBottom: 16, lineHeight: 1.4 }}>{error}</div>
        )}

        <form onSubmit={isNew ? handleSignUp : handleSignIn}>
          <div className="fg">
            <label>Email address</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{ width: "100%", padding: "16px", border: "1.5px solid rgba(255,255,255,.08)", borderRadius: 14, fontFamily: "var(--f)", fontSize: "clamp(18px,5.2vw,21px)", color: "#fff", background: "rgba(255,255,255,.04)", outline: "none", minHeight: 52, boxSizing: "border-box" }}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(59,130,200,.4)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"}
            />
          </div>
          <div className="fg" style={{ marginTop: 16 }}>
            <label style={{ color: "rgba(255,255,255,.65)" }}>Password</label>
            <input
              type="password"
              placeholder={isNew ? "Min. 8 characters" : "Your password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={isNew ? 8 : undefined}
              autoComplete={isNew ? "new-password" : "current-password"}
              style={{ width: "100%", padding: "16px", border: "1.5px solid rgba(255,255,255,.08)", borderRadius: 14, fontFamily: "var(--f)", fontSize: "clamp(18px,5.2vw,21px)", color: "#fff", background: "rgba(255,255,255,.04)", outline: "none", minHeight: 52, boxSizing: "border-box" }}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(59,130,200,.4)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"}
            />
          </div>

          <button
            type="submit"
            className={`btn-p${loading ? " ld" : ""}`}
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            <span className="bt">{isNew ? "Create Account →" : "Sign In"}</span>
            <div className="bs" />
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          {isNew ? (
            <>
              <div style={{ fontSize: "clamp(18px,5.2vw,21px)", color: "rgba(255,255,255,.55)" }}>Already have an account?</div>
              <button onClick={() => { setIsNew(false); setError(""); }} style={{ background: "none", border: "none", fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: "var(--bl)", fontFamily: "var(--f)", cursor: "pointer", padding: 8 }}>Sign In</button>
            </>
          ) : (
            <>
              <div style={{ fontSize: "clamp(18px,5.2vw,21px)", color: "rgba(255,255,255,.55)" }}>First time?</div>
              <button onClick={() => { setIsNew(true); setError(""); }} style={{ background: "none", border: "none", fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: "var(--bl)", fontFamily: "var(--f)", cursor: "pointer", padding: 8 }}>Scan My Labs</button>
            </>
          )}
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "0 28px 24px", fontSize: "clamp(18px,5vw,20px)", color: "rgba(255,255,255,.70)" }}>GutGuard Protocol · For Filing</div>
    </div>
  );
}
