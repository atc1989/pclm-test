"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { scoreColor, scoreBand, TIERS, type ScoreResult, type TierKey } from "@/lib/glis/score";

function scanOrd(n: number) {
  return n === 1 ? "1st Scan" : n === 2 ? "2nd Scan" : n === 3 ? "3rd Scan" : `${n}th Scan`;
}

function drReviewMsg(score: number, name: string): string {
  if (score <= 25) return `Hi ${name}, your 1st Scan results look excellent — score of ${score}. Your body is in great shape. Keep it up and we'll continue monitoring your progress.`;
  if (score <= 50) return `Hi ${name}, I've reviewed your 1st Scan. Score of ${score} shows your body needs some support. Stay consistent with your protocol and daily routine. We're on the right track.`;
  if (score <= 75) return `Hi ${name}, your 1st Scan came in at ${score}. There are signs your body still needs support. Stay with the protocol — consistency is what makes the difference.`;
  return `Hi ${name}, your 1st Scan shows a score of ${score}. Your readings are elevated. Please continue the protocol as directed and reach out on Telegram if you have any concerns.`;
}

// ─── Skeleton pieces ───────────────────────────────────────────────
function Sk({ w = "100%", h, r = 8 }: { w?: string; h: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "rgba(255,255,255,.08)", animation: "pulse 1.6s ease-in-out infinite", flexShrink: 0 }} />;
}

