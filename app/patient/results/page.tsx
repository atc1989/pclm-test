"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { scoreColor, scoreBand, scoreSummary, suggestTier, TIERS, type ScoreResult, type TierKey } from "@/lib/glis/score";

const TIER_ORDER: TierKey[] = ["trial", "start", "grow", "power"];

type ScanEntry = { score: number; date: string; interpretation: string };

function Skeleton({ w, h, r = 8 }: { w: string; h: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "rgba(255,255,255,.07)", animation: "pulse 1.6s ease-in-out infinite" }} />;
}

export default function ResultsPage() {
  const router = useRouter();
  const [sr, setSr] = useState<ScoreResult | null>(null);
  const [selected, setSelected] = useState<TierKey>("start");
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [activeTierKey, setActiveTierKey] = useState<TierKey | null>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const ringRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const ambRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // gg_score + gg_verified are genuinely transient (just calculated this session)
    const raw = sessionStorage.getItem("gg_score");
    if (!raw) { router.replace("/patient/upload"); return; }
    try {
      const parsed: ScoreResult = JSON.parse(raw);
      setSr(parsed);
      setSelected(suggestTier(parsed.score));
      setTimeout(() => {
        const deg = Math.round((parsed.score / 100) * 360);
        if (ringRef.current) { ringRef.current.style.opacity = "1"; ringRef.current.style.setProperty("--ra", `${deg}deg`); }
        if (ambRef.current) { const col = scoreColor(parsed.score); ambRef.current.style.background = `radial-gradient(circle,${col}1A 0%,transparent 65%)`; }
        if (scoreRef.current) {
          let cur = 0; const target = parsed.score; const step = Math.max(1, Math.floor(target / 40));
          const iv = setInterval(() => { cur = Math.min(cur + step, target); if (scoreRef.current) scoreRef.current.textContent = String(cur); if (cur >= target) clearInterval(iv); }, 30);
        }
      }, 200);
    } catch { router.replace("/patient/upload"); return; }

    // Fetch enrollment + history from Supabase
    fetch("/api/patient/dashboard")
      .then(r => r.json())
      .then(data => {
        if (data.scanHistory?.length > 0) setHistory(data.scanHistory);
        if (data.activeProtocol?.protocol_key) {
          const tk = data.activeProtocol.protocol_key as TierKey;
          if (TIERS[tk]) { setActiveTierKey(tk); setEnrolled(true); }
        }
      })
      .catch(() => {})
      .finally(() => setDbLoading(false));
  }, [router]);

  async function saveScanToDb(isFollowUp: boolean): Promise<string | null> {
    if (!sr) return null;
    try {
      const markers = JSON.parse(sessionStorage.getItem("gg_verified") || "{}");
      const res = await fetch("/api/patient/scan/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markers, score: sr.score, inflDomain: sr.inflDomain, metDomain: sr.metDomain, nlr: sr.nlr, tyg: sr.tyg, isFollowUp }),
      });
      const data = await res.json();
      return res.ok ? (data.inflammation_score_id ?? null) : null;
    } catch { return null; }
  }

  async function handleOrder() {
    if (!sr) return;
    const scoreId = await saveScanToDb(false);
    const params = new URLSearchParams({ tier: selected });
    if (scoreId) params.set("sid", scoreId);
    router.push(`/patient/order?${params}`);
  }

  async function handleSaveFU() {
    if (!sr) return;
    await saveScanToDb(true);
    // Clear transient scan state
    sessionStorage.removeItem("gg_score");
    sessionStorage.removeItem("gg_verified");
    sessionStorage.removeItem("gg_scan");
    router.push("/patient/dashboard");
  }

  if (!sr) return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f)", color: "rgba(255,255,255,.55)" }}>Loading…</div>
  );

  const color = scoreColor(sr.score);
  const band = scoreBand(sr.score);
  const summary = scoreSummary(sr.score);
  const suggested = suggestTier(sr.score);
  const scanNum = history.length + 1;
  const scanOrdinals = ["", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
  const scanLabel = (scanOrdinals[scanNum] ?? `${scanNum}th`) + " Scan";
  const activeTier = enrolled && activeTierKey ? TIERS[activeTierKey] : null;
  const prevScore = history.length > 0 ? history[history.length - 1].score : null;
  const delta = prevScore !== null ? prevScore - sr.score : null;
  const markerCount = Object.values(JSON.parse(sessionStorage.getItem("gg_verified") || "{}")).filter(v => v !== null).length;

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", color: "#fff", fontFamily: "var(--f)" }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--bl)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <span style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, color: "rgba(255,255,255,.88)" }}>GutGuard</span>
        </div>
        <div style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, letterSpacing: ".10em", color: "rgba(255,255,255,.45)" }}>YOUR RESULTS</div>
      </div>

      {/* Score hero */}
      <div style={{ padding: "20px 24px 0", position: "relative" }}>
        <div ref={ambRef} style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(212,168,64,.10) 0%,transparent 65%)", pointerEvents: "none", transition: "background 1.2s", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1, background: "#fff", borderRadius: 20, boxShadow: "0 12px 48px rgba(0,0,0,.28)", padding: "24px 20px 20px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 20, background: "rgba(12,16,23,.06)", fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 600, color: "rgba(12,16,23,.60)", letterSpacing: ".04em", marginBottom: 16 }}>
            <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><rect x={3} y={4} width={18} height={18} rx={2} /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
            {dbLoading ? <Skeleton w="60px" h={14} r={4} /> : <span>{scanLabel}</span>}
          </div>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
            <div className="score-ring" style={{ width: 160, height: 160, position: "relative", zIndex: 1 }}>
              <div className="ring-trk" style={{ background: "rgba(12,16,23,.08)" }} />
              <div ref={ringRef} className="ring-fill" style={{ "--ra": "0deg", opacity: 0 } as React.CSSProperties} />
              <div className="ring-c">
                <span ref={scoreRef} style={{ fontSize: "clamp(52px,17vw,72px)", fontWeight: 800, letterSpacing: "-.05em", lineHeight: 1, color, transition: "color .5s" }}>0</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12, marginBottom: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", padding: "5px 16px", borderRadius: 20, background: `${color}18`, border: `1px solid ${color}33`, fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, color }}>{band} Inflammation</span>
          </div>
          {delta !== null && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, padding: "4px 12px", borderRadius: 20, background: delta > 0 ? "rgba(92,184,130,.08)" : "rgba(212,32,32,.08)", fontSize: "clamp(18px,5vw,20px)", fontWeight: 700, color: delta > 0 ? "#5CB882" : "#D42020" }}>
              {delta > 0 ? `↓${delta} from last scan` : delta < 0 ? `↑${Math.abs(delta)} from last scan` : "Same as last scan"}
            </div>
          )}
          <div style={{ fontSize: "clamp(17px,4.5vw,19px)", color: "rgba(12,16,23,.50)", letterSpacing: ".01em", marginTop: 6 }}>
            {markerCount} of 8 markers · {scanLabel}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div style={{ padding: "16px 24px 0" }}>
        <div style={{ fontSize: "clamp(18px,5.2vw,21px)", color: "rgba(255,255,255,.90)", lineHeight: 1.6 }}>{summary}</div>
      </div>

      {/* Domain breakdown */}
      <div className="mx" style={{ padding: "16px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Inflammatory", val: sr.inflDomain, hint: "hs-CRP + NLR" },
            { label: "Metabolic", val: sr.metDomain, hint: "Glucose, TyG, HDL, ALT" },
          ].map(({ label, val, hint }) => (
            <div key={label} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ fontSize: "clamp(17px,4.5vw,19px)", color: "rgba(255,255,255,.50)", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: "clamp(24px,6.8vw,30px)", fontWeight: 800, color: scoreColor(val * 2), letterSpacing: "-.04em" }}>{val}<span style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 400, color: "rgba(255,255,255,.35)" }}>/50</span></div>
              <div style={{ fontSize: "clamp(17px,4.5vw,19px)", color: "rgba(255,255,255,.35)", marginTop: 2 }}>{hint}</div>
            </div>
          ))}
        </div>

        {sr.flags.length > 0 && (
          <div style={{ padding: "12px 16px", background: "rgba(212,32,32,.06)", border: "1px solid rgba(212,32,32,.18)", borderRadius: 14, marginBottom: 16 }}>
            <div style={{ fontSize: "clamp(17px,4.5vw,19px)", fontWeight: 700, color: "#F87171", marginBottom: 4 }}>⚠ Critical Flags</div>
            {sr.flags.map(f => <div key={f} style={{ fontSize: "clamp(17px,4.5vw,19px)", color: "#FCA5A5", padding: "2px 0" }}>• {f}</div>)}
          </div>
        )}

        {/* CTA section — skeleton while DB loads */}
        {dbLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            <Skeleton w="60%" h={18} r={6} />
            <Skeleton w="100%" h={80} r={14} />
            <Skeleton w="100%" h={54} r={14} />
          </div>
        ) : enrolled && activeTier ? (
          <>
            <div style={{ padding: 22, background: "var(--w)", borderRadius: 14, boxShadow: "0 2px 16px rgba(0,0,0,.04)", marginBottom: 14, borderLeft: "3px solid var(--bl)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontSize: "clamp(17px,4.5vw,19px)", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--d4)" }}>Currently Enrolled</div>
                <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, padding: "3px 8px", borderRadius: 8, background: "rgba(59,130,200,.06)", color: "var(--bl)" }}>{scanLabel}</div>
              </div>
              <div style={{ fontSize: "clamp(20px,5.5vw,24px)", fontWeight: 700, color: "var(--d1)", marginBottom: 4 }}>{activeTier.f}</div>
              <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "var(--d3)" }}>{activeTier.b} blisters · {activeTier.c} capsules</div>
            </div>
            <button className="btn-p" onClick={handleSaveFU} style={{ borderRadius: 14, marginBottom: 8 }}>
              Save {scanLabel} &amp; View Progress
            </button>
            <div style={{ fontSize: "clamp(18px,5.2vw,21px)", color: "rgba(255,255,255,.45)", textAlign: "center", marginTop: 12, marginBottom: 40, lineHeight: 1.6 }}>
              For monitoring purposes only. Does not replace medical diagnosis.
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, color: "rgba(255,255,255,.88)", marginBottom: 4 }}>Recommended Protocol</div>
              <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "rgba(255,255,255,.55)", marginBottom: 14 }}>Based on your score, we suggest <strong style={{ color: "#fff" }}>{TIERS[suggested].f}</strong>.</div>
            </div>
            {TIER_ORDER.map(key => {
              const tier = TIERS[key]; const isOn = selected === key; const isSugg = key === suggested; const isGrow = key === "grow";
              return (
                <div key={key} className={`tier${isOn ? " on" : ""}${isGrow ? " tier-hero-grow" : ""}`} onClick={() => setSelected(key)}>
                  <div className="tier-r"><div className="tier-ri" /></div>
                  {isSugg && <div style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, background: isGrow ? "rgba(255,255,255,.10)" : "rgba(59,130,200,.08)", fontSize: "clamp(17px,4.5vw,19px)", fontWeight: 700, color: isGrow ? "rgba(255,255,255,.70)" : "var(--bl)", marginBottom: 8 }}>Recommended</div>}
                  <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6, color: isGrow ? "rgba(255,255,255,.60)" : "var(--d3)" }}>{tier.n}</div>
                  <div style={{ fontSize: "clamp(38px,12vw,52px)", fontWeight: 800, letterSpacing: "-.05em", lineHeight: 1, color: isGrow ? "#fff" : "var(--d1)" }}>₱{tier.p.toLocaleString()}</div>
                  <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 400, color: isGrow ? "rgba(255,255,255,.55)" : "var(--d3)", marginTop: 4 }}>{tier.c} capsules · {tier.d} days</div>
                  <div style={{ fontSize: "clamp(18px,5.2vw,21px)", color: isGrow ? "rgba(255,255,255,.88)" : "var(--d3)", marginTop: 16, paddingTop: 14, borderTop: isGrow ? "1px solid rgba(255,255,255,.06)" : "1px solid var(--lt2)", lineHeight: 1.6 }}>
                    {tier.scans} BioScan{tier.scans > 1 ? " reviews" : " review"} included · {tier.w} week{tier.w > 1 ? "s" : ""} supply
                  </div>
                </div>
              );
            })}
            <button className="btn-p grn" onClick={handleOrder} style={{ marginTop: 8 }}>
              Order {TIERS[selected].f} · ₱{TIERS[selected].p.toLocaleString()}
            </button>
            <div style={{ fontSize: "clamp(18px,5.2vw,21px)", color: "rgba(255,255,255,.45)", textAlign: "center", marginTop: 20, marginBottom: 40, lineHeight: 1.6 }}>
              For monitoring purposes only. Does not replace medical diagnosis.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
