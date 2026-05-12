"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const INPUT_STYLE = { background: "rgba(255,255,255,.04)", border: "1.5px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.88)", borderRadius: 14, width: "100%", padding: "16px 18px", fontFamily: "var(--f)", fontSize: "clamp(18px,5.2vw,21px)", outline: "none", boxSizing: "border-box" } as const;
const focus = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = "rgba(59,130,200,.4)";
const blur  = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = "rgba(255,255,255,.08)";

export default function AccountPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [alreadyAuthed, setAlreadyAuthed] = useState(false);

  const [name,     setName]     = useState("");
  const [phone,    setPhone]    = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [age,      setAge]      = useState("");
  const [sex,      setSex]      = useState("");

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const savedName = sessionStorage.getItem("gg_name") || "";
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(data => {
      if (data?.user) {
        setAlreadyAuthed(true);
        if (data.user.email) setEmail(data.user.email);
        if (data.profile?.mobile)     setPhone(data.profile.mobile);
        if (data.profile?.first_name) setName(`${data.profile.first_name} ${data.profile.last_name || ""}`.trim());
        else if (savedName)           setName(savedName);
      } else if (savedName) {
        setName(savedName);
      }
      setChecking(false);
    }).catch(() => { if (savedName) setName(savedName); setChecking(false); });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim())  { setError("Full name is required.");     return; }
    if (!phone.trim()) { setError("Mobile number is required."); return; }
    if (!alreadyAuthed) {
      if (!email.trim())    { setError("Email is required to create your account.");           return; }
      if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    }
    setError("");
    setLoading(true);

    try {
      // Step 1 — establish session if not already authed
      if (!alreadyAuthed) {
        const signupRes  = await fetch("/api/auth/patient-signup", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const signupData = await signupRes.json();

        if (signupData.userExists) {
          // Account exists — sign in
          const loginRes  = await fetch("/api/auth/patient-login", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const loginData = await loginRes.json();
          if (!loginData.success) {
            setError(loginData.error || "An account with this email already exists. Check your password.");
            setLoading(false);
            return;
          }
        } else if (signupData.confirmEmail) {
          setError("Check your email to confirm your account, then come back here.");
          setLoading(false);
          return;
        } else if (!signupData.success) {
          setError(signupData.error || "Could not create account. Please try again.");
          setLoading(false);
          return;
        }
      }

      // Step 2 — save profile
      const parts      = name.trim().split(/\s+/);
      const first_name = parts[0];
      const last_name  = parts.slice(1).join(" ");
      const profileRes  = await fetch("/api/patient/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name, last_name, mobile: phone, email, gender: sex, date_of_birth: age }),
      });
      const profileData = await profileRes.json();

      if (profileRes.ok && (profileData.success || profileData.data)) {
        router.push("/patient/scan");
      } else {
        setError(profileData.error || "Could not save profile. Please try again.");
      }
    } catch { setError("Network error. Please try again."); }
    finally  { setLoading(false); }
  }

  if (checking) return (
    <div className="dk" style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f)" }}>
      <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "rgba(255,255,255,.55)" }}>Loading…</div>
    </div>
  );

  return (
    <div className="dk" style={{ minHeight: "100dvh", fontFamily: "var(--f)" }}>
      <div className="lt-bar an">
        <button className="lt-bk" onClick={() => router.back()}>← Back</button>
        <div className="lt-logo">GutGuard</div>
        <div />
      </div>

      <div className="mx" style={{ paddingBottom: "calc(110px + env(safe-area-inset-bottom,0px))" }}>
        <div className="lb an d1">Inflammation Scan</div>
        <div className="an d2" style={{ marginBottom: 18 }}>
          <div style={{ fontSize: "clamp(22px,6.2vw,28px)", fontWeight: 700, color: "rgba(255,255,255,.88)", letterSpacing: "-.02em" }}>Almost there.</div>
          <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "rgba(255,255,255,.55)", marginTop: 4 }}>Your scan is ready. Confirm your details to save your score.</div>
        </div>

        <div className="an d2" style={{ padding: 20, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 20, marginBottom: 14 }}>
          {error && <div className="err-b"><span>{error}</span></div>}

          <form onSubmit={handleSave}>
            <div className="fg">
              <label style={{ color: "rgba(255,255,255,.70)" }}>Full Name <span style={{ color: "var(--red)" }}>*</span></label>
              <input placeholder="Maria Santos Cruz" value={name} onChange={e => setName(e.target.value)} autoComplete="name" required style={INPUT_STYLE} onFocus={focus} onBlur={blur} />
            </div>

            <div className="fg">
              <label style={{ color: "rgba(255,255,255,.70)" }}>Mobile Number <span style={{ color: "var(--red)" }}>*</span></label>
              <input type="tel" placeholder="09XX XXX XXXX" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" required style={INPUT_STYLE} onFocus={focus} onBlur={blur} />
            </div>

            <div className="fg">
              <label style={{ color: "rgba(255,255,255,.70)" }}>Email {!alreadyAuthed && <span style={{ color: "var(--red)" }}>*</span>}</label>
              <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required={!alreadyAuthed} readOnly={alreadyAuthed} style={{ ...INPUT_STYLE, opacity: alreadyAuthed ? 0.5 : 1 }} onFocus={focus} onBlur={blur} />
            </div>

            {!alreadyAuthed && (
              <div className="fg">
                <label style={{ color: "rgba(255,255,255,.70)" }}>Create Password <span style={{ color: "var(--red)" }}>*</span></label>
                <input type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required style={INPUT_STYLE} onFocus={focus} onBlur={blur} />
              </div>
            )}

            <div style={{ height: 1, background: "rgba(255,255,255,.06)", margin: "4px 0 16px" }} />

            <div className="fg-r">
              <div className="fg">
                <label style={{ color: "rgba(255,255,255,.70)" }}>Age</label>
                <input placeholder="47" value={age} onChange={e => setAge(e.target.value)} inputMode="numeric" style={INPUT_STYLE} onFocus={focus} onBlur={blur} />
              </div>
              <div className="fg">
                <label style={{ color: "rgba(255,255,255,.70)" }}>Sex</label>
                <input placeholder="Male / Female" value={sex} onChange={e => setSex(e.target.value)} style={INPUT_STYLE} onFocus={focus} onBlur={blur} />
              </div>
            </div>

            <button type="submit" className={`btn-p an d4${loading ? " ld" : ""}`} disabled={loading} style={{ marginBottom: 0 }}>
              <span className="bt">Get My Score →</span>
              <div className="bs" />
            </button>
          </form>
        </div>

        {!alreadyAuthed && (
          <div style={{ textAlign: "center", fontSize: "clamp(17px,4.5vw,19px)", color: "rgba(255,255,255,.35)" }}>
            Already have an account?{" "}
            <button onClick={() => router.push("/patient/sign-in?next=/patient/account")} style={{ background: "none", border: "none", color: "var(--bl)", fontFamily: "var(--f)", fontSize: "inherit", fontWeight: 600, cursor: "pointer", padding: 0 }}>Sign in</button>
          </div>
        )}
      </div>
    </div>
  );
}
