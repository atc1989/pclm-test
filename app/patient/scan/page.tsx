"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { glisScore, type Markers } from "@/lib/glis/score";

type MKey = keyof Markers;

const META: { key: MKey; label: string; unit: string; ref: string; lo?: number; hi?: number }[] = [
  { key: "crp",   label: "hs-CRP",        unit: "mg/L",      ref: "< 1.0",    hi: 1.0 },
  { key: "wbc",   label: "WBC",           unit: "×10³/µL",   ref: "4.5–11.0", lo: 4.5, hi: 11.0 },
  { key: "neut",  label: "Neutrophils",   unit: "%",         ref: "50–70",    lo: 50,  hi: 70 },
  { key: "lymph", label: "Lymphocytes",   unit: "%",         ref: "20–40",    lo: 20,  hi: 40 },
  { key: "glu",   label: "Glucose",       unit: "mg/dL",     ref: "70–99",    lo: 70,  hi: 99 },
  { key: "alt",   label: "ALT",           unit: "U/L",       ref: "7–40",     lo: 7,   hi: 40 },
  { key: "trig",  label: "Triglycerides", unit: "mg/dL",     ref: "< 150",    hi: 150 },
  { key: "hdl",   label: "HDL Chol.",     unit: "mg/dL",     ref: "> 40",     lo: 40 },
];

function outOfRange(key: MKey, val: number | null) {
  if (val === null) return false;
  const m = META.find(x => x.key === key);
  if (!m) return false;
  if (m.lo !== undefined && val < m.lo) return true;
  if (m.hi !== undefined && val > m.hi) return true;
  return false;
}

