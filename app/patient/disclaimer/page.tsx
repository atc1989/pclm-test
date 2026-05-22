"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DisclaimerPage() {
  const router = useRouter();
  const [checks, setChecks] = useState([false, false, false]);
  const [name, setName] = useState("");

  const allChecked = checks.every(Boolean) && name.trim().length >= 2;

  function toggle(i: number) {
    setChecks(prev => prev.map((v, idx) => idx === i ? !v : v));
  }

  function handleConfirm() {
    if (!allChecked) return;
    sessionStorage.setItem("gg_name", name.trim());
    router.push("/patient/upload");
  }

  const items = [
    {
      title: "I understand and agree",
      body: "My lab data is shared only with the independent licensed physician assigned to my BioScan review, used only to calculate my GLIS score, and never sold to any third party. I consent to this under RA 10173 (Data Privacy Act).",
    },
    {
      title: "I understand and agree",
      body: "The GLIS score is a wellness indicator — not a medical diagnosis. It does not replace my doctor's advice or any treatment I am on. I will not stop or change any prescribed medication based on my GLIS score without first consulting my physician.",
    },
    {
      title: "I understand and agree",
      body: "The physician who reviews my BioScan is an independently licensed professional — not an employee of GutGuard. GutGuard provides the platform; the physician provides the independent wellness review. GutGuard's liability is limited to the purchase price of my protocol.",
    },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", color: "#fff", display: "flex", flexDirection: "column", fontFamily: "var(--f)" }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0", flexShrink: 0 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "rgba(255,255,255,.45)", fontFamily: "var(--f)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "8px 12px 8px 0", fontSize: "clamp(18px,5vw,20px)" }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M19 12H5M12 5l-7 7 7 7" /></svg>Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: "var(--bl)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <span style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, color: "rgba(255,255,255,.88)" }}>GutGuard</span>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* Progress bar */}
      <div style={{ padding: "16px 24px 0", flexShrink: 0 }}>
        <div style={{ height: 3, background: "rgba(255,255,255,.08)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: "100%", background: "linear-gradient(90deg,var(--bl),var(--grn))", borderRadius: 2 }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "24px 24px calc(110px + env(safe-area-inset-bottom,0px))" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: "rgba(59,130,200,.10)", border: "1.5px solid rgba(59,130,200,.18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="var(--bl)" strokeWidth={1.8}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <div style={{ fontSize: "clamp(24px,6.5vw,30px)", fontWeight: 800, color: "#fff", letterSpacing: "-.04em", lineHeight: 1.1, marginBottom: 8 }}>Your data is yours.</div>
          <div style={{ fontSize: "clamp(17px,4.5vw,19px)", color: "rgba(255,255,255,.50)", lineHeight: 1.6 }}>Three things to confirm before we touch your lab results.</div>
        </div>

        {/* Consent items */}
        {items.map((item, i) => (
          <div key={i} className={`ci${checks[i] ? " on" : ""}`} onClick={() => toggle(i)}>
            <div className="cb">
              {checks[i] && <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "clamp(17px,4.5vw,19px)", fontWeight: 700, color: "rgba(255,255,255,.88)", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: "clamp(17px,4.5vw,19px)", color: "rgba(255,255,255,.55)", lineHeight: 1.75 }}>{item.body}</div>
            </div>
          </div>
        ))}

        {/* Signature */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.40)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>Type your full name to confirm</label>
          <input
            type="text"
            placeholder="e.g. Maria Santos Cruz"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: "100%", padding: "15px 16px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.05)", color: "#f0f0f4", fontSize: "clamp(18px,5vw,20px)", fontFamily: "var(--f)", outline: "none", boxSizing: "border-box", WebkitAppearance: "none" }}
            onFocus={e => e.currentTarget.style.borderColor = "rgba(59,130,200,.4)"}
            onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,.10)"}
          />
        </div>

        <button
          onClick={handleConfirm}
          disabled={!allChecked}
          style={{ width: "100%", padding: 17, borderRadius: 12, border: "none", fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, fontFamily: "var(--f)", background: allChecked ? "var(--bl)" : "rgba(255,255,255,.08)", color: allChecked ? "#fff" : "rgba(255,255,255,.30)", cursor: allChecked ? "pointer" : "not-allowed", transition: "background .2s,color .2s", minHeight: 56 }}
        >
          I Agree → Start My BioScan
        </button>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,.30)" }}>Privacy Policy</span>
        </div>
      </div>
    </div>
  );
}
