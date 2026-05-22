"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/supabase/hooks";
import {
  formatNumber,
  getScoreColor,
  getScoreLabel,
  imsiCalc,
  patients,
  protocols,
} from "@/doctor/mock-data";

type ApprovalType = "Approved" | "Approved (Modified Dose)" | null;

function lerpHex(a: string, b: string, t: number): string {
  const p = (x: string) => [parseInt(x.slice(1,3),16), parseInt(x.slice(3,5),16), parseInt(x.slice(5,7),16)];
  const h = (v: number) => Math.round(v).toString(16).padStart(2,'0');
  const c1 = p(a), c2 = p(b);
  return '#'+h(c1[0]+(c2[0]-c1[0])*t)+h(c1[1]+(c2[1]-c1[1])*t)+h(c1[2]+(c2[2]-c1[2])*t);
}
function sColDr(s: number): string {
  if (s <= 25) return lerpHex('#34A853','#5CB882', s/25);
  if (s <= 50) return lerpHex('#5CB882','#E8B230', (s-25)/25);
  if (s <= 75) return lerpHex('#E8B230','#E8772E', (s-50)/25);
  return lerpHex('#E8772E','#D42020', (s-75)/25);
}

const reviewStyles = `
@property --ra{syntax:'<angle>';initial-value:0deg;inherits:false}
:root{--mr-bg:#0c1017;--mr-s1:#0f1f38;--mr-s2:#162d50;--mr-blue:#3b82c8;--mr-lt:#f3f2ef;--mr-lt2:#e8e6e0;--mr-lt3:#dddad2;--mr-white:#fff;--mr-d1:#1a1a17;--mr-d2:#4a4840;--mr-d3:#7a7870;--mr-d4:#9a978f;--mr-green:#5cb882;--mr-gold:#d4a840;--mr-orange:#e8772e;--mr-red:#d42020;--mr-font:'Outfit',system-ui,-apple-system,sans-serif}
@keyframes detailIn{from{opacity:0;transform:scale(.97) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes deltaIn{from{opacity:0;transform:translateY(4px) scale(.9)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes barFill{from{width:0}to{width:var(--target-w)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes checkGrow{0%{transform:scale(0);opacity:0}62%{transform:scale(1.14);opacity:1}82%{transform:scale(.96)}100%{transform:scale(1);opacity:1}}
@keyframes msgSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.mr-page{background:var(--mr-lt2);min-height:100vh;min-height:100dvh;display:flex;flex-direction:column}
.mr-shell{background:var(--mr-lt);min-height:100vh;min-height:100dvh;font-family:var(--mr-font);color:var(--mr-d1);width:100%;max-width:720px;margin:0 auto;position:relative;box-shadow:0 0 70px rgba(0,0,0,.13)}
@media(min-width:900px){.mr-shell{border-radius:20px;overflow:hidden;margin:20px auto;min-height:calc(100vh - 40px);min-height:calc(100dvh - 40px);box-shadow:0 0 60px rgba(0,0,0,.18)}}
.mr-sticky-nav{position:sticky;top:0;z-index:20;background:rgba(243,242,239,.97);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--mr-lt2)}
.mr-nav-row{display:flex;align-items:center;justify-content:space-between;padding:16px 24px}
.mr-back-btn{background:none;border:none;font:700 16px var(--mr-font);color:var(--mr-d3);padding:8px 0;cursor:pointer;display:flex;align-items:center;gap:6px;min-height:44px}
.mr-back-btn:active{opacity:.6}
.mr-nav-title{font-size:16px;font-weight:850;color:var(--mr-d1)}
.mr-hero{background:linear-gradient(165deg,var(--mr-s1),var(--mr-s2));padding:clamp(14px,4.5vw,24px) 22px 20px;animation:detailIn .28s cubic-bezier(.32,1,.68,1) both}
.mr-hero-row{display:flex;align-items:center;gap:18px;margin-bottom:16px}
.mr-ring{position:relative;flex-shrink:0}
.mr-ring-trk{position:absolute;inset:0;border-radius:50%;background:rgba(255,255,255,.08);-webkit-mask:radial-gradient(closest-side,transparent 84%,#000 84.5%,#000 96%,transparent 96.5%);mask:radial-gradient(closest-side,transparent 84%,#000 84.5%,#000 96%,transparent 96.5%)}
.mr-ring-fill{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 180deg,#5CB882 0%,#7EBC6C 14%,#9AB854 28%,#C4B044 42%,#D4A840 52%,#CC8844 66%,#CC6E48 78%,#D03030 90%,#D42020 100%);-webkit-mask-image:radial-gradient(closest-side,transparent 84%,#000 84.5%,#000 96%,transparent 96.5%),conic-gradient(from 180deg,#000 var(--ra),transparent var(--ra));-webkit-mask-composite:source-in;mask-image:radial-gradient(closest-side,transparent 84%,#000 84.5%,#000 96%,transparent 96.5%),conic-gradient(from 180deg,#000 var(--ra),transparent var(--ra));mask-composite:intersect;transition:--ra 1.2s cubic-bezier(.32,1,.68,1)}
@supports not (mask-composite:intersect){.mr-ring-fill{-webkit-mask-image:radial-gradient(closest-side,transparent 84%,#000 84.5%,#000 96%,transparent 96.5%);mask-image:radial-gradient(closest-side,transparent 84%,#000 84.5%,#000 96%,transparent 96.5%)}}
.mr-ring-c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.mr-score-label{font-size:17px;font-weight:750;color:rgba(255,255,255,.95);margin-bottom:3px}
.mr-score-meta{font-size:13px;color:rgba(255,255,255,.62)}
.mr-delta{display:inline-flex;align-items:center;gap:5px;margin-top:8px;padding:4px 10px;border-radius:8px;background:rgba(92,184,130,.12);border:1px solid rgba(92,184,130,.2);animation:deltaIn .5s cubic-bezier(.32,1,.68,1) .3s both}
.mr-domains{margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,.06)}
.mr-domain-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.mr-domain-label{font-size:11px;font-weight:750;letter-spacing:.06em;text-transform:uppercase}
.mr-domain-val{font-size:12px;font-weight:850;color:rgba(255,255,255,.60)}
.mr-domain-bar{height:5px;border-radius:3px;background:rgba(255,255,255,.08);overflow:hidden;margin-top:5px}
.mr-domain-bar-fill{height:100%;border-radius:3px;transition:width 1.1s cubic-bezier(.32,1,.68,1)}
.mr-flag-strip{margin-top:10px;padding:8px 12px;border-radius:10px;background:rgba(212,32,32,.06);border:1px solid rgba(212,32,32,.12);display:flex;align-items:center;gap:6px}
.mr-scan-stepper{display:flex;align-items:center;margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.06)}
.mr-scan-dot{display:flex;flex-direction:column;align-items:center;min-width:44px}
.mr-scan-line{flex:1;height:1.5px}
.mr-body{padding:clamp(16px,4.5vw,24px) 22px clamp(100px,14vw,120px)}
.mr-symptom-pills{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px;animation:fadeUp .35s cubic-bezier(.32,1,.68,1) .1s both}
.mr-symptom-pill{padding:7px 13px;border-radius:10px;background:var(--mr-white);box-shadow:0 1px 3px rgba(0,0,0,.06);font-size:14px;font-weight:750;color:var(--mr-d2)}
.mr-review-panel{padding:18px;border-radius:16px;background:rgba(212,32,32,.04);border:1.5px solid rgba(212,32,32,.12);margin-bottom:16px;animation:fadeUp .38s cubic-bezier(.32,1,.68,1) .15s both}
.mr-review-title{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.mr-review-desc{font-size:15px;color:var(--mr-d2);line-height:1.5;margin-bottom:14px}
.mr-action-col{display:flex;flex-direction:column;gap:7px}
.mr-approve-btn{width:100%;padding:13px 16px;border-radius:12px;border:none;background:var(--mr-green);color:#fff;font:750 16px var(--mr-font);cursor:pointer;min-height:48px;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 16px rgba(92,184,130,.28);transition:transform .1s,box-shadow .1s}
.mr-approve-btn:active{transform:scale(.97);box-shadow:0 2px 8px rgba(92,184,130,.18)}
.mr-modify-btn{width:100%;padding:13px 16px;border-radius:12px;border:1.5px solid var(--mr-blue);background:rgba(59,130,200,.04);color:var(--mr-blue);font:750 16px var(--mr-font);cursor:pointer;min-height:48px;transition:transform .1s,background .15s}
.mr-modify-btn:active{transform:scale(.97);background:rgba(59,130,200,.08)}
.mr-approved-card{padding:14px 16px;border-radius:14px;background:rgba(92,184,130,.04);border:1px solid rgba(92,184,130,.10);margin-bottom:16px;display:flex;align-items:center;gap:10px;animation:fadeUp .35s cubic-bezier(.32,1,.68,1) both}
.mr-action-btns{display:flex;flex-direction:column;gap:8px;animation:fadeUp .4s cubic-bezier(.32,1,.68,1) .2s both}
.mr-msg-btn{width:100%;padding:16px;border-radius:14px;border:none;background:var(--mr-blue);color:#fff;font:750 16px var(--mr-font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;min-height:52px;box-shadow:0 4px 18px rgba(59,130,200,.22);transition:transform .1s}
.mr-msg-btn:active{transform:scale(.97)}
.mr-obs-btn{width:100%;padding:13px 16px;border-radius:14px;border:1.5px solid var(--mr-lt3);background:var(--mr-white);font:750 15px var(--mr-font);color:var(--mr-d2);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;min-height:48px;transition:transform .1s}
.mr-obs-btn:active{transform:scale(.97)}
.mr-panel{border-radius:16px;background:rgba(0,0,0,.03);border:1px solid var(--mr-lt2);padding:16px;margin-top:14px;animation:msgSlide .25s cubic-bezier(.32,1,.68,1) both}
.mr-panel-label{font-size:13px;font-weight:850;letter-spacing:.08em;color:var(--mr-d4);text-transform:uppercase;margin-bottom:10px}
.mr-panel-textarea{width:100%;padding:13px 15px;border:1.5px solid var(--mr-lt2);border-radius:12px;font:16px var(--mr-font);color:var(--mr-d1);background:var(--mr-white);outline:none;resize:none;line-height:1.55;transition:border-color .15s}
.mr-panel-textarea:focus{border-color:rgba(59,130,200,.40);box-shadow:0 0 0 3px rgba(59,130,200,.08)}
.mr-panel-send{width:100%;padding:13px;border-radius:12px;border:none;background:var(--mr-blue);color:#fff;font:750 15px var(--mr-font);cursor:pointer;margin-top:8px;min-height:46px;transition:transform .1s}
.mr-panel-send:active{transform:scale(.97)}
.mr-panel-cancel{width:100%;padding:9px;border-radius:10px;border:none;background:transparent;color:var(--mr-d4);font:700 14px var(--mr-font);cursor:pointer;margin-top:4px}
.mr-note-panel{background:rgba(0,0,0,.03);border:1px solid var(--mr-lt2);border-radius:14px;padding:14px 16px;margin-top:14px;animation:msgSlide .25s cubic-bezier(.32,1,.68,1) both}
.mr-note-input{width:100%;padding:11px 13px;border:1.5px solid var(--mr-lt2);border-radius:10px;font:16px var(--mr-font);color:var(--mr-d1);background:var(--mr-white);outline:none;resize:none;transition:border-color .15s}
.mr-note-input:focus{border-color:rgba(59,130,200,.40)}
.mr-sticky-footer{position:fixed;bottom:0;left:0;right:0;z-index:15;background:rgba(243,242,239,.97);border-top:1px solid var(--mr-lt2);padding:12px 22px calc(12px + env(safe-area-inset-bottom,0px));max-width:720px;margin:0 auto}
.mr-sticky-cta{width:100%;min-height:52px;border-radius:14px;border:none;font:750 16px var(--mr-font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:transform .1s,box-shadow .1s}
.mr-sticky-cta:active{transform:scale(.97)}
@media(max-width:520px){.mr-nav-row{padding:14px 18px}.mr-hero{padding:14px 18px 18px}.mr-body{padding:16px 18px 110px}.mr-sticky-footer{padding:10px 18px calc(10px + env(safe-area-inset-bottom,0px))}}
`;