function ScoredSkeleton() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", fontFamily: "var(--f)", color: "#fff" }}>
      {/* Nav skeleton */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
        <Sk w="100px" h={22} r={6} />
        <div style={{ display: "flex", gap: 8 }}><Sk w="70px" h={28} r={8} /><Sk w="70px" h={28} r={8} /></div>
      </div>
      {/* Ring skeleton */}
      <div style={{ textAlign: "center", padding: "36px 24px 0" }}>
        <Sk w="80px" h={18} r={12} />
        <div style={{ margin: "24px auto", width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.08)", animation: "pulse 1.6s ease-in-out infinite" }} />
        <Sk w="120px" h={32} r={20} />
      </div>
      {/* Scan journey skeleton */}
      <div style={{ padding: "28px 24px 0" }}>
        <div style={{ padding: "28px 20px 24px", background: "rgba(255,255,255,.04)", borderRadius: 20 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[0, 1, 2].map(i => <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}><Sk w="40px" h={16} r={6} /><Sk w="16px" h={16} r={8} /><Sk w="50px" h={14} r={4} /></div>)}
          </div>
        </div>
      </div>
      {/* Cards skeleton */}
      <div style={{ padding: "20px 24px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        <Sk h={72} r={14} />
        <Sk h={120} r={14} />
      </div>
    </div>
  );
}

type ScanEntry = { score: number; date: string; interpretation: string };

type DashboardData = {
  name: string | null;
  scanHistory: ScanEntry[];
  latestScore: { score: number; interpretation: string } | null;
  activeProtocol: { protocol_key: TierKey; started_at: string; order: { scans_included: number; supply_days: number; capsule_count: number; bottle_count: number } | null } | null;
};

export function PatientDashboardContent() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [collOpen, setCollOpen] = useState(false);
  const ringFillRef = useRef<HTMLDivElement>(null);
  const scoreNumRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    fetch("/api/patient/dashboard")
      .then(r => r.json())
      .then(d => {
        if (d.error) { router.replace("/patient/sign-in"); return; }
        setData(d);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [router]);

  const latestScore = data?.scanHistory?.length ? data.scanHistory[data.scanHistory.length - 1].score : null;

  useEffect(() => {
    if (latestScore === null) return;
    const col = scoreColor(latestScore);
    setTimeout(() => {
      const deg = Math.round((latestScore / 100) * 360);
      if (ringFillRef.current) {
        ringFillRef.current.style.opacity = "1";
        ringFillRef.current.style.setProperty("--ra", `${deg}deg`);
      }
      if (scoreNumRef.current) {
        let cur = 0;
        const step = Math.max(1, Math.floor(latestScore / 40));
        const iv = setInterval(() => {
          cur = Math.min(cur + step, latestScore);
          if (scoreNumRef.current) scoreNumRef.current.textContent = String(cur);
          if (cur >= latestScore) clearInterval(iv);
        }, 30);
      }
      // Clear transient scan sessionStorage now that DB is loaded
      sessionStorage.removeItem("gg_score");
      sessionStorage.removeItem("gg_verified");
      sessionStorage.removeItem("gg_scan");
    }, 200);
  }, [latestScore]);

  if (loading) return <ScoredSkeleton />;

  const history = data?.scanHistory ?? [];
  const patientName = data?.name ?? "";
  const enrolled = !!data?.activeProtocol;
  const tierKey = data?.activeProtocol?.protocol_key ?? null;
  const tier = tierKey ? TIERS[tierKey] : null;

  // ─── EMPTY STATE (no scans yet) ───────────────────────────────────
  if (!history.length) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--bg)", fontFamily: "var(--f)" }}>
        <div style={{ background: "radial-gradient(ellipse at 50% 28%,rgba(59,130,200,.07) 0%,transparent 62%)", flex: 1, display: "flex", flexDirection: "column" }}>
          <div className="hb an">
            <div className="hb-ico"><svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></div>
            <span className="hb-n">GutGuard</span>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: 14, background: "rgba(255,255,255,.04)" }}>
              <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.30)" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
              <span style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: "rgba(255,255,255,.65)" }}>Dr. Shane Animas</span>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
            <div className="an d1" style={{ position: "relative", marginBottom: 32 }}>
              <div className="score-ring" style={{ width: "clamp(160px,46vw,200px)", height: "clamp(160px,46vw,200px)" }}>
                <div className="ring-trk" style={{ animation: "ringBreathe 3s ease-in-out infinite" }} />
                <div className="ring-fill" style={{ opacity: 0 }} />
                <div className="ring-c">
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, letterSpacing: ".12em", color: "rgba(255,255,255,.20)", textTransform: "uppercase", animation: "pulse 2s ease-in-out infinite" }}>awaiting</div>
                    <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, letterSpacing: ".12em", color: "rgba(255,255,255,.20)", textTransform: "uppercase", marginTop: 2, animation: "pulse 2s ease-in-out infinite .3s" }}>your scan</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="an d2" style={{ textAlign: "center", maxWidth: 280, marginBottom: 24 }}>
              <div style={{ fontSize: "clamp(22px,6.2vw,28px)", fontWeight: 800, color: "rgba(255,255,255,.88)", letterSpacing: "-.035em", lineHeight: 1.1 }}>Know which direction<br />your body is heading.</div>
              <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 400, color: "rgba(255,255,255,.65)", marginTop: 12, lineHeight: 1.5 }}>One blood panel. One number.<br />Under 30 seconds.</div>
            </div>
            <div className="an d3" style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28, width: "100%", maxWidth: 300 }}>
              {[
                { bg: "rgba(59,130,200,.12)", border: "rgba(59,130,200,.25)", label: "Scan", ico: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="rgba(59,130,200,.80)" strokeWidth={2.2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
                { bg: "rgba(92,184,130,.08)", border: "rgba(92,184,130,.15)", label: "Score", ico: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="rgba(92,184,130,.65)" strokeWidth={2.2}><circle cx={12} cy={12} r={10} /><polyline points="12 6 12 12 16 14" /></svg> },
                { bg: "rgba(212,168,64,.08)", border: "rgba(212,168,64,.15)", label: "Protocol", ico: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,64,.65)" strokeWidth={2.2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
              ].map(({ bg, border, label, ico }, idx) => (
                <div key={label} style={{ display: "contents" }}>
                  {idx > 0 && <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)", marginBottom: 14 }} />}
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: bg, border: `1.5px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}>{ico}</div>
                    <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: "rgba(255,255,255,.55)", letterSpacing: ".04em" }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="an d4" style={{ width: "100%", maxWidth: 320 }}>
              <button className="btn-p" onClick={() => router.push("/patient/upload")} style={{ borderRadius: 14, minHeight: 54 }}>Scan My Labs</button>
            </div>
          </div>
          <div className="an d5" style={{ padding: "0 28px 28px" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, fontSize: "clamp(18px,5vw,20px)", fontWeight: 400, color: "rgba(255,255,255,.55)" }}>
              {[{ icon: <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.30)" strokeWidth={2.5}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>, label: "Private" },
                { icon: <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.30)" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>, label: "most PH labs" },
                { icon: <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.30)" strokeWidth={2.5}><circle cx={12} cy={12} r={10} /><path d="M12 6v6l4 2" /></svg>, label: "30 sec" },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>{icon}{label}</div>
              ))}
            </div>
          </div>
        </div>
        <RInfo collOpen={collOpen} setCollOpen={setCollOpen} />
      </div>
    );
  }

  // ─── SCORED STATE ─────────────────────────────────────────────────
  const score = latestScore!;
  const col = scoreColor(score);
  const band = scoreBand(score);
  const doneScans = history.length;
  const totalSlots = Math.max(doneScans + 1, tier?.scans ?? 1);
  const daysOn = 1;
  const remaining = tier ? Math.max(0, tier.d - daysOn) : 0;
  const pct = tier ? Math.min(100, Math.round(daysOn / tier.d * 100)) : 0;
  const isEarly = pct < 8;
  const nextDays = remaining > 30 ? Math.round(remaining / 2) : remaining;
  const reviewMsg = drReviewMsg(score, patientName || "there");
  const latestScanLabel = scanOrd(doneScans);

  return (
    <div style={{ background: `radial-gradient(ellipse at 50% 0%,${col}14 0%,transparent 60%)`, minHeight: "100dvh", fontFamily: "var(--f)", color: "#fff" }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="hb-ico"><svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></div>
          <span style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, color: "rgba(255,255,255,.88)" }}>GutGuard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ padding: "5px 12px", borderRadius: 8, background: "rgba(255,255,255,.04)", fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: "rgba(255,255,255,.70)" }}>{latestScanLabel}</div>
          <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/home"); }}
            style={{ padding: "5px 12px", borderRadius: 8, background: "rgba(255,255,255,.04)", border: "none", fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: "rgba(255,255,255,.40)", fontFamily: "var(--f)", cursor: "pointer" }}>
            Sign out
          </button>
        </div>
      </div>

      {/* Score hero */}
      <div style={{ textAlign: "center", padding: "36px 24px 0" }}>
        {patientName && <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 300, color: "rgba(255,255,255,.70)", marginBottom: 24, letterSpacing: ".02em" }}>Hey {patientName}</div>}
        <div className="score-ring" style={{ width: 140, height: 140, margin: "0 auto", filter: `drop-shadow(0 0 24px ${col}35)` }}>
          <div className="ring-trk" />
          <div ref={ringFillRef} className="ring-fill" style={{ "--ra": "0deg", opacity: 0, background: "conic-gradient(from 180deg,#5CB882 0%,#7EBC6C 14%,#9AB854 28%,#C4B044 42%,#D4A840 52%,#CC8844 66%,#E8772E 78%,#D03030 90%,#D42020 100%)" } as React.CSSProperties} />
          <div className="ring-c">
            <span ref={scoreNumRef} style={{ fontSize: "clamp(40px,13vw,56px)", fontWeight: 800, letterSpacing: "-.05em", lineHeight: 1, color: col, transition: "color .5s" }}>0</span>
          </div>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16, padding: "7px 16px", borderRadius: 20, background: `${col}12`, fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, color: col }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: col }} />{band}
        </div>
      </div>

      {/* Scan Journey */}
      <div style={{ padding: "28px 24px 0" }}>
        <div style={{ padding: "28px 20px 24px", background: "rgba(255,255,255,.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,.04)" }}>
          <div style={{ display: "flex", alignItems: "center", position: "relative", marginBottom: 8, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
            {Array.from({ length: totalSlots }, (_, i) => {
              const entry = i < doneScans ? history[i] : null;
              const done = entry !== null;
              const isCurrent = i === doneScans - 1;
              const isNext = i === doneScans;
              const scanCol = done ? scoreColor(entry!.score) : "rgba(255,255,255,.08)";
              const prevEntry = i > 0 && i - 1 < doneScans ? history[i - 1] : null;
              const delta = done && prevEntry ? prevEntry.score - entry!.score : null;
              const lineGradient = done && prevEntry ? `linear-gradient(90deg,${scoreColor(prevEntry.score)},${scanCol})` : "rgba(255,255,255,.06)";
              const lineDashed = !done || !prevEntry;
              return (
                <div key={i} style={{ display: "contents" }}>
                  {i > 0 && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", margin: "0 -2px", minWidth: 24 }}>
                      {delta !== null
                        ? <div style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 800, color: delta > 0 ? "rgba(92,184,130,.65)" : "rgba(212,32,32,.55)", marginBottom: 4 }}>{delta > 0 ? `↓${delta}` : `↑${Math.abs(delta)}`}</div>
                        : <div style={{ height: 19 }} />}
                      <div style={{ width: "100%", height: 2, borderRadius: 1, background: lineDashed ? "rgba(255,255,255,.06)" : lineGradient, backgroundImage: lineDashed ? "repeating-linear-gradient(90deg,rgba(255,255,255,.10) 0,rgba(255,255,255,.10) 5px,transparent 5px,transparent 10px)" : undefined }} />
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 56, zIndex: 1 }}>
                    {done
                      ? <div style={{ fontSize: isCurrent ? "clamp(18px,5.5vw,22px)" : "clamp(18px,5.2vw,21px)", fontWeight: 800, color: scanCol, marginBottom: 8, letterSpacing: "-.03em", filter: isCurrent ? `drop-shadow(0 0 8px ${scanCol}30)` : undefined }}>{entry!.score}</div>
                      : <div style={{ height: 28 }} />}
                    {done
                      ? <div style={{ width: 16, height: 16, borderRadius: "50%", background: scanCol, border: "2.5px solid rgba(255,255,255,.12)", boxShadow: isCurrent ? `0 0 16px ${scanCol}40` : undefined }} />
                      : <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px dashed rgba(255,255,255,.08)" }} />}
                    <div style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 600, color: done ? "rgba(255,255,255,.45)" : "rgba(255,255,255,.12)", marginTop: 8, whiteSpace: "nowrap" }}>{scanOrd(i + 1)}</div>
                    {done
                      ? <div style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 300, color: "rgba(255,255,255,.55)", marginTop: 2 }}>{(entry!.date || "").split(",")[0]}</div>
                      : isNext ? <div style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 300, color: "rgba(255,255,255,.10)", marginTop: 2 }}>Next</div> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Doctor message */}
      <div style={{ margin: "28px 24px 0", cursor: "pointer" }}>
        <div style={{ padding: "14px 18px", borderRadius: 14, background: "linear-gradient(135deg,rgba(59,130,200,.10),rgba(59,130,200,.04))", border: "1px solid rgba(59,130,200,.15)", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bl)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            <div style={{ position: "absolute", top: -3, right: -3, width: 14, height: 14, borderRadius: "50%", background: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff" }}>1</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: "rgba(255,255,255,.88)" }}>New message from Dr. Shane Animas</div>
            <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "rgba(255,255,255,.70)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{reviewMsg.substring(0, 60)}...</div>
          </div>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.20)" strokeWidth={2} style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6" /></svg>
        </div>
      </div>

      {/* Active Protocol */}
      {enrolled && tier && (
        <div style={{ padding: "28px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, letterSpacing: ".08em", color: "rgba(255,255,255,.55)", textTransform: "uppercase" }}>Active Protocol</div>
            <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "rgba(255,255,255,.55)" }}>Day {daysOn} of {tier.d}</div>
          </div>
          <div style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, color: "rgba(255,255,255,.70)", marginBottom: 8 }}>{tier.f}</div>
          {isEarly ? (
            <div style={{ position: "relative", height: 8, background: "rgba(255,255,255,.06)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: 12, height: "100%", borderRadius: 8, background: col, animation: "pulse 1.5s ease infinite" }} />
            </div>
          ) : (
            <div style={{ height: 8, background: "rgba(255,255,255,.06)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${col},var(--grn))`, borderRadius: 8 }} />
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", marginTop: 16 }}>
            <div style={{ fontSize: "clamp(34px,10vw,42px)", fontWeight: 800, color: "var(--bl)", letterSpacing: "-.04em", lineHeight: 1, minWidth: 56 }}>{nextDays}</div>
            <div style={{ marginLeft: 14, paddingLeft: 14, borderLeft: "1.5px solid rgba(255,255,255,.06)" }}>
              <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: "rgba(255,255,255,.55)" }}>days until next scan</div>
              <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "rgba(255,255,255,.70)", marginTop: 2 }}>{tier.b} blisters · {tier.c} caps · {remaining}d remaining</div>
            </div>
          </div>
        </div>
      )}

      {/* No protocol */}
      {!enrolled && (
        <div style={{ margin: "28px 24px 0", padding: 24, borderRadius: 14, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)" }}>
          <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, letterSpacing: ".06em", color: "rgba(255,255,255,.55)", textTransform: "uppercase", marginBottom: 8 }}>No protocol active</div>
          <div style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, color: "rgba(255,255,255,.70)", marginBottom: 6 }}>Ready when you are</div>
          <div style={{ fontSize: "clamp(18px,5.2vw,21px)", color: "rgba(255,255,255,.70)", lineHeight: 1.5, marginBottom: 20 }}>Your score suggests starting a protocol. Order yours today.</div>
          <button className="btn-p" onClick={() => router.push("/patient/results")} style={{ borderRadius: 14, margin: 0, width: "100%" }}>View Protocols</button>
        </div>
      )}

      <div style={{ margin: "28px 24px 0", height: 1, background: "rgba(255,255,255,.04)" }} />

      {/* Upload CTA */}
      <div style={{ padding: "24px 24px 16px" }}>
        <button className="btn-p" onClick={() => router.push("/patient/upload")} style={{ marginBottom: 8, borderRadius: 14 }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} style={{ marginRight: 6 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1={12} y1={3} x2={12} y2={15} /></svg>
          {enrolled ? "Upload Next Lab Test" : "Scan My Labs"}
        </button>
      </div>

      <div style={{ textAlign: "center", padding: "0 24px 32px", fontSize: "clamp(18px,5vw,20px)", color: "rgba(255,255,255,.70)", letterSpacing: ".03em" }}>
        SEC Reg. For Filing · FDA CPR FR-4XXXXXXX · LTO FDO-XXXXXXX
      </div>
    </div>
  );
}