export default function ScanPage() {
  const router = useRouter();
  const [markers, setMarkers] = useState<Markers>({ crp: null, wbc: null, neut: null, lymph: null, glu: null, alt: null, trig: null, hdl: null });
  const [confidence, setConfidence] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const raw = sessionStorage.getItem("gg_scan");
    if (!raw) { router.replace("/patient/upload"); return; }
    try {
      const p = JSON.parse(raw);
      setMarkers({
        crp: p.markers?.crp ?? null, wbc: p.markers?.wbc ?? null,
        neut: p.markers?.neut ?? null, lymph: p.markers?.lymph ?? null,
        glu: p.markers?.glu ?? null, alt: p.markers?.alt ?? null,
        trig: p.markers?.trig ?? null, hdl: p.markers?.hdl ?? null,
      });
      setConfidence(p.confidence ?? {});
      setReady(true);
    } catch { router.replace("/patient/upload"); }
  }, [router]);

  function set(key: MKey, val: string) {
    const n = val === "" ? null : parseFloat(val);
    setMarkers(prev => ({ ...prev, [key]: n !== null && !isNaN(n) ? n : null }));
  }

  function confirm() {
    const result = glisScore(markers);
    sessionStorage.setItem("gg_verified", JSON.stringify(markers));
    sessionStorage.setItem("gg_score", JSON.stringify(result));
    router.push("/patient/results");
  }

  const filled = Object.values(markers).filter(v => v !== null).length;
  const today = new Date().toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

  if (!ready) return (
    <div className="dk" style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f)" }}>
      <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "rgba(255,255,255,.55)" }}>Loading…</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--bg)", color: "#fff", fontFamily: "var(--f)" }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0", flexShrink: 0 }}>
        <button onClick={() => router.push("/patient/upload")} style={{ background: "none", border: "none", fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: "rgba(255,255,255,.55)", fontFamily: "var(--f)", cursor: "pointer", padding: "8px 12px 8px 0", display: "flex", alignItems: "center", gap: 6, minHeight: 44 }}>
          <svg width={7} height={12} viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M6 1L1 6l5 5" /></svg>Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--bl)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <span style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, color: "rgba(255,255,255,.88)" }}>GutGuard</span>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* Header */}
      <div style={{ padding: "20px 24px 0", flexShrink: 0 }}>
        <div style={{ fontSize: "clamp(24px,6.8vw,30px)", fontWeight: 800, color: "#fff", letterSpacing: "-.035em", lineHeight: 1.1, marginBottom: 6 }}>Check your results.</div>
        <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "rgba(255,255,255,.55)", lineHeight: 1.5, marginBottom: 14 }}>We read these values from your lab result.<br />Tap any number to correct it.</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 20, background: "rgba(255,255,255,.06)", fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 600, color: "rgba(255,255,255,.45)" }}>
          <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><rect x={3} y={4} width={18} height={18} rx={2} /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          <span>{today}</span>
        </div>
      </div>

      {/* Marker rows */}
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "16px 24px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {META.map(({ key, label, unit, ref }) => {
            const val = markers[key];
            const flagged = outOfRange(key, val);
            const conf = confidence[key];
            const lowConf = conf !== undefined && conf < 0.6 && val !== null;

            return (
              <div
                key={key}
                className={`mk-row${flagged ? " flag" : ""}`}
                onClick={() => inputRefs.current[key]?.focus()}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 700, color: "rgba(255,255,255,.88)" }}>{label}</span>
                    {flagged && (
                      <span style={{ fontSize: 11, background: "rgba(212,32,32,.15)", color: "#F87171", borderRadius: 99, padding: "1px 7px", fontWeight: 600 }}>Out of range</span>
                    )}
                    {lowConf && !flagged && (
                      <span style={{ fontSize: 11, background: "rgba(212,168,64,.12)", color: "#FCD34D", borderRadius: 99, padding: "1px 7px", fontWeight: 600 }}>Low conf.</span>
                    )}
                  </div>
                  <span style={{ fontSize: "clamp(17px,4.5vw,19px)", color: "rgba(255,255,255,.40)" }}>Ref: {ref} {unit}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "clamp(17px,4.5vw,19px)", color: "rgba(255,255,255,.30)" }}>{unit}</span>
                  <input
                    ref={el => { inputRefs.current[key] = el; }}
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="—"
                    value={val ?? ""}
                    onChange={e => set(key, e.target.value)}
                    style={{ width: 80, padding: "8px 10px", border: "1.5px solid rgba(255,255,255,.10)", borderRadius: 10, background: "rgba(255,255,255,.05)", color: "#fff", fontFamily: "var(--f)", fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, textAlign: "right", outline: "none", WebkitAppearance: "none", MozAppearance: "textfield" }}
                    onFocus={e => e.currentTarget.style.borderColor = "rgba(59,130,200,.5)"}
                    onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,.10)"}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Missing note */}
        {filled < 4 && (
          <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 14, background: "rgba(59,130,200,.06)", border: "1px solid rgba(59,130,200,.10)" }}>
            <div style={{ fontSize: "clamp(17px,4.5vw,19px)", color: "rgba(255,255,255,.55)", lineHeight: 1.5 }}>
              {filled} of 8 markers detected. Missing values will be excluded from scoring — you can enter them above.
            </div>
          </div>
        )}

        {/* Re-upload */}
        <div style={{ textAlign: "center", padding: "20px 0 8px" }}>
          <button onClick={() => router.push("/patient/upload")} style={{ background: "none", border: "none", fontSize: "clamp(17px,4.5vw,19px)", color: "rgba(255,255,255,.30)", fontFamily: "var(--f)", cursor: "pointer", padding: 8 }}>Wrong result? Re-upload →</button>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "12px 24px calc(80px + env(safe-area-inset-bottom,0px))", flexShrink: 0, background: "linear-gradient(to bottom,transparent,rgba(12,16,23,.98) 28%)" }}>
        <button
          onClick={confirm}
          style={{ width: "100%", padding: 17, borderRadius: 14, border: "none", background: "var(--grn)", color: "#fff", fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, fontFamily: "var(--f)", cursor: "pointer", minHeight: 54, boxShadow: "0 4px 20px rgba(92,184,130,.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          onMouseDown={e => (e.currentTarget.style.transform = "scale(.97)")} onMouseUp={e => (e.currentTarget.style.transform = "")}
        >
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
          Looks right — Calculate my score
        </button>
      </div>
    </div>
  );
}
