"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const isValidPH = (p: string) => /^09\d{9}$/.test(p);
const toE164 = (p: string) => "+63" + p.slice(1);

type Phase = "idle" | "sent" | "verified";

export function DoctorAuthForm() {
  const router = useRouter();
  const supabase = createClient();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Countdown tick
  useEffect(() => {
    if (phase !== "sent" || countdown <= 0) return;
    const t = setTimeout(() => {
      setCountdown((c) => {
        if (c <= 1) { setCanResend(true); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const handleSendOTP = async () => {
    setSending(true);
    setError(null);

    // TODO: replace with real Supabase phone OTP when SMS provider is configured
    await new Promise((r) => setTimeout(r, 600));

    setSending(false);
    setPhase("sent");
    setOtp("");
    setCountdown(30);
    setCanResend(false);
  };

  const handleResend = () => {
    setCanResend(false);
    setOtp("");
    setError(null);
    handleSendOTP();
  };

  const handleVerify = async () => {
    if (otp.length < 6) return;
    setVerifying(true);
    setError(null);

    // OTP is mocked — any 6 digits accepted.
    // Session is created via email+password derived from the phone number.
    // TODO: replace with supabase.auth.verifyOtp when SMS provider is live.
    const mockEmail = `${phone}@gutguard-dev.ph`;
    const mockPassword = `gutguard_${phone}_dev`;

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: mockEmail,
      password: mockPassword,
    });

    if (!signInError && signInData.user) {
      router.push("/doctor/dashboard");
      router.refresh();
      return;
    }

    setNotFound(true);
    setVerifying(false);
  };

  const otpDisabled = phase === "idle";
  const phoneDisabled = phase === "sent" && !canResend;
  const sendDisabled = !isValidPH(phone) || sending || (phase === "sent" && !canResend);

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#0C1017",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Outfit', system-ui, -apple-system, sans-serif",
    }}>
      {/* Background grid */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(59,130,200,.04) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        pointerEvents: "none",
      }} />

      {/* Top glow */}
      <div style={{
        position: "absolute",
        top: "-80px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "360px",
        height: "360px",
        background: "radial-gradient(circle, rgba(59,130,200,.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 clamp(16px, 5vw, 28px)",
        position: "relative",
        zIndex: 1,
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "44px", animation: "fadeUp .5s ease-out both" }}>
          <div style={{ position: "relative", width: "72px", height: "72px", margin: "0 auto 20px" }}>
            <div style={{
              position: "absolute", inset: "-12px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59,130,200,.12) 0%, transparent 70%)",
              animation: "pulse 2s ease-in-out infinite",
            }} />
            <div style={{
              width: "72px", height: "72px", borderRadius: "20px",
              background: "linear-gradient(145deg, rgba(59,130,200,.12), rgba(59,130,200,.04))",
              border: "1.5px solid rgba(59,130,200,.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82C8" strokeWidth="1.6">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: ".14em", color: "rgba(255,255,255,.75)", textTransform: "uppercase", marginBottom: "10px" }}>GutGuard</div>
          <div style={{ fontSize: "clamp(26px,6.8vw,30px)", fontWeight: 800, color: "rgba(255,255,255,.92)", letterSpacing: "-.04em", lineHeight: 1.1 }}>
            Practitioner<br />Protocol Center
          </div>
        </div>

        {/* Form card */}
        <div style={{ width: "100%", maxWidth: "360px", animation: "fadeUp .5s ease-out .1s both" }}>

          {/* Heading */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "rgba(255,255,255,.75)", marginBottom: "4px" }}>
              {phase === "idle" ? "Sign in with mobile number" : `OTP sent to ${phone}`}
            </div>
            {phase === "sent" && (
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,.42)" }}>
                Enter the 6-digit code from your SMS.
              </div>
            )}
          </div>

          {/* Mobile number field */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,.55)", marginBottom: "8px", letterSpacing: ".06em", textTransform: "uppercase" }}>
              Mobile Number
            </label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="09XX XXX XXXX"
              value={phone}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                setPhone(v);
                setError(null);
                setNotFound(false);
              }}
              disabled={phoneDisabled}
              style={{
                width: "100%",
                padding: "15px 18px",
                border: `1.5px solid ${isValidPH(phone) ? "rgba(59,130,200,.35)" : "rgba(255,255,255,.07)"}`,
                borderRadius: "14px",
                fontFamily: "inherit",
                fontSize: "16px",
                color: phoneDisabled ? "rgba(255,255,255,.35)" : "#fff",
                background: phoneDisabled ? "rgba(255,255,255,.02)" : "rgba(255,255,255,.04)",
                outline: "none",
                minHeight: "52px",
                transition: "border-color .15s, opacity .15s",
                letterSpacing: ".04em",
              }}
              onFocus={(e) => { if (!phoneDisabled) e.currentTarget.style.borderColor = "rgba(59,130,200,.50)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = isValidPH(phone) ? "rgba(59,130,200,.35)" : "rgba(255,255,255,.07)"; }}
            />
          </div>

          {/* Send OTP button */}
          <button
            type="button"
            onClick={handleSendOTP}
            disabled={sendDisabled}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "14px",
              border: "1.5px solid rgba(59,130,200,.28)",
              fontSize: "15px",
              fontWeight: 700,
              fontFamily: "inherit",
              background: sendDisabled ? "rgba(59,130,200,.06)" : "rgba(59,130,200,.12)",
              color: sendDisabled ? "rgba(59,130,200,.38)" : "#3B82C8",
              cursor: sendDisabled ? "not-allowed" : "pointer",
              minHeight: "48px",
              transition: "all .15s",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            onMouseDown={(e) => { if (!sendDisabled) e.currentTarget.style.transform = "scale(.97)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = ""; }}
          >
            {sending ? (
              <>
                <span style={{ width: 14, height: 14, border: "2px solid rgba(59,130,200,.35)", borderTopColor: "#3B82C8", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
                Sending…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                {phase === "sent" && canResend ? "Resend OTP" : "Send OTP"}
              </>
            )}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,.07)" }} />
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,.28)", fontWeight: 600, letterSpacing: ".08em" }}>STEP 2</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,.07)" }} />
          </div>

          {/* OTP field */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: otpDisabled ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.55)", letterSpacing: ".06em", textTransform: "uppercase" }}>
                OTP Code
              </label>
              {phase === "sent" && !canResend && countdown > 0 && (
                <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(59,130,200,.70)", fontVariantNumeric: "tabular-nums" }}>
                  {countdown}s
                </span>
              )}
              {canResend && (
                <button
                  type="button"
                  onClick={handleResend}
                  style={{ background: "none", border: "none", fontSize: "13px", fontWeight: 700, color: "#3B82C8", cursor: "pointer", padding: "0", fontFamily: "inherit" }}
                >
                  Resend
                </button>
              )}
            </div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="_ _ _ _ _ _"
              value={otp}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtp(v);
                setError(null);
              }}
              disabled={otpDisabled}
              autoComplete="one-time-code"
              style={{
                width: "100%",
                padding: "15px 18px",
                border: `1.5px solid ${!otpDisabled && otp.length === 6 ? "rgba(92,184,130,.35)" : "rgba(255,255,255,.07)"}`,
                borderRadius: "14px",
                fontFamily: "inherit",
                fontSize: "22px",
                fontWeight: 800,
                letterSpacing: ".28em",
                color: otpDisabled ? "rgba(255,255,255,.18)" : "#fff",
                background: otpDisabled ? "rgba(255,255,255,.01)" : "rgba(255,255,255,.04)",
                outline: "none",
                minHeight: "58px",
                transition: "border-color .15s",
                textAlign: "center",
              }}
              onFocus={(e) => { if (!otpDisabled) e.currentTarget.style.borderColor = "rgba(59,130,200,.50)"; }}
              onBlur={(e) => {
                if (!otpDisabled) e.currentTarget.style.borderColor = otp.length === 6 ? "rgba(92,184,130,.35)" : "rgba(255,255,255,.07)";
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: "16px", padding: "12px 16px", borderRadius: "12px",
              background: "rgba(212,32,32,.10)", border: "1px solid rgba(212,32,32,.20)",
              fontSize: "14px", color: "#D42020", lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          {/* Verify button */}
          <button
            type="button"
            onClick={handleVerify}
            disabled={otp.length < 6 || otpDisabled || verifying}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "16px",
              border: "none",
              fontSize: "17px",
              fontWeight: 700,
              background: (otp.length === 6 && !otpDisabled && !verifying)
                ? "#3B82C8"
                : "rgba(59,130,200,.30)",
              color: "#fff",
              fontFamily: "inherit",
              minHeight: "56px",
              cursor: (otp.length === 6 && !otpDisabled && !verifying) ? "pointer" : "not-allowed",
              transition: "all .1s",
              boxShadow: (otp.length === 6 && !otpDisabled)
                ? "0 4px 20px rgba(59,130,200,.25)"
                : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            onMouseDown={(e) => {
              if (otp.length === 6 && !verifying) e.currentTarget.style.transform = "scale(.97)";
            }}
            onMouseUp={(e) => { e.currentTarget.style.transform = ""; }}
          >
            {verifying ? (
              <>
                <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.35)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
                Verifying…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Verify &amp; Sign In
              </>
            )}
          </button>

          {notFound && (
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,.38)" }}>
                No account found.{" "}
              </span>
              <a
                href="/doctor/onboarding"
                style={{ fontSize: "13px", fontWeight: 700, color: "#3B82C8", textDecoration: "none" }}
              >
                Activate portal →
              </a>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "0 clamp(16px,5vw,28px) 40px", position: "relative", zIndex: 1, animation: "fadeUp .5s ease-out .3s both" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
          {["SEC Registered", "FDA Notified", "LTO Licensed", "GLIS · IMSI v1.0"].map((b) => (
            <div key={b} style={{
              padding: "6px 12px", borderRadius: "8px",
              background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.05)",
              fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,.75)", letterSpacing: ".06em",
            }}>{b}</div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.7;transform:scale(1.08)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      ` }} />
    </div>
  );
}