function RInfo({ collOpen, setCollOpen }: { collOpen: boolean; setCollOpen: (v: (o: boolean) => boolean) => void }) {
  return (
    <div style={{ background: "var(--bg)", padding: "32px 0 40px" }}>
      <div className="mx">
        <div className="cd an d4">
          <div className="lb">How it works</div>
          <div className="tt">Scan. Protocol. Re-scan.</div>
          <div style={{ marginTop: 18 }}>
            {([
              { bg: "rgba(59,130,200,.06)", col: "var(--bl)", title: "Upload one blood panel", desc: "See your Lifestyle Inflammation Score in 30 seconds." },
              { bg: "rgba(255,255,255,.06)", col: "rgba(255,255,255,.88)", title: "Follow your protocol", desc: "Daily capsules + guided habits your doctor monitors." },
              { bg: "rgba(204,110,72,.06)", col: "var(--ter)", title: "Re-scan. See what changed.", desc: "Your score moves. Your body is working." },
            ] as const).map(({ bg, col, title, desc }, i) => (
              <div key={i} className="info-step">
                <div className="info-step-n" style={{ background: bg, color: col }}>{i + 1}</div>
                <div>
                  <div style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, color: "rgba(255,255,255,.88)" }}>{title}</div>
                  <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "rgba(255,255,255,.55)" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`cd coll an d5${collOpen ? " open" : ""}`} style={{ padding: "0 24px" }} onClick={() => setCollOpen(o => !o)}>
          <div className="coll-h" style={{ padding: "22px 0" }}>
            The Science &amp; Research
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          <div className="coll-b">
            <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "var(--d2)", lineHeight: 1.6, marginBottom: 16 }}>GutGuard follows a structured protocol backed by published research in peer-reviewed medical journals.</div>
            {([
              { bg: "rgba(59,130,200,.06)", col: "var(--bl)", title: "Prepare your gut", desc: "Prebiotics prepare your gut to absorb what's next" },
              { bg: "rgba(59,130,200,.06)", col: "var(--bl)", title: "Deliver targeted bacteria", desc: "Probiotics reach where they're needed" },
              { bg: "rgba(52,168,83,.06)", col: "var(--grn)", title: "Activate cell repair", desc: "Postbiotics repair your cells from within" },
              { bg: "rgba(52,168,83,.06)", col: "var(--grn)", title: "Measure your progress", desc: "Your score moves. Your body is telling the truth." },
            ] as const).map(({ bg, col, title, desc }, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,.04)" : undefined }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "clamp(18px,5vw,20px)", fontWeight: 800, color: col }}>{i + 1}</div>
                <div>
                  <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: "var(--d1)" }}>{title}</div>
                  <div style={{ fontSize: "clamp(18px,5.2vw,21px)", color: "var(--d3)" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="cd" style={{ padding: 22 }}>
          <div className="lb">Need help?</div>
          <a className="contact-o" href="viber://chat?number=+639174884827">
            <div className="contact-o-i" style={{ background: "#7360F2" }}><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg></div>
            <div><div className="contact-o-n">Viber</div><div className="contact-o-d">+63 917 488 4827</div></div>
          </a>
          <a className="contact-o" href="mailto:hello@gutguard.ph">
            <div className="contact-o-i" style={{ background: "rgba(255,255,255,.06)" }}><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--d1)" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22 6 12 13 2 6" /></svg></div>
            <div><div className="contact-o-n">Email</div><div className="contact-o-d">hello@gutguard.ph</div></div>
          </a>
        </div>
        <div style={{ textAlign: "center", padding: "16px 20px" }}>
          <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "rgba(255,255,255,.45)", letterSpacing: ".03em", marginBottom: 8 }}>GutGuard Protocol · For Filing</div>
          <div style={{ fontSize: "clamp(18px,5.2vw,21px)", color: "rgba(255,255,255,.45)" }}>GutGuard Protocol is a registered dietary supplement. Not a treatment for any disease or medical condition.</div>
          <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "rgba(255,255,255,.45)", marginTop: 4 }}>© 2026 GutGuard Philippines</div>
        </div>
      </div>
    </div>
  );
}
