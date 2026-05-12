"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function PatientLanding() {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t1 = setTimeout(() => {
      if (contentRef.current) { contentRef.current.style.opacity = "1"; contentRef.current.style.transform = "translateY(0)"; }
    }, 100);
    const t2 = setTimeout(() => {
      if (brandRef.current) brandRef.current.style.opacity = "1";
    }, 400);
    const t3 = setTimeout(() => {
      if (ctaRef.current) { ctaRef.current.style.opacity = "1"; ctaRef.current.style.transform = "translateY(0)"; }
    }, 600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", fontFamily: "var(--f)" }}>
      {/* Ambient glow */}
      <div style={{ position: "absolute", top: "40%", left: "50%", width: 360, height: 360, transform: "translate(-50%,-50%)", background: "radial-gradient(circle,rgba(59,130,200,.07) 0%,transparent 65%)", pointerEvents: "none", animation: "ambientPulse 4s ease-in-out infinite" }} />

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(16px,4vh,40px) clamp(24px,6vw,40px) clamp(80px,12vh,100px)", position: "relative", zIndex: 1 }}>
        <div
          ref={contentRef}
          style={{ textAlign: "center", width: "100%", maxWidth: 320, opacity: 0, transform: "translateY(12px)", transition: "opacity .9s, transform .9s var(--ease)" }}
        >
          {/* Doctor avatar */}
          <div style={{ position: "relative", display: "inline-block", marginBottom: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: "linear-gradient(145deg,rgba(59,130,200,.16),rgba(59,130,200,.06))", border: "1.5px solid rgba(59,130,200,.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(28px,7.8vw,34px)", fontWeight: 800, color: "rgba(59,130,200,.85)", letterSpacing: "-.02em" }}>SA</div>
            <div style={{ position: "absolute", bottom: -4, right: -4, width: 20, height: 20, borderRadius: "50%", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--grn)", boxShadow: "0 0 6px rgba(92,184,130,.60)" }} />
            </div>
          </div>

          {/* Doctor identity */}
          <div style={{ fontSize: "clamp(26px,7.2vw,32px)", fontWeight: 800, color: "rgba(255,255,255,.88)", letterSpacing: "-.04em", lineHeight: 1.1 }}>Dr. Shane Animas</div>
          <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 400, color: "rgba(255,255,255,.55)", marginTop: 6 }}>GutGuard Protocol Center · Internal Medicine</div>

          {/* What this means */}
          <div style={{ margin: "24px 0", padding: "18px 20px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, textAlign: "left" }}>
            <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 400, color: "rgba(255,255,255,.70)", lineHeight: 1.6 }}>
              An enrolled independent physician will review your BioScan and guide your protocol.
            </div>
          </div>

          {/* Trust strip */}
          <div style={{ display: "flex", justifyContent: "center", gap: "clamp(14px,4vw,20px)" }}>
            {[["48h", "Response"], ["47", "Patients"], ["GLIS", "Certified"]].map(([val, label], i) => (
              <div key={i} style={{ textAlign: "center", flex: i === 2 ? undefined : undefined }}>
                <div style={{ fontSize: "clamp(20px,5.5vw,24px)", fontWeight: 800, color: i === 2 ? "rgba(92,184,130,.90)" : "rgba(255,255,255,.88)" }}>{val}</div>
                <div style={{ fontSize: "clamp(17px,4.5vw,19px)", fontWeight: 600, color: "rgba(255,255,255,.45)", letterSpacing: ".06em", textTransform: "uppercase", marginTop: 2 }}>{label}</div>
                {i < 2 && <div style={{ display: "none" }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA bottom */}
      <div style={{ padding: "0 clamp(20px,5vw,36px) clamp(40px,8vh,56px)", position: "relative", zIndex: 1, width: "100%" }}>
        <div ref={brandRef} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20, opacity: 0, transition: "opacity .8s .4s" }}>
          <div style={{ width: 18, height: 18, borderRadius: 8, background: "var(--bl)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <span style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: "rgba(255,255,255,.65)" }}>GutGuard Protocol</span>
        </div>
        <div ref={ctaRef} style={{ opacity: 0, transform: "translateY(12px)", transition: "opacity .7s, transform .7s var(--ease)" }}>
          <button className="btn-p" onClick={() => router.push("/patient/cinematic")}>
            Get My Score
          </button>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button onClick={() => router.push("/patient/sign-in")} style={{ background: "none", border: "none", fontSize: "clamp(18px,5vw,20px)", fontWeight: 400, color: "rgba(255,255,255,.55)", fontFamily: "var(--f)", cursor: "pointer" }}>
              Already have an account? <span style={{ color: "var(--bl)", fontWeight: 600 }}>Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
