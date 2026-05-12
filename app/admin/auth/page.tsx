"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.aa-shell{min-height:100dvh;background:#080c12;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;font-family:'Outfit',system-ui,sans-serif;position:relative;overflow:hidden}
.aa-grid{position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,.025) 1px,transparent 1px);background-size:28px 28px;pointer-events:none}
.aa-glow{position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:480px;height:480px;background:radial-gradient(circle,rgba(212,32,32,.06) 0%,transparent 68%);pointer-events:none}
.aa-card{width:100%;max-width:380px;position:relative;z-index:1}
.aa-brand{display:flex;align-items:center;gap:10px;margin-bottom:40px;justify-content:center}
.aa-mark{width:36px;height:36px;border-radius:11px;background:var(--red,#d42020);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(212,32,32,.35)}
.aa-brand-name{font-size:16px;font-weight:850;color:rgba(255,255,255,.88);letter-spacing:-.01em}
.aa-brand-tag{font-size:11px;font-weight:850;letter-spacing:.13em;color:rgba(212,32,32,.8);text-transform:uppercase;margin-left:2px}
.aa-heading{font-size:26px;font-weight:900;color:rgba(255,255,255,.92);letter-spacing:-.04em;line-height:1.1;text-align:center;margin-bottom:6px}
.aa-sub{font-size:14px;color:rgba(255,255,255,.35);text-align:center;margin-bottom:32px;line-height:1.5}
.aa-field{margin-bottom:14px}
.aa-field label{display:block;font-size:11px;font-weight:850;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:7px}
.aa-input{width:100%;padding:14px 16px;background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.08);border-radius:13px;font:650 16px 'Outfit',system-ui,sans-serif;color:rgba(255,255,255,.9);outline:none;transition:border-color .15s,box-shadow .15s}
.aa-input::placeholder{color:rgba(255,255,255,.2)}
.aa-input:focus{border-color:rgba(212,32,32,.45);box-shadow:0 0 0 3px rgba(212,32,32,.08)}
.aa-error{background:rgba(212,32,32,.08);border:1px solid rgba(212,32,32,.2);border-radius:12px;padding:12px 16px;font-size:13px;color:#e05555;margin-bottom:14px;line-height:1.45}
.aa-btn{width:100%;min-height:52px;border-radius:14px;border:none;background:#d42020;color:#fff;font:850 16px 'Outfit',system-ui,sans-serif;cursor:pointer;transition:opacity .15s,transform .1s;box-shadow:0 4px 20px rgba(212,32,32,.3);margin-top:4px}
.aa-btn:hover:not(:disabled){opacity:.9}
.aa-btn:active:not(:disabled){transform:scale(.98)}
.aa-btn:disabled{opacity:.45;cursor:not-allowed}
.aa-footer{margin-top:32px;text-align:center;font-size:12px;color:rgba(255,255,255,.2);line-height:1.7;letter-spacing:.02em}
`;

export default function AdminAuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (!data.user) {
        setError("Login failed. Please try again.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (!profile || !["admin", "internal_admin"].includes(profile.role)) {
        await supabase.auth.signOut();
        setError("This account does not have admin access.");
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="aa-shell">
        <div className="aa-grid" />
        <div className="aa-glow" />

        <div className="aa-card">
          <div className="aa-brand">
            <div className="aa-mark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <div className="aa-brand-name">GutGuard</div>
              <div className="aa-brand-tag">Admin Portal</div>
            </div>
          </div>

          <h1 className="aa-heading">Admin Sign In</h1>
          <p className="aa-sub">Restricted access. Authorised personnel only.</p>

          <form onSubmit={handleLogin}>
            <div className="aa-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                className="aa-input"
                type="email"
                placeholder="admin@gutguard.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="aa-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="aa-input"
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && <div className="aa-error">{error}</div>}

            <button className="aa-btn" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Sign In to Admin"}
            </button>
          </form>

          <div className="aa-footer">
            SEC Registered · FDA Notified · LTO Licensed<br />
            GutGuard Philippines · 2026
          </div>
        </div>
      </div>
    </>
  );
}