export function MedicalReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useAuth();

  const patientId = Number(searchParams.get("id") ?? "2");
  const patient = patients.find((p: { id: number }) => p.id === patientId) ?? patients.find((p: { status: string }) => p.status === "review") ?? patients[1];

  const [approved, setApproved] = useState(false);
  const [approvalType, setApprovalType] = useState<ApprovalType>(null);
  const [approvalDate] = useState(() => new Date().toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }));
  const [showMsgPanel, setShowMsgPanel] = useState(false);
  const [showObsPanel, setShowObsPanel] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [obsText, setObsText] = useState("");
  const [msgSent, setMsgSent] = useState(false);
  const [obsSent, setObsSent] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const ringFillRef = useRef<HTMLDivElement>(null);

  const protocol = protocols[patient.protocol];
  const drop = patient.baseline ? patient.baseline - patient.score : 0;
  const scoreColor = sColDr(patient.score);
  const scoreLabel = getScoreLabel(patient.score);
  const imsi = imsiCalc(patient.score);
  const doctorName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
  const displayName = doctorName ? `Dr. ${doctorName}` : "Dr. Shane Animas";

  const needsReview = patient.score >= 70 && !approved;

  const symptoms = patient.symptoms.split(/,\s*/);

  // Animate ring sweep
  useEffect(() => {
    const timer = setTimeout(() => {
      ringFillRef.current?.style.setProperty("--ra", `${(patient.score * 3.6).toFixed(1)}deg`);
    }, 80);
    return () => clearTimeout(timer);
  }, [patient.score]);

  // Animate domain bars after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const bars = barRef.current?.querySelectorAll<HTMLElement>(".mr-domain-bar-fill");
      bars?.forEach((bar) => {
        bar.style.width = bar.dataset.target ?? "0%";
      });
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  // Browser back handling
  useEffect(() => {
    const handlePop = () => router.back();
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [router]);

  const handleApprove = (type: "Approved" | "Approved (Modified Dose)") => {
    setApprovalType(type);
    setApproved(true);
    setShowMsgPanel(false);
    setShowObsPanel(false);
    // Pre-fill approval message
    const firstName = patient.name.split(" ")[0];
    setMsgText(
      `Hi ${firstName}, ${displayName} here. I've reviewed your BioScan results — GLIS score ${patient.score}. Your ${protocol.name} Protocol has been approved. You can now complete your order and begin your protocol. Welcome to GutGuard.`
    );
  };

  const handleSendMsg = () => {
    if (!msgText.trim()) return;
    setMsgSent(true);
    setShowMsgPanel(false);
    setTimeout(() => setMsgSent(false), 3200);
  };

  const handleSendObs = () => {
    if (!obsText.trim()) return;
    setObsSent(true);
    setObsText("");
    setShowObsPanel(false);
    setTimeout(() => setObsSent(false), 3200);
  };

  // Scan stepper data
  const scanDots = (() => {
    const numDots = Math.max(protocol.scans, patient.baseline ? 2 : 1);
    const ordinals = ["1st", "2nd", "3rd"];
    const dots: Array<{ score: number | null; label: string; date?: string }> = [];
    if (patient.baseline) {
      dots.push({ score: patient.baseline, label: ordinals[0], date: patient.scanDate });
      dots.push({ score: patient.score, label: ordinals[1], date: "Latest" });
    } else {
      dots.push({ score: patient.score, label: ordinals[0], date: patient.scanDate });
    }
    while (dots.length < numDots) {
      dots.push({ score: null, label: ordinals[dots.length] });
    }
    return dots;
  })();

  const ringSize = 80;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: reviewStyles }} />
      <div className="mr-page">
      <div className="mr-shell">

        {/* Sticky nav */}
        <nav className="mr-sticky-nav" aria-label="Medical review navigation">
          <div className="mr-nav-row">
            <button className="mr-back-btn" type="button" onClick={() => router.back()} aria-label="Go back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </button>
            <div className="mr-nav-title">Medical Review</div>
            <div style={{ width: 60 }} />
          </div>
        </nav>

        {/* Dark hero card */}
        <div className="mr-hero">
          <div className="mr-hero-row">
            {/* Score ring */}
            <div className="mr-ring" style={{ width: ringSize, height: ringSize }} aria-label={`GLIS score ${patient.score}`}>
              <div className="mr-ring-trk" />
              <div className="mr-ring-fill" ref={ringFillRef} />
              <div className="mr-ring-c">
                <span style={{ fontSize: 22, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{patient.score}</span>
              </div>
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div className="mr-score-label">{scoreLabel}</div>
              <div className="mr-score-meta">
                {patient.age}{patient.sex} · {protocol.name} · Day {patient.daysOn} of {protocol.days}
              </div>
              {drop > 0 ? (
                <div className="mr-delta">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--mr-green)" strokeWidth="3"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                  <span style={{ fontSize: 14, fontWeight: 850, color: "var(--mr-green)" }}>↓{drop} pts</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,.58)" }}>from {patient.baseline}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* IMSI domain bars */}
          <div className="mr-domains" ref={barRef}>
            <div className="mr-domain-grid">
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span className="mr-domain-label" style={{ color: "rgba(212,32,32,.65)" }}>Inflammatory</span>
                  <span className="mr-domain-val">{imsi.inflDomain}/50</span>
                </div>
                <div className="mr-domain-bar">
                  <div
                    className="mr-domain-bar-fill"
                    data-target={`${Math.round(imsi.inflDomain / 50 * 100)}%`}
                    style={{ width: 0, background: "linear-gradient(90deg,#e8772e,#d42020)" }}
                  />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span className="mr-domain-label" style={{ color: "rgba(232,178,48,.65)" }}>Metabolic</span>
                  <span className="mr-domain-val">{imsi.metDomain}/50</span>
                </div>
                <div className="mr-domain-bar">
                  <div
                    className="mr-domain-bar-fill"
                    data-target={`${Math.round(imsi.metDomain / 50 * 100)}%`}
                    style={{ width: 0, background: "linear-gradient(90deg,#d4a840,#e8772e)" }}
                  />
                </div>
              </div>
            </div>
            {imsi.flags.length > 0 ? (
              <div className="mr-flag-strip">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--mr-red)" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
                <span style={{ fontSize: 12, color: "var(--mr-red)", fontWeight: 750 }}>{imsi.flags.join(" · ")}</span>
              </div>
            ) : null}
          </div>

          {/* Scan stepper */}
          <div className="mr-scan-stepper" role="list" aria-label="Scan timeline">
            {scanDots.map((dot, i) => {
              const dotColor = dot.score !== null ? getScoreColor(dot.score) : null;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", flex: i < scanDots.length - 1 ? "1 1 auto" : "0 0 auto" }}>
                  <div className="mr-scan-dot" role="listitem">
                    {dotColor ? (
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${dotColor}22`, border: `1.5px solid ${dotColor}70`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 850, color: dotColor }}>
                        {dot.score}
                      </div>
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px dashed rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center" }} />
                    )}
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.58)", marginTop: 3, fontWeight: 700 }}>{dot.label}</div>
                    {dot.date && dot.date !== "Latest" ? <div style={{ fontSize: 9, color: "rgba(255,255,255,.40)", marginTop: 1 }}>{dot.date}</div> : null}
                  </div>
                  {i < scanDots.length - 1 ? (
                    <div className="mr-scan-line" style={{ background: dotColor ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.05)" }} />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <main className="mr-body">

          {/* Symptom pills */}
          <div className="mr-symptom-pills" aria-label="Reported symptoms">
            {symptoms.map((sym: string) => (
              <div key={sym} className="mr-symptom-pill">{sym.trim()}</div>
            ))}
          </div>

          {/* Patient note */}
          <div style={{ padding: "13px 15px", borderRadius: 14, background: "var(--mr-white)", border: "1px solid var(--mr-lt2)", marginBottom: 16, fontSize: 15, color: "var(--mr-d2)", lineHeight: 1.6, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
            {patient.note}
          </div>

          {/* Approval confirmation */}
          {approved && approvalType ? (
            <div className="mr-approved-card" role="status">
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(92,184,130,.15)", border: "1px solid rgba(92,184,130,.30)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, animation: "checkGrow .5s cubic-bezier(.34,1.56,.64,1) .1s both" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mr-green)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 750, color: "var(--mr-green)" }}>Protocol {approvalType}</div>
                <div style={{ fontSize: 13, color: "var(--mr-d3)", marginTop: 2 }}>{displayName} · {approvalDate}</div>
              </div>
            </div>
          ) : null}

          {/* Medical review action panel */}
          {needsReview ? (
            <div className="mr-review-panel" role="region" aria-labelledby="review-heading">
              <div className="mr-review-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mr-red)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <div id="review-heading" style={{ fontSize: 16, fontWeight: 850, color: "var(--mr-red)" }}>Medical Review Required</div>
              </div>
              <div className="mr-review-desc">Elevated markers detected. Review the case and choose an action below.</div>
              <div className="mr-action-col">
                <button className="mr-approve-btn" type="button" onClick={() => handleApprove("Approved")}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Approve Protocol
                </button>
                <button className="mr-modify-btn" type="button" onClick={() => handleApprove("Approved (Modified Dose)")}>
                  Approve — Modified Dose
                </button>
              </div>
            </div>
          ) : null}

          {/* Action buttons */}
          <div className="mr-action-btns">
            {msgSent ? (
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(92,184,130,.06)", border: "1px solid rgba(92,184,130,.15)", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "var(--mr-green)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Message sent to {patient.name.split(" ")[0]}
              </div>
            ) : null}
            {obsSent ? (
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(59,130,200,.06)", border: "1px solid rgba(59,130,200,.12)", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "var(--mr-blue)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Observation recorded
              </div>
            ) : null}
            <button
              className="mr-msg-btn"
              type="button"
              onClick={() => { setShowMsgPanel((v) => !v); setShowObsPanel(false); }}
              aria-expanded={showMsgPanel}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              Message Patient
            </button>
            {showMsgPanel ? (
              <div className="mr-panel">
                <div className="mr-panel-label">Message to {patient.name.split(" ")[0]}</div>
                <textarea
                  className="mr-panel-textarea"
                  rows={5}
                  value={msgText}
                  onChange={(e) => setMsgText(e.currentTarget.value)}
                  placeholder="Write your message…"
                  autoFocus
                />
                <button className="mr-panel-send" type="button" onClick={handleSendMsg} disabled={!msgText.trim()}>Send Message</button>
                <button className="mr-panel-cancel" type="button" onClick={() => setShowMsgPanel(false)}>Cancel</button>
              </div>
            ) : null}
            <button
              className="mr-obs-btn"
              type="button"
              onClick={() => { setShowObsPanel((v) => !v); setShowMsgPanel(false); }}
              aria-expanded={showObsPanel}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Record Observation
            </button>
            {showObsPanel ? (
              <div className="mr-note-panel">
                <div className="mr-panel-label">Clinical observation</div>
                <textarea
                  className="mr-note-input"
                  rows={4}
                  value={obsText}
                  onChange={(e) => setObsText(e.currentTarget.value)}
                  placeholder="Enter your clinical note…"
                  autoFocus
                />
                <button className="mr-panel-send" type="button" onClick={handleSendObs} disabled={!obsText.trim()} style={{ marginTop: 8 }}>Save Observation</button>
                <button className="mr-panel-cancel" type="button" onClick={() => setShowObsPanel(false)}>Cancel</button>
              </div>
            ) : null}
          </div>

          {/* Patient info strip */}
          <div style={{ marginTop: 22, padding: "14px 16px", borderRadius: 14, background: "var(--mr-white)", border: "1px solid var(--mr-lt2)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, boxShadow: "0 1px 3px rgba(0,0,0,.03)" }}>
            {[
              { label: "Lab", value: patient.lab },
              { label: "Scan Date", value: patient.scanDate },
              { label: "Protocol", value: `${protocol.name} · ${protocol.days} days` },
              { label: "Credits", value: `${formatNumber(protocol.credits)} cr` },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 11, fontWeight: 750, letterSpacing: ".08em", color: "var(--mr-d4)", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--mr-d1)" }}>{value}</div>
              </div>
            ))}
          </div>
        </main>

        {/* Sticky CTA */}
        <div className="mr-sticky-footer">
          {needsReview ? (
            <button
              className="mr-sticky-cta"
              type="button"
              style={{ background: "var(--mr-red)", color: "#fff", boxShadow: "0 4px 18px rgba(212,32,32,.25)" }}
              onClick={() => {
                const panel = document.querySelector(".mr-review-panel");
                panel?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
              Review &amp; Approve Protocol
            </button>
          ) : (
            <button
              className="mr-sticky-cta"
              type="button"
              style={{ background: "var(--mr-blue)", color: "#fff", boxShadow: "0 4px 18px rgba(59,130,200,.22)" }}
              onClick={() => { setShowMsgPanel(true); setShowObsPanel(false); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              Send Progress Note
            </button>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
