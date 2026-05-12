"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "signup" | "login";

function notifyParent() {
  if (window.top !== window) {
    window.parent.postMessage({ type: "gg-auth-done" }, location.origin);
  } else {
    window.location.href = "/patient/disclaimer";
  }
}

const styles = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#0c1017;font-family:'Outfit',-apple-system,BlinkMacSystemFont,system-ui,sans-serif}
.wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.card{width:100%;max-width:400px}
.logo{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#3b82c8,#2563eb);display:flex;align-items:center;justify-content:center;margin-bottom:20px}
h1{font-size:22px;font-weight:800;color:#fff;margin-bottom:6px}
.sub{font-size:14px;color:rgba(255,255,255,.45);margin-bottom:28px;line-height:1.5}
.tabs{display:flex;background:rgba(255,255,255,.06);border-radius:12px;padding:4px;margin-bottom:24px}
.tab{flex:1;padding:8px;border:none;background:none;font-family:inherit;font-size:14px;font-weight:600;color:rgba(255,255,255,.4);border-radius:9px;cursor:pointer;transition:all .15s}
.tab.active{background:rgba(255,255,255,.1);color:#fff}
.field{margin-bottom:16px}
.field label{display:block;font-size:12px;font-weight:700;color:rgba(255,255,255,.4);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px}
.field input{width:100%;padding:14px 16px;background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.1);border-radius:12px;font-family:inherit;font-size:16px;color:#fff;outline:none;transition:border-color .12s}
.field input:focus{border-color:#3b82c8}
.field input::placeholder{color:rgba(255,255,255,.25)}
.err{padding:10px 14px;background:rgba(212,32,32,.1);border:1px solid rgba(212,32,32,.2);border-radius:10px;font-size:13px;color:#f87171;margin-bottom:16px;line-height:1.4}
.notice{padding:10px 14px;background:rgba(59,130,200,.08);border:1px solid rgba(59,130,200,.18);border-radius:10px;font-size:13px;color:rgba(59,130,200,.9);margin-bottom:16px;line-height:1.5}
.btn{width:100%;padding:15px;background:#3b82c8;border:none;border-radius:12px;font-family:inherit;font-size:16px;font-weight:700;color:#fff;cursor:pointer;transition:opacity .15s;margin-top:4px}
.btn:hover{opacity:.88}
.btn:disabled{opacity:.45;cursor:not-allowed}
.toggle{text-align:center;margin-top:18px;font-size:13px;color:rgba(255,255,255,.35)}
.toggle button{background:none;border:none;font-family:inherit;font-size:13px;color:rgba(59,130,200,.8);cursor:pointer;font-weight:600;padding:0;margin-left:4px}
.toggle button:hover{color:#3b82c8}
`;

export function PatientAuthForm() {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role: "patient" } },
        });

        if (authError) { setError(authError.message); return; }

        if (data.session) {
          notifyParent();
        } else {
          setNotice("Check your email for a confirmation link, then come back and sign in.");
          setMode("login");
        }
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) { setError(authError.message); return; }
        if (data.session) notifyParent();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="wrap">
        <div className="card">
          <div className="logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M12 2a10 10 0 1 0 10 10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <h1>Save your results</h1>
          <p className="sub">Create a free account to see your inflammation score and track your progress.</p>

          <div className="tabs">
            <button className={`tab${mode === "signup" ? " active" : ""}`} onClick={() => { setMode("signup"); setError(null); setNotice(null); }}>
              Create Account
            </button>
            <button className={`tab${mode === "login" ? " active" : ""}`} onClick={() => { setMode("login"); setError(null); setNotice(null); }}>
              Sign In
            </button>
          </div>

          {notice && <div className="notice">{notice}</div>}
          {error && <div className="err">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Min 6 characters" : "Your password"}
                required
                minLength={mode === "signup" ? 6 : undefined}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Please wait…" : mode === "signup" ? "Create Account →" : "Sign In →"}
            </button>
          </form>

          <div className="toggle">
            {mode === "signup" ? (
              <>Already have an account?<button onClick={() => { setMode("login"); setError(null); }}>Sign in</button></>
            ) : (
              <>New here?<button onClick={() => { setMode("signup"); setError(null); }}>Create account</button></>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
