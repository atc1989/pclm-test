"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/hooks";
import { useLogout } from "@/lib/supabase/use-logout";

type ProtocolKey = "trial" | "start" | "grow" | "power";

type Patient = {
  id: number;
  name: string;
  age: number;
  sex: "F" | "M";
  protocol: ProtocolKey;
  score: number;
  baseline?: number;
  daysOn: number;
  symptoms: string;
  note: string;
  lab: string;
  scanDate: string;
  lastEvent: string;
  status: "review" | "improving" | "trial" | "inactive" | "steady";
};

type Request = {
  id: string;
  name: string;
  age: number;
  sex: "F" | "M";
  score: number;
  protocol: ProtocolKey;
  source: string;
  timeLeft: string;
};

type PortalView = "dashboard" | "detail" | "science" | "viber" | "redeem" | "confirm" | "receipt";
type DetailTab = "summary" | "history";
type RedeemMethod = "gcash" | "bank" | "clinic";

const protocols: Record<ProtocolKey, { name: string; days: number; credits: number; price: string }> = {
  trial: { name: "Trial", days: 5, credits: 450, price: "PHP 1,299" },
  start: { name: "Start", days: 15, credits: 1500, price: "PHP 4,599" },
  grow: { name: "Grow", days: 30, credits: 3500, price: "PHP 12,399" },
  power: { name: "Power", days: 90, credits: 7500, price: "PHP 34,999" },
};

const patients: Patient[] = [
  {
    id: 1,
    name: "Maria Santos",
    age: 47,
    sex: "F",
    protocol: "grow",
    score: 48,
    baseline: 82,
    daysOn: 42,
    symptoms: "Fatigue, Bloating, Low Energy",
    note: "Markers are trending well. Stay consistent with the current protocol.",
    lab: "Hi-Precision Diagnostics",
    scanDate: "Mar 20, 2026",
    lastEvent: "Uploaded 2nd scan - GLIS 82 to 48",
    status: "improving",
  },
  {
    id: 2,
    name: "Ricardo Dela Cruz",
    age: 55,
    sex: "M",
    protocol: "power",
    score: 78,
    daysOn: 8,
    symptoms: "Poor Sleep, Brain Fog",
    note: "High inflammatory pattern. Medical review required before next step.",
    lab: "MedLab GenSan",
    scanDate: "Mar 5, 2026",
    lastEvent: "New Power Protocol enrollment",
    status: "review",
  },
  {
    id: 3,
    name: "Lorna Ramos",
    age: 62,
    sex: "F",
    protocol: "power",
    score: 32,
    baseline: 64,
    daysOn: 60,
    symptoms: "Digestive discomfort",
    note: "Digestion improved, bowel regularity restored.",
    lab: "Hi-Precision Diagnostics",
    scanDate: "Mar 20, 2026",
    lastEvent: "Uploaded 3rd scan - GLIS 64 to 32",
    status: "improving",
  },
  {
    id: 4,
    name: "Andy Reyes",
    age: 38,
    sex: "M",
    protocol: "trial",
    score: 28,
    daysOn: 4,
    symptoms: "Low Energy",
    note: "Trial protocol is ending. Review continuation options.",
    lab: "Philippine Red Cross",
    scanDate: "Mar 20, 2026",
    lastEvent: "Trial Day 4 check-in received",
    status: "trial",
  },
  {
    id: 5,
    name: "Carmen Tan",
    age: 50,
    sex: "F",
    protocol: "grow",
    score: 55,
    daysOn: 22,
    symptoms: "Bloating, Poor Sleep",
    note: "Sleep improving. Follow-up scan window is approaching.",
    lab: "Hi-Precision Diagnostics",
    scanDate: "Mar 8, 2026",
    lastEvent: "Patient reports sleep improvement",
    status: "steady",
  },
  {
    id: 6,
    name: "Jose Garcia",
    age: 58,
    sex: "M",
    protocol: "start",
    score: 42,
    daysOn: 18,
    symptoms: "Fatigue, Brain Fog",
    note: "No check-in for 10 days. Send follow-up message.",
    lab: "LabCorp Philippines",
    scanDate: "Mar 10, 2026",
    lastEvent: "Inactive - no check-in for 10 days",
    status: "inactive",
  },
];

const redemptionMethods: Record<RedeemMethod, { name: string; description: string; processing: string; badge?: string }> = {
  gcash: { name: "GCash", description: "Instant transfer", processing: "Instant", badge: "Most used" },
  bank: { name: "Bank Transfer", description: "1-2 business days", processing: "1-2 days" },
  clinic: { name: "Clinic Supplies", description: "Applied to next order", processing: "Next order" },
};

const requests: Request[] = [
  {
    id: "req-1",
    name: "Rosa Santos",
    age: 52,
    sex: "F",
    score: 81,
    protocol: "grow",
    source: "Referred by Maria Santos",
    timeLeft: "21h left",
  },
  {
    id: "req-2",
    name: "Jun Dela Cruz",
    age: 44,
    sex: "M",
    score: 74,
    protocol: "grow",
    source: "Clinic QR Scan",
    timeLeft: "23h left",
  },
];

const dashboardStyles = `
:root{--doc-bg:#0c1017;--doc-s1:#111a26;--doc-blue:#3b82c8;--doc-lt:#f3f2ef;--doc-lt2:#e8e6e0;--doc-lt3:#ddd9d0;--doc-white:#fff;--doc-d1:#1a1a17;--doc-d2:#4a4840;--doc-d3:#7a7870;--doc-d4:#9a978f;--doc-green:#5cb882;--doc-gold:#d4a840;--doc-orange:#e8772e;--doc-red:#d42020;--doc-font:'Outfit',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.doctor-portal{min-height:100vh;min-height:100dvh;background:var(--doc-lt2);font-family:var(--doc-font);color:var(--doc-d1);padding-top:96px}
.doctor-portal.no-toast{padding-top:0}
.doctor-shell{width:100%;max-width:720px;min-height:100vh;min-height:100dvh;margin:0 auto;background:var(--doc-lt);box-shadow:0 0 70px rgba(0,0,0,.16)}
@keyframes earningsIn{from{opacity:0;transform:translateY(-18px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes earningsOut{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(-12px) scale(.98)}}
@keyframes earningsAmountPop{0%{opacity:0;transform:scale(1.28) translateY(-4px)}60%{opacity:1;transform:scale(.97) translateY(1px)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes earningsRing{0%,100%{opacity:.42;transform:scale(1)}50%{opacity:.78;transform:scale(1.1)}}
@keyframes portalIn{from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:translateX(0)}}
@keyframes heroFadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes amountSlam{0%{opacity:0;transform:scale(1.35) translateY(-8px)}60%{opacity:1;transform:scale(.97) translateY(2px)}80%{transform:scale(1.02)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes checkGrow{0%{transform:scale(0);opacity:0}62%{transform:scale(1.14);opacity:1}82%{transform:scale(.96)}100%{transform:scale(1);opacity:1}}
@keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(92,184,130,0)}50%{box-shadow:0 0 60px 20px rgba(92,184,130,.18)}}
@keyframes receiptIn{from{opacity:0;transform:scale(.94) translateY(14px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes confettiDrop{0%{opacity:1;transform:translateY(-40px) rotate(0deg) scale(1)}100%{opacity:0;transform:translateY(220px) rotate(720deg) scale(.35)}}
.earnings-toast{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;justify-content:center;padding:12px 18px;pointer-events:none}
.earnings-toast.is-entering .earnings-inner{animation:earningsIn .42s cubic-bezier(.34,1.56,.64,1) both}
.earnings-toast.is-leaving .earnings-inner{animation:earningsOut .36s cubic-bezier(.32,1,.68,1) both}
.earnings-inner{width:min(420px,calc(100vw - 32px));display:flex;align-items:center;gap:14px;padding:17px 18px;border-radius:20px;background:linear-gradient(160deg,#071a0f,#0b2a18);border:1px solid rgba(92,184,130,.22);box-shadow:0 14px 40px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.05);pointer-events:auto}
.earnings-icon{width:44px;height:44px;border-radius:14px;background:rgba(92,184,130,.15);display:flex;align-items:center;justify-content:center;color:var(--doc-green);position:relative;flex-shrink:0}
.earnings-icon:after{content:"";position:absolute;inset:-3px;border-radius:17px;border:1.5px solid rgba(92,184,130,.25);animation:earningsRing 1.8s ease-in-out infinite}
.earnings-kicker{font-size:12px;font-weight:900;letter-spacing:.1em;color:rgba(92,184,130,.72);text-transform:uppercase}
.earnings-amount{font-size:28px;font-weight:950;color:#fff;letter-spacing:-.04em;line-height:1.05;margin-top:2px;animation:earningsAmountPop .58s cubic-bezier(.34,1.4,.64,1) .12s both}
.earnings-sub{font-size:13px;color:rgba(255,255,255,.68);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.earnings-view{border:1px solid rgba(92,184,130,.28);background:rgba(92,184,130,.18);color:var(--doc-green);font:900 13px var(--doc-font);border-radius:11px;padding:9px 15px;white-space:nowrap}
.doctor-header{background:var(--doc-white);border-bottom:1px solid var(--doc-lt2)}
.doctor-nav{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:20px 24px 0}
.doctor-brand{display:flex;align-items:center;gap:11px;font-size:18px;font-weight:850;color:var(--doc-d1)}
.doctor-mark{width:32px;height:32px;border-radius:10px;background:var(--doc-blue);display:flex;align-items:center;justify-content:center;color:#fff}
.doctor-nav-actions{display:flex;align-items:center;gap:12px}
.icon-btn{width:42px;height:42px;border-radius:12px;border:1px solid rgba(0,0,0,.08);background:rgba(0,0,0,.03);display:flex;align-items:center;justify-content:center;color:var(--doc-d3)}
.bell-wrap{position:relative}
.bell-dot{position:absolute;top:6px;right:6px;width:8px;height:8px;border-radius:50%;background:var(--doc-red);border:2px solid var(--doc-white)}
.notif-panel{position:absolute;right:0;top:46px;width:min(326px,calc(100vw - 32px));background:var(--doc-white);border:1px solid var(--doc-lt2);border-radius:16px;box-shadow:0 16px 44px rgba(0,0,0,.14);z-index:5;overflow:hidden}
.notif-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--doc-lt2);font-size:14px;font-weight:800}
.notif-row{display:flex;gap:10px;padding:13px 16px;border-bottom:1px solid var(--doc-lt2)}
.notif-row:last-child{border-bottom:0}
.notif-icon{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.notif-title{font-size:14px;font-weight:750;color:var(--doc-d1);line-height:1.35}
.notif-sub{font-size:12px;color:var(--doc-d4);margin-top:2px}
.doctor-name{font-size:16px;font-weight:850;color:var(--doc-d2);white-space:nowrap}
.signout-btn{border:0;background:transparent;color:var(--doc-d4);font-weight:850;font-size:14px;padding:8px 0}
.hero-row{display:flex;justify-content:space-between;gap:18px;padding:clamp(18px,4vw,26px) 24px 0}
.eyebrow{font-size:12px;font-weight:850;letter-spacing:.12em;color:var(--doc-d4);text-transform:uppercase}
.hero-count{display:flex;align-items:baseline;gap:9px;margin-top:4px}
.hero-count strong{font-size:54px;font-weight:950;letter-spacing:-.05em;line-height:1}
.hero-count span,.hero-sub{font-size:15px;color:var(--doc-d3)}
.hero-sub.review{color:var(--doc-red);font-weight:700}
.credits{text-align:right}
.credits strong{display:block;margin-top:4px;font-size:25px;color:var(--doc-blue);letter-spacing:-.02em}
.link-btn{border:0;background:transparent;color:var(--doc-blue);font-weight:850;font-size:13px;padding:0;min-height:auto}
.urgent-pad{padding:0 24px;margin-top:16px;width:100%}
.urgent-banner{display:flex;align-items:center;gap:14px;width:100%;min-width:0;padding:14px 16px;background:rgba(212,32,32,.06);border:1.5px solid rgba(212,32,32,.18);border-radius:16px;text-align:left;cursor:pointer;transition:background .15s,border-color .15s,transform .12s,box-shadow .12s;-webkit-tap-highlight-color:transparent}
.urgent-banner:hover{background:rgba(212,32,32,.10);border-color:rgba(212,32,32,.30);box-shadow:0 4px 16px rgba(212,32,32,.10)}
.urgent-banner:active{transform:scale(.98);box-shadow:0 2px 6px rgba(212,32,32,.08)}
.urgent-icon{width:40px;height:40px;border-radius:12px;background:rgba(212,32,32,.1);display:flex;align-items:center;justify-content:center;color:var(--doc-red);flex-shrink:0}
.urgent-copy{flex:1;min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:2px}
.urgent-title{display:block;width:100%;font-size:17px;font-weight:850;color:var(--doc-red);line-height:1.25;white-space:normal;overflow-wrap:anywhere}
.urgent-sub{display:block;width:100%;font-size:14px;color:var(--doc-d3);line-height:1.3;white-space:normal;overflow-wrap:anywhere}
.urgent-banner>svg{flex-shrink:0}
.stat-strip{display:flex;gap:10px;padding:clamp(14px,3.5vw,18px) 24px clamp(18px,4vw,24px)}
.stat-pill{flex:1;text-align:center;border-radius:16px;padding:15px 10px}
.stat-pill strong{display:block;font-size:25px;font-weight:900;letter-spacing:-.02em}
.stat-pill span{display:block;margin-top:4px;font-size:11px;font-weight:850;letter-spacing:.08em;text-transform:uppercase}
.stat-green{background:rgba(92,184,130,.08);border:1px solid rgba(92,184,130,.18);color:var(--doc-green)}
.stat-red{background:rgba(212,32,32,.06);border:1px solid rgba(212,32,32,.18);color:var(--doc-red)}
.stat-blue{background:rgba(59,130,200,.07);border:1px solid rgba(59,130,200,.18);color:var(--doc-blue)}
.content-card{background:var(--doc-lt);border-radius:22px 22px 0 0;margin-top:-2px;padding:clamp(22px,5vw,36px) clamp(22px,5vw,32px) 32px}
.section-label{font-size:14px;font-weight:850;letter-spacing:.1em;color:var(--doc-d4);text-transform:uppercase;margin-bottom:12px}
.queue-list{margin-bottom:16px}
.queue-item{display:flex;align-items:center;gap:14px;padding:14px 15px;background:var(--doc-white);border:1px solid rgba(0,0,0,.05);border-radius:14px;margin-bottom:9px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
.queue-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.queue-name{display:block;font-size:17px;font-weight:850;color:var(--doc-d1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.queue-sub{display:block;font-size:14px;color:var(--doc-d3);margin-top:2px}
.queue-badge{font-size:13px;font-weight:850;border-radius:999px;padding:6px 9px;white-space:nowrap}
.today-card{display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:14px;background:rgba(92,184,130,.04);border:1px solid rgba(92,184,130,.1);margin-bottom:16px}
.today-card strong{color:var(--doc-green)}
.search-wrap{position:relative;margin-bottom:14px}
.search-wrap svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:rgba(0,0,0,.3)}
.search-wrap input{width:100%;padding:15px 16px 15px 42px;border:1.5px solid var(--doc-lt2);border-radius:14px;background:var(--doc-white);font:650 17px var(--doc-font);color:var(--doc-d1);outline:0}
.search-wrap input:focus{border-color:rgba(59,130,200,.45);box-shadow:0 0 0 3px rgba(59,130,200,.1)}
.request-card{background:linear-gradient(160deg,rgba(59,130,200,.04),var(--doc-white) 62%);border-left:3px solid var(--doc-blue);border-radius:16px;box-shadow:0 1px 5px rgba(0,0,0,.07);padding:17px;margin-bottom:10px}
.request-top,.patient-top{display:flex;align-items:center;gap:13px}
.request-body,.patient-body{flex:1;min-width:0}
.request-title,.patient-name{display:flex;align-items:center;justify-content:space-between;gap:8px}
.request-title strong,.patient-name strong{font-size:17px;color:var(--doc-d1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.request-meta,.patient-meta{font-size:15px;color:var(--doc-d3);margin-top:3px}
.request-actions{display:flex;gap:8px;margin-top:12px}
.primary-small,.secondary-small{flex:1;min-height:48px;border-radius:12px;font-weight:850;font-size:15px}
.primary-small{border:0;background:var(--doc-green);color:#fff}
.secondary-small{border:1px solid var(--doc-lt3);background:transparent;color:var(--doc-d3)}
.patient-card{background:var(--doc-white);border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);overflow:hidden;margin-bottom:10px;border:0;text-align:left;width:100%;font-family:var(--doc-font);color:inherit}
.patient-card:active{transform:scale(.99)}
.patient-main{padding:16px 17px 13px}
.badge{font-size:12px;font-weight:850;border-radius:9px;padding:3px 8px;white-space:nowrap}
.bar{height:2px;background:var(--doc-lt2);border-radius:2px;overflow:hidden;margin-top:10px}
.bar span{display:block;height:100%;border-radius:2px}
.patient-action{padding:0 17px 13px}
.patient-action span{display:block;width:100%;padding:10px 13px;border-radius:12px;border:1px solid currentColor;font-size:15px;font-weight:850;background:transparent}
.doc-ring{position:relative;width:50px;height:50px;flex-shrink:0;border-radius:50%;background:conic-gradient(from 180deg,#5cb882 0deg,#d4a840 150deg,#e8772e 250deg,#d42020 var(--angle),rgba(0,0,0,.06) var(--angle))}
.doc-ring::after{content:"";position:absolute;inset:5px;border-radius:50%;background:var(--doc-white)}
.doc-ring b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:1;font-size:14px;font-weight:900}
.utilities{display:flex;align-items:center;justify-content:center;gap:18px;margin:20px 0;padding:12px 0;border-top:1px solid var(--doc-lt2);flex-wrap:wrap}
.utility-btn{border:0;background:transparent;color:var(--doc-d3);font-size:15px;font-weight:850;display:flex;align-items:center;gap:6px}
.detail-panel{background:var(--doc-white);border:1px solid var(--doc-lt2);border-radius:18px;padding:22px;margin:18px 0}
.detail-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:14px}
.detail-head h2{font-size:24px;margin:0 0 3px;font-weight:900;letter-spacing:-.02em}
.detail-head p,.detail-note{font-size:16px;color:var(--doc-d3);line-height:1.55;margin:0}
.detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:14px}
.detail-cell{border-radius:14px;background:var(--doc-lt);padding:12px 14px}
.detail-cell span{display:block;font-size:12px;font-weight:850;color:var(--doc-d4);letter-spacing:.08em;text-transform:uppercase}
.detail-cell strong{display:block;margin-top:4px;font-size:16px;color:var(--doc-d1)}
.footer-note{text-align:center;font-size:11px;color:var(--doc-d4);line-height:1.7;letter-spacing:.02em;padding:4px 0 16px}
.empty{text-align:center;background:var(--doc-white);border-radius:16px;padding:28px 18px;color:var(--doc-d3)}
.redeem-screen{min-height:100vh;min-height:100dvh;background:var(--doc-lt);animation:portalIn .24s cubic-bezier(.32,1,.68,1) both}
.redeem-hero{background:linear-gradient(180deg,var(--doc-bg),var(--doc-s1));padding:clamp(18px,4.5vw,28px) 24px 32px;color:#fff}
.redeem-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px}
.redeem-back{border:0;background:transparent;color:rgba(255,255,255,.62);font:800 16px var(--doc-font);padding:8px 0}
.redeem-title{font-size:17px;font-weight:850}
.redeem-balance{text-align:center;animation:heroFadeUp .42s cubic-bezier(.32,1,.68,1) .04s both}
.redeem-balance-label{font-size:13px;font-weight:850;letter-spacing:.1em;color:rgba(255,255,255,.55);text-transform:uppercase}
.redeem-peso{font-size:48px;font-weight:950;letter-spacing:-.04em;line-height:1;margin-top:10px;color:#fff;animation:amountSlam .55s cubic-bezier(.34,1.4,.64,1) .08s both}
.redeem-credit-pill{display:inline-flex;align-items:center;gap:6px;margin-top:12px;padding:6px 15px;border-radius:20px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07);font-size:14px;color:rgba(255,255,255,.68)}
.redeem-stat-strip{display:flex;margin-top:22px;padding-top:18px;border-top:1px solid rgba(255,255,255,.06)}
.redeem-stat{flex:1;text-align:center;animation:heroFadeUp .42s cubic-bezier(.32,1,.68,1) both}
.redeem-stat:nth-child(1){animation-delay:.12s}.redeem-stat:nth-child(3){animation-delay:.18s}.redeem-stat:nth-child(5){animation-delay:.24s}
.redeem-stat strong{display:block;font-size:18px;font-weight:900;color:rgba(255,255,255,.76)}
.redeem-stat span{display:block;margin-top:4px;font-size:11px;font-weight:850;letter-spacing:.08em;color:rgba(255,255,255,.72);text-transform:uppercase}
.redeem-divider{width:1px;background:rgba(255,255,255,.07)}
.redeem-body{padding:clamp(18px,4.5vw,28px) 24px 36px}
.redeem-card{background:var(--doc-white);border:1px solid var(--doc-lt2);border-radius:18px;box-shadow:0 1px 3px rgba(0,0,0,.04);overflow:hidden}
.rank-card{padding:16px 18px;margin-bottom:22px}
.rank-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}
.rank-top strong{font-size:15px;color:var(--doc-d1)}
.rank-top span{font-size:13px;color:var(--doc-d3)}
.rank-bar{height:4px;border-radius:999px;background:var(--doc-lt2);overflow:hidden}
.rank-bar span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--doc-blue),#5ca8e8);transition:width 1.1s cubic-bezier(.34,1,.64,1)}
.rank-next{font-size:13px;color:var(--doc-d4);margin-top:7px}
.redeem-label{font-size:13px;font-weight:850;letter-spacing:.1em;color:var(--doc-d4);text-transform:uppercase;margin:20px 0 12px}
.method-card{display:flex;align-items:center;gap:16px;width:100%;padding:18px 20px;background:var(--doc-white);border:1.5px solid var(--doc-lt2);border-radius:16px;margin-bottom:9px;text-align:left;transition:transform .14s cubic-bezier(.34,1.56,.64,1),background .15s,border-color .15s}
.method-card:active,.quick-amounts button:active,.redeem-submit:active,.confirm-submit:active,.receipt-done:active{transform:scale(.97)}
.method-card.on{border-color:var(--doc-blue);background:rgba(59,130,200,.025)}
.method-icon{width:42px;height:42px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-weight:950;flex-shrink:0}
.method-text{flex:1;min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:3px}
.method-title{display:flex;align-items:center;gap:5px;font-size:17px;font-weight:850;color:var(--doc-d1);line-height:1.2}
.method-badge{font-size:12px;font-weight:850;color:var(--doc-blue);background:rgba(59,130,200,.08);padding:2px 7px;border-radius:8px;margin-left:5px}
.method-sub{display:block;font-size:14px;color:var(--doc-d3);line-height:1.3}
.method-radio{width:24px;height:24px;border-radius:50%;border:2.5px solid var(--doc-lt3);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.method-card.on .method-radio{border-color:var(--doc-blue)}
.method-radio span{width:12px;height:12px;border-radius:50%;background:var(--doc-blue);transform:scale(0);transition:transform .16s}
.method-card.on .method-radio span{transform:scale(1)}
.amount-row{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px}
.amount-row span{font-size:13px;color:var(--doc-d4)}
.amount-input-wrap{position:relative;margin-bottom:10px}
.peso-prefix{position:absolute;left:18px;top:50%;transform:translateY(-50%);width:54px;font-size:20px;font-weight:900;color:var(--doc-d3);pointer-events:none;line-height:1}
.amount-input{width:100%;padding:17px 18px 17px 82px;border:2px solid var(--doc-lt3);border-radius:16px;background:var(--doc-white);font:950 24px var(--doc-font);color:var(--doc-d1);outline:0}
.amount-input:focus{border-color:var(--doc-blue);box-shadow:0 0 0 3px rgba(59,130,200,.1)}
.amount-input.invalid{border-color:var(--doc-red)}
.balance-preview{height:24px;text-align:right;font-size:13px;color:var(--doc-d4);font-weight:750}
.quick-amounts{display:flex;gap:8px;margin-bottom:22px}
.quick-amounts button{flex:1;min-height:46px;border-radius:14px;border:1.5px solid var(--doc-lt3);background:var(--doc-white);font:850 15px var(--doc-font);color:var(--doc-d2);transition:transform .12s,border-color .15s,background .15s,color .15s}
.quick-amounts button.on{border-color:var(--doc-blue);background:rgba(59,130,200,.05);color:var(--doc-blue)}
.redeem-submit{width:100%;min-height:58px;border:0;border-radius:16px;background:var(--doc-blue);color:#fff;font:850 17px var(--doc-font);box-shadow:0 4px 20px rgba(59,130,200,.25)}
.redeem-list{background:var(--doc-white);border-radius:18px;overflow:hidden;border:1px solid var(--doc-lt2);animation:receiptIn .36s cubic-bezier(.32,1,.68,1) both}
.earning-row,.history-row,.schedule-row{display:flex;align-items:center;gap:14px;padding:16px 18px;border-bottom:1px solid var(--doc-lt2)}
.earning-row:last-child,.history-row:last-child,.schedule-row:last-child{border-bottom:0}
.row-main{flex:1;min-width:0}
.row-main strong{display:block;font-size:16px;color:var(--doc-d1)}
.row-main span{display:block;font-size:13px;color:var(--doc-d3);margin-top:3px}
.row-amount{text-align:right;font-size:17px;font-weight:950;color:var(--doc-green)}
.row-amount span{display:block;font-size:12px;color:var(--doc-d4);font-weight:800;margin-top:2px}
.status-badge{display:inline-block;font-size:12px;font-weight:850;color:var(--doc-green);background:rgba(92,184,130,.1);padding:3px 8px;border-radius:8px;margin-top:4px}
.confirm-card{margin-bottom:18px;animation:receiptIn .38s cubic-bezier(.32,1,.68,1) .08s both}
.confirm-row{display:flex;justify-content:space-between;gap:14px;padding:17px 20px;border-bottom:1px solid var(--doc-lt2)}
.confirm-row:last-child{border-bottom:0}
.confirm-row span{font-size:15px;color:var(--doc-d4)}
.confirm-row strong{font-size:15px;color:var(--doc-d1);text-align:right}
.confirm-submit{width:100%;min-height:58px;border:0;border-radius:16px;background:var(--doc-green);color:#fff;font:850 17px var(--doc-font);box-shadow:0 4px 20px rgba(92,184,130,.25)}
.cancel-btn{width:100%;min-height:50px;border:0;border-radius:16px;background:transparent;color:var(--doc-d3);font:850 15px var(--doc-font);margin-top:8px}
.receipt-screen{min-height:100vh;min-height:100dvh;background:linear-gradient(180deg,#071a0f,#0b2a18,#0f1f14);color:#fff;overflow:hidden;position:relative;animation:portalIn .24s cubic-bezier(.32,1,.68,1) both}
.receipt-hero{padding:62px 32px 36px;text-align:center;position:relative;z-index:1}
.receipt-check{width:82px;height:82px;border-radius:50%;background:rgba(92,184,130,.15);border:2px solid rgba(92,184,130,.35);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;color:var(--doc-green);animation:checkGrow .5s cubic-bezier(.34,1.56,.64,1) .1s both,glowPulse 2s ease-in-out .45s 3}
.receipt-kicker{font-size:15px;font-weight:850;letter-spacing:.12em;color:rgba(92,184,130,.68);text-transform:uppercase;margin-bottom:10px}
.receipt-amount{font-size:48px;font-weight:950;letter-spacing:-.04em;line-height:1;animation:amountSlam .56s cubic-bezier(.34,1.4,.64,1) .15s both}
.receipt-sub{font-size:15px;color:rgba(255,255,255,.62);margin-top:10px}
.receipt-body{padding:0 20px 34px;position:relative;z-index:1;animation:receiptIn .5s cubic-bezier(.32,1,.68,1) .28s both}
.receipt-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:22px;overflow:hidden;backdrop-filter:blur(8px)}
.receipt-row{display:flex;justify-content:space-between;gap:16px;padding:18px 22px;border-bottom:1px solid rgba(255,255,255,.06)}
.receipt-row:last-child{border-bottom:0}
.receipt-row span{font-size:14px;color:rgba(255,255,255,.68)}
.receipt-row strong{font-size:14px;color:rgba(255,255,255,.78);text-align:right}
.receipt-note{display:flex;align-items:center;gap:12px;margin-top:12px;padding:14px 18px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:16px;font-size:13px;color:rgba(255,255,255,.62);line-height:1.45}
.receipt-done{width:100%;min-height:56px;border-radius:16px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.08);color:#fff;font:850 16px var(--doc-font);margin-top:12px}
.confetti-piece{position:absolute;top:0;width:8px;height:12px;border-radius:2px;opacity:0;animation:confettiDrop 1.55s cubic-bezier(.2,.8,.2,1) forwards;z-index:0}
@media(prefers-reduced-motion:reduce){.earnings-toast.is-entering .earnings-inner,.earnings-toast.is-leaving .earnings-inner,.earnings-amount,.earnings-icon:after,.redeem-screen,.redeem-balance,.redeem-peso,.redeem-stat,.redeem-list,.confirm-card,.receipt-screen,.receipt-check,.receipt-amount,.receipt-body,.confetti-piece{animation:none}}
@media(max-width:520px){.doctor-portal{padding-top:92px}.doctor-portal.no-toast{padding-top:0}.doctor-name{display:none}.doctor-shell{box-shadow:none}.hero-count strong{font-size:48px}.utilities{gap:10px;justify-content:space-between}.utility-btn{font-size:14px}.detail-grid{grid-template-columns:1fr}.earnings-inner{padding:14px 15px}.earnings-amount{font-size:24px}.earnings-sub{font-size:12px}.earnings-view{padding:8px 12px}.redeem-peso,.receipt-amount{font-size:42px}.quick-amounts{flex-wrap:wrap}.quick-amounts button{min-width:31%}}
/* ── Patient Detail Screen ── */
.detail-screen{background:var(--doc-lt);min-height:100vh;min-height:100dvh}
.detail-sticky-nav{position:sticky;top:0;z-index:10;background:rgba(243,242,239,.97);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
.detail-nav-row{padding:16px 24px;display:flex;align-items:center;justify-content:space-between}
.detail-score-strip{padding:2px 24px 8px;font-size:14px;color:var(--doc-d3)}
.detail-tab-bar{display:flex;padding:0 24px;gap:0;border-bottom:1.5px solid var(--doc-lt2)}
.detail-tab{flex:1;padding:12px 0;border:none;background:none;font-size:16px;font-weight:850;color:var(--doc-d4);border-bottom:2.5px solid transparent;font-family:var(--doc-font);cursor:pointer;transition:color .15s,border-color .15s}
.detail-tab.on{color:var(--doc-blue);border-bottom-color:var(--doc-blue)}
.detail-tab-body{padding:16px 24px 100px}
.detail-sticky-action{position:fixed;bottom:0;left:0;right:0;z-index:20;background:rgba(243,242,239,.97);border-top:1px solid var(--doc-lt2);padding:12px 24px calc(12px + env(safe-area-inset-bottom,0px)) 24px;max-width:720px;margin:0 auto}
.history-event{display:flex;gap:14px;padding:14px 0;border-bottom:1px solid var(--doc-lt2)}
.history-event:last-child{border-bottom:0}
.history-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:5px}
/* ── Science Screen ── */
.science-screen{background:var(--doc-lt);min-height:100vh;min-height:100dvh;display:flex;flex-direction:column}
.science-dark-zone{background:var(--doc-bg);padding:clamp(16px,5vw,28px) 24px 32px}
.science-section-label{font-size:11px;font-weight:850;letter-spacing:.14em;text-transform:uppercase;margin-bottom:20px}
.science-card{border-radius:20px;overflow:hidden;margin-bottom:10px}
.science-card-header{padding:16px 22px;display:flex;align-items:center;gap:10px}
.science-card-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.science-card-tag{font-size:12px;font-weight:850;letter-spacing:.12em;text-transform:uppercase;flex:1}
.science-card-version{font-size:11px;font-weight:600;color:rgba(255,255,255,.55);letter-spacing:.04em}
.science-card-body{padding:clamp(12px,4vw,20px) 22px}
.science-card-title{font-size:18px;font-weight:700;color:#fff;letter-spacing:-.02em;line-height:1.2;margin-bottom:12px}
.science-card-desc{font-size:14px;color:rgba(255,255,255,.75);line-height:1.75;margin-bottom:14px}
.science-blockquote{padding:16px 18px;background:rgba(0,0,0,.20);border-radius:0 14px 14px 0;margin-bottom:14px}
.science-blockquote-title{font-size:15px;font-weight:700;color:rgba(255,255,255,.80);line-height:1.5;margin-bottom:6px}
.science-blockquote-desc{font-size:13px;color:rgba(255,255,255,.68);line-height:1.6}
.science-legal{display:flex;align-items:flex-start;gap:8px;padding:12px 14px;background:rgba(255,255,255,.04);border-radius:10px;border:1px solid rgba(255,255,255,.06)}
.science-legal-text{font-size:13px;font-weight:500;color:rgba(255,255,255,.62);line-height:1.55}
.science-connector{display:flex;justify-content:center;padding:6px 0}
.science-body{padding:clamp(12px,4vw,20px) 20px 40px;flex:1}
.science-body-label{font-size:11px;font-weight:850;letter-spacing:.14em;color:var(--doc-d4);text-transform:uppercase;margin:20px 0 12px;padding:0 4px}
.science-body-label:first-child{margin-top:0}
.science-white-card{background:var(--doc-white);border-radius:16px;padding:22px;margin-bottom:12px;border:1px solid var(--doc-lt2)}
.science-white-head{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.science-icon{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.science-card-h{font-size:16px;font-weight:700;color:var(--doc-d1)}
.science-card-subh{font-size:13px;color:var(--doc-d3)}
.science-domain-box{padding:14px 16px;border-radius:12px;margin-bottom:10px}
.science-domain-box:last-child{margin-bottom:0}
.science-domain-label{font-size:13px;font-weight:850;letter-spacing:.06em;margin-bottom:10px}
.science-pill-row{display:flex;gap:4px;margin-bottom:10px;flex-wrap:wrap}
.science-pill{padding:3px 8px;border-radius:8px;background:var(--doc-lt);font-size:12px;color:var(--doc-d3)}
.science-formula{font-size:13px;color:var(--doc-d4);font-family:monospace}
.science-score-band{padding:7px 14px;border-radius:8px;font-size:14px;font-weight:850;display:inline-block}
.science-tier-row{padding:11px 0;border-bottom:1px solid var(--doc-lt2)}
.science-tier-row:last-child{border-bottom:0}
.science-red-flags{padding:14px 16px;border-radius:12px;background:rgba(212,32,32,.04);border:1px solid rgba(212,32,32,.08)}
.science-shield-note{display:flex;align-items:center;gap:10px;padding:14px 16px;background:var(--doc-bg);border-radius:12px}
.science-step-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--doc-lt2)}
.science-step-row:last-child{border-bottom:0}
.science-step-num{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px;font-weight:900}
.science-ref-anchor{padding:18px 20px;background:rgba(59,130,200,.03);border-bottom:2px solid var(--doc-blue)}
.science-ref-row{padding:14px 20px;border-bottom:1px solid var(--doc-lt2)}
.science-ref-row:last-child{border-bottom:0}
.science-rules{background:var(--doc-white);border-radius:16px;padding:22px;margin-bottom:12px;border:1px solid var(--doc-lt2)}
.science-rule-label{font-size:12px;font-weight:850;letter-spacing:.06em;margin-bottom:6px}
.science-rule-text{font-size:14px;color:var(--doc-d2);line-height:1.75;margin-bottom:14px}
.science-rule-text:last-child{margin-bottom:0}
/* ── Viber Screen ── */
.viber-screen{background:var(--doc-lt);min-height:100vh;min-height:100dvh}
.viber-step-num{width:32px;height:32px;border-radius:50%;background:var(--doc-blue);color:#fff;font:900 14px var(--doc-font);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.viber-code-block{background:var(--doc-bg);border-radius:14px;padding:18px 22px;text-align:center;margin:12px 0;font:900 20px/1 var(--doc-font);color:var(--doc-blue);letter-spacing:.08em;border:1px solid rgba(59,130,200,.15)}
.viber-msg-preview{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:flex-start;gap:10px}
.viber-verified{background:rgba(92,184,130,.08);border:1px solid rgba(92,184,130,.20);border-radius:16px;padding:clamp(12px,4vw,20px);display:flex;align-items:center;gap:14px}
.viber-channel-card{background:rgba(59,130,200,.04);border:1px solid rgba(59,130,200,.10);border-radius:16px;padding:18px 20px;margin-bottom:14px}
/* ── Request card decline ── */
@keyframes declineSlide{from{opacity:0;max-height:0}to{opacity:1;max-height:200px}}
.decline-reasons{overflow:hidden;animation:declineSlide .22s ease both}
.reason-chip{padding:7px 13px;border-radius:10px;border:1.5px solid var(--doc-lt3);background:var(--doc-white);color:var(--doc-d3);font-size:13px;font-weight:750;cursor:pointer;font-family:var(--doc-font);transition:all .15s;display:inline-block;margin:0 5px 5px 0}
.reason-chip.on{border-color:var(--doc-red);background:rgba(212,32,32,.05);color:var(--doc-red)}
.req-accept-btn{width:100%;min-height:52px;border-radius:14px;border:none;font-size:16px;font-weight:850;font-family:var(--doc-font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:transform .1s,box-shadow .1s;background:linear-gradient(135deg,var(--doc-green),#3fa861);color:#fff;box-shadow:0 4px 18px rgba(92,184,130,.32)}
.req-accept-btn:active{transform:scale(.97)}
.req-decline-text{background:none;border:none;font-size:13px;font-weight:700;color:var(--doc-d4);font-family:var(--doc-font);cursor:pointer;padding:4px 0;transition:color .15s}
.req-decline-text:hover{color:var(--doc-red)}
`;

export function DoctorDashboardContent() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { logout } = useLogout();
  const [query, setQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(patients[0]?.id ?? null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEarningsToast, setShowEarningsToast] = useState(true);
  const [isEarningsLeaving, setIsEarningsLeaving] = useState(false);
  const [animatedEarnings, setAnimatedEarnings] = useState(0);
  const [portalView, setPortalView] = useState<PortalView>("dashboard");
  const [detailTab, setDetailTab] = useState<DetailTab>("summary");
  const [viberConnected, setViberConnected] = useState(false);
  const [redeemMethod, setRedeemMethod] = useState<RedeemMethod>("gcash");
  const [redeemAmount, setRedeemAmount] = useState(5000);
  const [receiptReference, setReceiptReference] = useState("GG-284731");

  const doctorName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Doctor";
  const displayName = doctorName === "Doctor" ? "Doctor" : `Dr. ${doctorName}`;
  const reviewPatients = patients.filter((patient) => patient.status === "review");
  const improvingPatients = patients.filter((patient) => patient.baseline && patient.baseline > patient.score);
  const totalCredits = patients.reduce((sum, patient) => sum + protocols[patient.protocol].credits, 0);
  const redeemedCredits = 15000;
  const availableCredits = Math.max(0, totalCredits - redeemedCredits);
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? patients[0];
  const latestEarnings = protocols.grow.credits;
  const confirmedAmount = Math.min(Math.max(redeemAmount, 0), availableCredits);

  useEffect(() => {
    let frameId = 0;
    const startedAt = performance.now();
    const duration = 1150;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedEarnings(Math.round(latestEarnings * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [latestEarnings]);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => {
      setIsEarningsLeaving(true);
    }, 4600);
    const removeTimer = window.setTimeout(() => {
      setShowEarningsToast(false);
    }, 5000);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [portalView]);

  const openRedeem = () => {
    setRedeemAmount(Math.min(5000, availableCredits));
    setPortalView("redeem");
  };

  const openDetail = (id: number) => {
    const patient = patients.find((p) => p.id === id);
    if (patient?.status === "review") {
      router.push(`/doctor/medicalreview?id=${id}`);
      return;
    }
    setSelectedPatientId(id);
    setDetailTab("summary");
    setPortalView("detail");
  };

  const reviewRedeem = () => {
    if (redeemAmount < 5000 || redeemAmount > availableCredits) {
      return;
    }

    setPortalView("confirm");
  };

  const confirmRedeem = () => {
    setReceiptReference(`GG-${Math.floor(100000 + Math.random() * 900000)}`);
    setPortalView("receipt");
  };

  const filteredPatients = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return patients;
    }

    return patients.filter((patient) =>
      [patient.name, patient.symptoms, protocols[patient.protocol].name, patient.lab]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [query]);

  if (loading) {
    return (
      <div className="doctor-portal">
        <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />
        <div className="doctor-shell">
          <div className="empty">Loading doctor portal...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={portalView === "dashboard" ? "doctor-portal" : "doctor-portal no-toast"}>
      <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />
      {portalView === "dashboard" && showEarningsToast ? (
        <div
          className={`earnings-toast ${isEarningsLeaving ? "is-leaving" : "is-entering"}`}
          role="status"
          aria-live="polite"
        >
          <div className="earnings-inner">
            <div className="earnings-icon">
              <ShieldIcon size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="earnings-kicker">Protocol Earnings</div>
              <div className="earnings-amount">+PHP {formatNumber(animatedEarnings)}</div>
              <div className="earnings-sub">Maria Santos - Grow - PHP {formatNumber(totalCredits)} available</div>
            </div>
            <button className="earnings-view" type="button" onClick={openRedeem}>View</button>
          </div>
        </div>
      ) : null}
      <div className="doctor-shell">
        {portalView === "redeem" ? (
          <RedeemPage
            amount={redeemAmount}
            availableCredits={availableCredits}
            method={redeemMethod}
            onAmountChange={setRedeemAmount}
            onBack={() => setPortalView("dashboard")}
            onMethodChange={setRedeemMethod}
            onReview={reviewRedeem}
            patients={patients}
            redeemedCredits={redeemedCredits}
            totalCredits={totalCredits}
          />
        ) : null}

        {portalView === "confirm" ? (
          <RedeemConfirmPage
            amount={confirmedAmount}
            availableCredits={availableCredits}
            method={redeemMethod}
            onBack={() => setPortalView("redeem")}
            onConfirm={confirmRedeem}
          />
        ) : null}

        {portalView === "receipt" ? (
          <RedeemReceiptPage
            amount={confirmedAmount}
            availableCredits={availableCredits}
            method={redeemMethod}
            onDone={() => setPortalView("dashboard")}
            reference={receiptReference}
          />
        ) : null}

        {portalView === "detail" && selectedPatient ? (
          <PatientDetailScreen
            patient={selectedPatient}
            email={user?.email ?? profile?.email ?? ""}
            tab={detailTab}
            onTabChange={setDetailTab}
            onBack={() => setPortalView("dashboard")}
          />
        ) : null}

        {portalView === "science" ? (
          <SciencePage onBack={() => setPortalView("dashboard")} />
        ) : null}

        {portalView === "viber" ? (
          <ViberPage
            connected={viberConnected}
            onConnect={() => setViberConnected(true)}
            onBack={() => setPortalView("dashboard")}
          />
        ) : null}

        {portalView === "dashboard" ? (
        <>
        <header className="doctor-header">
          <div className="doctor-nav">
            <div className="doctor-brand">
              <span className="doctor-mark"><ShieldIcon size={14} /></span>
              <span>GutGuard</span>
            </div>
            <div className="doctor-nav-actions">
              <div className="bell-wrap">
                <button className="icon-btn" type="button" aria-label="Notifications" onClick={() => setShowNotifications((value) => !value)}>
                  <BellIcon />
                </button>
                <span className="bell-dot" />
                {showNotifications ? (
                  <div className="notif-panel">
                    <div className="notif-head">
                      <span>Notifications</span>
                      <button className="link-btn" type="button" onClick={() => setShowNotifications(false)}>Mark read</button>
                    </div>
                    <NotificationRow tone="blue" title="Rosa Santos requested review" sub="GLIS 81 - Grow Protocol" />
                    <NotificationRow tone="red" title="Ricardo needs medical review" sub="High GLIS score - Power Protocol" />
                    <NotificationRow tone="green" title="Maria uploaded follow-up scan" sub="GLIS improved 82 to 48" />
                  </div>
                ) : null}
              </div>
              <div className="doctor-name">{displayName}</div>
              <button className="signout-btn" type="button" onClick={logout}>Sign Out</button>
            </div>
          </div>

          <div className="hero-row">
            <div>
              <div className="eyebrow">Active Patients</div>
              <div className="hero-count">
                <strong>{patients.length}</strong>
                <span>patients</span>
              </div>
              <div className={reviewPatients.length ? "hero-sub review" : "hero-sub"}>
                {reviewPatients.length
                  ? `${reviewPatients.length} patient needs review - ${requests.length} new requests`
                  : "All patients on track"}
              </div>
            </div>
            <div className="credits">
              <div className="eyebrow">Credits</div>
              <strong>{formatNumber(totalCredits)}</strong>
              <button className="link-btn" type="button" onClick={openRedeem}>Redeem &gt;</button>
            </div>
          </div>

          {reviewPatients.length ? (
            <div className="urgent-pad">
              <button className="urgent-banner" type="button" onClick={() => router.push(`/doctor/medicalreview?id=${reviewPatients[0].id}`)}>
                <span className="urgent-icon"><AlertIcon /></span>
                <span className="urgent-copy">
                  <span className="urgent-title">{reviewPatients.length} patient{reviewPatients.length > 1 ? "s" : ""} need{reviewPatients.length === 1 ? "s" : ""} medical review</span>
                  <span className="urgent-sub">{reviewPatients.map((patient) => patient.name.split(" ")[0]).join(", ")}</span>
                </span>
                <ChevronIcon />
              </button>
            </div>
          ) : null}

          <div className="stat-strip">
            <div className="stat-pill stat-green">
              <strong>{improvingPatients.length}</strong>
              <span>Improving</span>
            </div>
            <div className="stat-pill stat-red">
              <strong>{reviewPatients.length}</strong>
              <span>Review</span>
            </div>
            <div className="stat-pill stat-blue">
              <strong>{requests.length}</strong>
              <span>Requests</span>
            </div>
          </div>
        </header>

        <main className="content-card">
          <section className="queue-list" aria-labelledby="today-heading">
            <div className="section-label" id="today-heading">Today</div>
            {requests.map((request) => (
              <QueueItem
                key={request.id}
                tone="blue"
                name={request.name}
                sub={`${request.age}${request.sex} - GLIS ${request.score} - ${protocols[request.protocol].name}`}
                badge="New request"
              />
            ))}
            {reviewPatients.map((patient) => (
              <QueueItem
                key={patient.id}
                tone="red"
                name={patient.name}
                sub={`${patient.age}${patient.sex} · GLIS ${patient.score} · ${protocols[patient.protocol].name}`}
                badge="Review →"
                onClick={() => router.push(`/doctor/medicalreview?id=${patient.id}`)}
              />
            ))}
            {patients.filter((patient) => patient.status === "trial").map((patient) => (
              <QueueItem
                key={patient.id}
                tone="gold"
                name={patient.name}
                sub={`Trial ending - Day ${patient.daysOn} - GLIS ${patient.score}`}
                badge="Upgrade"
                onClick={() => setSelectedPatientId(patient.id)}
              />
            ))}
          </section>

          <div className="today-card">
            <span className="queue-icon" style={{ background: "rgba(92,184,130,.10)", color: "var(--doc-green)" }}>
              <ClockIcon />
            </span>
            <span style={{ fontSize: 16, color: "var(--doc-d1)" }}>
              <strong>{formatNumber(creditsThisWeek())} credits</strong> earned this week
            </span>
          </div>

          <div className="search-wrap">
            <SearchIcon />
            <input
              type="search"
              placeholder="Search patients..."
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
          </div>

          <section aria-labelledby="requests-heading">
            <div className="section-label" id="requests-heading">Incoming Requests</div>
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </section>

          <section aria-labelledby="patients-heading" style={{ marginTop: 14 }}>
            <div className="section-label" id="patients-heading">Patients</div>
            {filteredPatients.length ? (
              filteredPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  selected={false}
                  onOpen={() => openDetail(patient.id)}
                />
              ))
            ) : (
              <div className="empty">No patients match your search.</div>
            )}
          </section>

          <div className="utilities">
            <button className="utility-btn" type="button" onClick={() => setPortalView("science")}><BookIcon /> Protocol Science</button>
            <button className="utility-btn" type="button" onClick={() => setPortalView("viber")}>
              <MessageIcon /> Notifications{viberConnected ? <span style={{ color: "var(--doc-green)", marginLeft: 4 }}>✓</span> : null}
            </button>
            <button className="utility-btn" type="button"><ShareIcon /> Share Link</button>
          </div>

          <footer className="footer-note">
            GutGuard Protocol - Licensed Lifestyle Supplement - 2026 GutGuard Philippines<br />
            SEC Registration - FDA Notification - LTO License
          </footer>
        </main>
        </>
        ) : null}
      </div>
    </div>
  );
}

function RedeemPage({
  amount,
  availableCredits,
  method,
  onAmountChange,
  onBack,
  onMethodChange,
  onReview,
  patients,
  redeemedCredits,
  totalCredits,
}: {
  amount: number;
  availableCredits: number;
  method: RedeemMethod;
  onAmountChange: (amount: number) => void;
  onBack: () => void;
  onMethodChange: (method: RedeemMethod) => void;
  onReview: () => void;
  patients: Patient[];
  redeemedCredits: number;
  totalCredits: number;
}) {
  const quickAmounts = [5000, Math.min(10000, availableCredits), availableCredits]
    .filter((value, index, values) => value > 0 && value <= availableCredits && values.indexOf(value) === index);
  const balanceAfter = availableCredits - amount;
  const invalidAmount = amount > 0 && (amount < 5000 || amount > availableCredits);
  const animatedAvailable = useAnimatedNumber(availableCredits, 850, 120);
  const animatedEarned = useAnimatedNumber(totalCredits, 700, 220);
  const animatedRedeemed = useAnimatedNumber(redeemedCredits, 700, 300);
  const animatedPatients = useAnimatedNumber(patients.length, 500, 360);

  return (
    <section className="redeem-screen">
      <div className="redeem-hero">
        <div className="redeem-top">
          <button className="redeem-back" type="button" onClick={onBack}>{"<-"} Back</button>
          <div className="redeem-title">Earnings</div>
          <div style={{ width: 54 }} />
        </div>

        <div className="redeem-balance">
          <div className="redeem-balance-label">Available to Redeem</div>
          <div className="redeem-peso">PHP {formatNumber(animatedAvailable)}</div>
          <div className="redeem-credit-pill">
            <span>{formatNumber(animatedAvailable)} credits</span>
            <span>- 1 cr = PHP 1</span>
          </div>
        </div>

        <div className="redeem-stat-strip">
          <RedeemStat label="Earned" value={formatNumber(animatedEarned)} />
          <div className="redeem-divider" />
          <RedeemStat label="Redeemed" value={formatNumber(animatedRedeemed)} tone="gold" />
          <div className="redeem-divider" />
          <RedeemStat label="Patients" value={String(animatedPatients)} />
        </div>
      </div>

      <div className="redeem-body">
        <div className="redeem-card rank-card">
          <div className="rank-top">
            <strong>Advanced Protocol Clinic</strong>
            <span>{patients.length} / 15 Protocols</span>
          </div>
          <div className="rank-bar"><span style={{ width: `${Math.min(100, Math.round((patients.length / 15) * 100))}%` }} /></div>
          <div className="rank-next">Next: Premier Protocol Center ({Math.max(0, 15 - patients.length)} more)</div>
        </div>

        <div className="redeem-label">Redeem via</div>
        {(Object.keys(redemptionMethods) as RedeemMethod[]).map((key) => (
          <MethodCard
            key={key}
            active={method === key}
            method={key}
            onSelect={() => onMethodChange(key)}
          />
        ))}

        <div className="amount-row">
          <div className="redeem-label" style={{ margin: 0 }}>Amount</div>
          <span>Min PHP 5,000 - Max PHP {formatNumber(availableCredits)}</span>
        </div>
        <div className="amount-input-wrap">
          <div className="peso-prefix">PHP</div>
          <input
            className={invalidAmount ? "amount-input invalid" : "amount-input"}
            inputMode="numeric"
            value={amount ? formatNumber(amount) : ""}
            onChange={(event) => onAmountChange(Number(event.currentTarget.value.replace(/\D/g, "")))}
            placeholder="0"
          />
        </div>
        <div className="balance-preview">
          {amount ? (
            invalidAmount ? (
              amount < 5000 ? "Minimum is PHP 5,000" : `Exceeds balance of PHP ${formatNumber(availableCredits)}`
            ) : (
              `PHP ${formatNumber(balanceAfter)} remaining after this redemption`
            )
          ) : null}
        </div>
        <div className="quick-amounts">
          {quickAmounts.map((value) => (
            <button
              className={amount === value ? "on" : ""}
              key={value}
              type="button"
              onClick={() => onAmountChange(value)}
            >
              {value === availableCredits ? "All" : `PHP ${formatNumber(value)}`}
            </button>
          ))}
        </div>

        <button className="redeem-submit" type="button" onClick={onReview} disabled={invalidAmount || amount === 0}>
          Review & Confirm
        </button>

        <div className="redeem-label" style={{ marginTop: 34 }}>Earnings by Patient</div>
        <div className="redeem-list">
          {patients
            .slice()
            .sort((a, b) => protocols[b.protocol].credits - protocols[a.protocol].credits)
            .map((patient) => (
              <EarningRow key={patient.id} patient={patient} />
            ))}
        </div>

        <div className="redeem-label" style={{ marginTop: 26 }}>Redemption History</div>
        <div className="redeem-list">
          <HistoryRow amount={10000} date="Feb 28, 2026" method="GCash transfer" />
          <HistoryRow amount={5000} date="Jan 15, 2026" method="Bank transfer" />
        </div>

        <div className="redeem-label" style={{ marginTop: 26 }}>Credit Schedule</div>
        <div className="redeem-list">
          {(Object.keys(protocols) as ProtocolKey[]).map((key) => (
            <ScheduleRow key={key} protocol={key} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RedeemConfirmPage({
  amount,
  availableCredits,
  method,
  onBack,
  onConfirm,
}: {
  amount: number;
  availableCredits: number;
  method: RedeemMethod;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const methodDetails = redemptionMethods[method];
  const animatedAmount = useAnimatedNumber(amount, 520, 120);

  return (
    <section className="redeem-screen">
      <div className="redeem-hero">
        <div className="redeem-top">
          <button className="redeem-back" type="button" onClick={onBack}>{"<-"} Back</button>
          <div className="redeem-title">Confirm</div>
          <div style={{ width: 54 }} />
        </div>
        <div className="redeem-balance">
          <div className="redeem-balance-label">You are redeeming</div>
          <div className="redeem-peso">PHP {formatNumber(animatedAmount)}</div>
          <div className="receipt-sub">{formatNumber(animatedAmount)} credits - via {methodDetails.name}</div>
        </div>
      </div>

      <div className="redeem-body">
        <div className="redeem-card confirm-card">
          <ConfirmRow label="Method" value={methodDetails.name} />
          <ConfirmRow label="Credits deducted" value={`${formatNumber(amount)} cr`} />
          <ConfirmRow label="Processing time" value={methodDetails.processing} />
          <ConfirmRow label="Balance after" value={`PHP ${formatNumber(Math.max(0, availableCredits - amount))}`} />
        </div>
        <button className="confirm-submit" type="button" onClick={onConfirm}>Confirm & Redeem</button>
        <button className="cancel-btn" type="button" onClick={onBack}>Cancel</button>
      </div>
    </section>
  );
}

function RedeemReceiptPage({
  amount,
  availableCredits,
  method,
  onDone,
  reference,
}: {
  amount: number;
  availableCredits: number;
  method: RedeemMethod;
  onDone: () => void;
  reference: string;
}) {
  const methodDetails = redemptionMethods[method];
  const animatedAmount = useAnimatedNumber(amount, 760, 180);
  const confettiPieces = useMemo(
    () => Array.from({ length: 22 }, (_, index) => ({
      background: ["#5cb882", "#3b82c8", "#d4a840", "#ffffff", "#e8772e"][index % 5],
      delay: `${(index % 8) * 0.07}s`,
      left: `${6 + ((index * 17) % 88)}%`,
      rotate: `${(index * 31) % 180}deg`,
    })),
    []
  );

  return (
    <section className="receipt-screen">
      {confettiPieces.map((piece, index) => (
        <span
          className="confetti-piece"
          key={`${piece.left}-${index}`}
          style={{
            animationDelay: piece.delay,
            background: piece.background,
            left: piece.left,
            transform: `rotate(${piece.rotate})`,
          }}
        />
      ))}
      <div className="receipt-hero">
        <div className="receipt-check">
          <CheckIcon />
        </div>
        <div className="receipt-kicker">Money is on its way</div>
        <div className="receipt-amount">PHP {formatNumber(animatedAmount)}</div>
        <div className="receipt-sub">Processing via {methodDetails.name}</div>
      </div>

      <div className="receipt-body">
        <div className="receipt-card">
          <ReceiptRow label="Credits deducted" value={`${formatNumber(amount)} credits`} />
          <ReceiptRow label="Method" value={methodDetails.name} />
          <ReceiptRow label="Processing" value={methodDetails.processing} />
          <ReceiptRow label="Reference" value={reference} />
          <ReceiptRow label="Remaining balance" value={`PHP ${formatNumber(Math.max(0, availableCredits - amount))}`} />
        </div>
        <div className="receipt-note">
          <MessageIcon />
          <span>Confirmation will be sent to your registered mobile number and email.</span>
        </div>
        <button className="receipt-done" type="button" onClick={onDone}>Back to Dashboard</button>
      </div>
    </section>
  );
}

function RedeemStat({ label, tone, value }: { label: string; tone?: "gold"; value: string }) {
  return (
    <div className="redeem-stat">
      <strong style={tone === "gold" ? { color: "rgba(232,178,48,.8)" } : undefined}>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function MethodCard({
  active,
  method,
  onSelect,
}: {
  active: boolean;
  method: RedeemMethod;
  onSelect: () => void;
}) {
  const details = redemptionMethods[method];

  return (
    <button className={active ? "method-card on" : "method-card"} type="button" onClick={onSelect}>
      <span
        className="method-icon"
        style={{
          background: method === "gcash" ? "#007dfe" : method === "clinic" ? "rgba(59,130,200,.1)" : "var(--doc-lt2)",
          color: method === "gcash" ? "#fff" : "var(--doc-d1)",
        }}
      >
        {method === "gcash" ? "G" : method === "bank" ? <BankIcon /> : <ShieldIcon size={17} />}
      </span>
      <span className="method-text">
        <span className="method-title">
          {details.name}
          {details.badge ? <span className="method-badge">{details.badge}</span> : null}
        </span>
        <span className="method-sub">{details.description}</span>
      </span>
      <span className="method-radio"><span /></span>
    </button>
  );
}

function EarningRow({ patient }: { patient: Patient }) {
  const protocol = protocols[patient.protocol];

  return (
    <div className="earning-row">
      <ScoreRing score={patient.score} size={42} />
      <div className="row-main">
        <strong>{patient.name}</strong>
        <span>{protocol.name} - {patient.scanDate}</span>
      </div>
      <div className="row-amount">
        PHP {formatNumber(protocol.credits)}
        <span>{formatNumber(protocol.credits)} cr</span>
      </div>
    </div>
  );
}

function HistoryRow({ amount, date, method }: { amount: number; date: string; method: string }) {
  return (
    <div className="history-row">
      <div className="row-main">
        <strong>{method}</strong>
        <span>{date} - {formatNumber(amount)} credits</span>
      </div>
      <div className="row-amount">
        PHP {formatNumber(amount)}
        <span className="status-badge">Processed</span>
      </div>
    </div>
  );
}

function ScheduleRow({ protocol }: { protocol: ProtocolKey }) {
  const data = protocols[protocol];

  return (
    <div className="schedule-row">
      <div className="method-icon" style={{ background: "rgba(59,130,200,.08)", color: "var(--doc-blue)" }}>{data.days}</div>
      <div className="row-main">
        <strong>{data.name} Protocol</strong>
        <span>{data.price} - {data.days} days</span>
      </div>
      <div className="row-amount">PHP {formatNumber(data.credits)}</div>
    </div>
  );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="confirm-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="receipt-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const DECLINE_REASONS = ["Not appropriate", "Protocol mismatch", "At capacity", "Duplicate"];

function RequestCard({ request }: { request: Request }) {
  const [accepted, setAccepted] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");
  const [declined, setDeclined] = useState(false);

  if (accepted) {
    return (
      <div className="request-card" style={{ borderLeft: "3px solid var(--doc-green)" }}>
        <div style={{ padding: "14px 0 2px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(92,184,130,.15)", border: "1px solid rgba(92,184,130,.30)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--doc-green)", flexShrink: 0 }}><CheckIcon size={14} /></span>
          <span style={{ fontSize: 15, fontWeight: 750, color: "var(--doc-green)" }}>{request.name} accepted</span>
        </div>
      </div>
    );
  }

  if (declined) return null;

  return (
    <div className="request-card">
      <div className="request-top">
        <ScoreRing score={request.score} />
        <div className="request-body">
          <div className="request-title">
            <strong>{request.name}</strong>
            <span className="badge" style={{ color: "var(--doc-blue)", background: "rgba(59,130,200,.10)" }}>{request.timeLeft}</span>
          </div>
          <div className="request-meta">
            {request.age}{request.sex} · {protocols[request.protocol].name} Protocol · {request.source}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button className="req-accept-btn" type="button" onClick={() => setAccepted(true)}>
          <CheckIcon size={16} /> Accept Patient
        </button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0 0" }}>
          <button className="req-decline-text" type="button" onClick={() => setDeclining((v) => !v)}>
            {declining ? "Cancel" : "Decline"}
          </button>
          {declining && reason ? (
            <button
              type="button"
              style={{ background: "none", border: "1px solid var(--doc-red)", borderRadius: 8, color: "var(--doc-red)", fontSize: 13, fontWeight: 750, padding: "5px 12px", cursor: "pointer", fontFamily: "var(--doc-font)" }}
              onClick={() => setDeclined(true)}
            >
              Confirm decline
            </button>
          ) : null}
        </div>
        {declining ? (
          <div className="decline-reasons">
            <div style={{ paddingTop: 8 }}>
              {DECLINE_REASONS.map((r) => (
                <button key={r} className={`reason-chip${reason === r ? " on" : ""}`} type="button" onClick={() => setReason(r === reason ? "" : r)}>{r}</button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PatientCard({ patient, selected, onOpen }: { patient: Patient; selected: boolean; onOpen: () => void }) {
  const protocol = protocols[patient.protocol];
  const progress = Math.min(100, Math.round((patient.daysOn / protocol.days) * 100));
  const badge = getPatientBadge(patient);
  const action = getPatientAction(patient);
  const scoreColor = getScoreColor(patient.score);

  return (
    <button className="patient-card" type="button" onClick={onOpen} style={{ outline: selected ? "2px solid rgba(59,130,200,.28)" : undefined }}>
      <div className="patient-main">
        <div className="patient-top">
          <ScoreRing score={patient.score} />
          <div className="patient-body">
            <div className="patient-name">
              <strong>{patient.name}</strong>
              {badge ? <span className="badge" style={{ color: badge.color, background: badge.background }}>{badge.label}</span> : null}
            </div>
            <div className="patient-meta">
              {protocol.name} - Day {patient.daysOn} - {patient.age}{patient.sex}
            </div>
          </div>
        </div>
        <div className="bar">
          <span style={{ width: `${progress}%`, background: scoreColor }} />
        </div>
      </div>
      <div className="patient-action">
        <span style={{ color: action.color, borderColor: `${action.color}33` }}>{action.label}</span>
      </div>
    </button>
  );
}

function PatientDetail({ patient, email }: { patient: Patient; email: string }) {
  const protocol = protocols[patient.protocol];
  const drop = patient.baseline ? patient.baseline - patient.score : 0;

  return (
    <section className="detail-panel" aria-labelledby="patient-detail-heading">
      <div className="detail-head">
        <div>
          <h2 id="patient-detail-heading">{patient.name}</h2>
          <p>{patient.age}{patient.sex} - {patient.lab}</p>
        </div>
        <ScoreRing score={patient.score} size={62} />
      </div>
      <p className="detail-note">{patient.note}</p>
      <div className="detail-grid">
        <DetailCell label="Protocol" value={`${protocol.name} - ${protocol.days} days`} />
        <DetailCell label="Credits" value={formatNumber(protocol.credits)} />
        <DetailCell label="Latest Scan" value={patient.scanDate} />
        <DetailCell label="Progress" value={drop > 0 ? `${drop} point improvement` : patient.lastEvent} />
        <DetailCell label="Symptoms" value={patient.symptoms} />
        <DetailCell label="Doctor Email" value={email || "Not provided"} />
      </div>
    </section>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-cell">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function QueueItem({
  badge,
  name,
  onClick,
  sub,
  tone,
}: {
  badge: string;
  name: string;
  onClick?: () => void;
  sub: string;
  tone: "blue" | "red" | "gold";
}) {
  const color = tone === "red" ? "var(--doc-red)" : tone === "gold" ? "var(--doc-gold)" : "var(--doc-blue)";
  const background = tone === "red" ? "rgba(212,32,32,.10)" : tone === "gold" ? "rgba(212,168,64,.10)" : "rgba(59,130,200,.12)";

  return (
    <button className="queue-item" type="button" onClick={onClick} style={{ width: "100%", textAlign: "left" }}>
      <span className="queue-icon" style={{ background, color }}>
        {tone === "red" ? <AlertIcon /> : tone === "gold" ? <ClockIcon /> : <UserPlusIcon />}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="queue-name">{name}</span>
        <span className="queue-sub">{sub}</span>
      </span>
      <span className="queue-badge" style={{ color, background }}>{badge}</span>
    </button>
  );
}

function NotificationRow({ sub, title, tone }: { sub: string; title: string; tone: "blue" | "red" | "green" }) {
  const color = tone === "red" ? "var(--doc-red)" : tone === "green" ? "var(--doc-green)" : "var(--doc-blue)";

  return (
    <div className="notif-row">
      <span className="notif-icon" style={{ color, background: `${color === "var(--doc-blue)" ? "rgba(59,130,200,.10)" : color === "var(--doc-red)" ? "rgba(212,32,32,.10)" : "rgba(92,184,130,.10)"}` }}>
        {tone === "red" ? <AlertIcon /> : tone === "green" ? <TrendIcon /> : <UserPlusIcon />}
      </span>
      <span>
        <span className="notif-title">{title}</span>
        <span className="notif-sub">{sub}</span>
      </span>
    </div>
  );
}

function ScoreRing({ score, size = 50 }: { score: number; size?: number }) {
  const angle = Math.max(0, Math.min(100, score)) * 3.6;

  return (
    <span
      className="doc-ring"
      style={{
        "--angle": `${angle}deg`,
        width: size,
        height: size,
      } as React.CSSProperties}
    >
      <b style={{ color: getScoreColor(score), fontSize: size > 50 ? 17 : 14 }}>{score}</b>
    </span>
  );
}

function getPatientBadge(patient: Patient) {
  const drop = patient.baseline ? patient.baseline - patient.score : 0;

  if (patient.status === "review") {
    return { label: "Review", color: "var(--doc-red)", background: "rgba(212,32,32,.10)" };
  }

  if (patient.status === "trial") {
    return { label: "Trial ending", color: "var(--doc-gold)", background: "rgba(212,168,64,.12)" };
  }

  if (patient.status === "inactive") {
    return { label: "Inactive", color: "var(--doc-orange)", background: "rgba(232,119,46,.10)" };
  }

  if (drop > 0) {
    return { label: `${drop} pts`, color: "var(--doc-green)", background: "rgba(92,184,130,.10)" };
  }

  return null;
}

function getPatientAction(patient: Patient) {
  if (patient.status === "review") {
    return { label: "Review ->", color: "var(--doc-red)" };
  }

  if (patient.status === "trial") {
    return { label: "View trial status ->", color: "var(--doc-gold)" };
  }

  if (patient.status === "inactive") {
    return { label: "Send check-in", color: "var(--doc-orange)" };
  }

  if (patient.baseline && patient.baseline > patient.score) {
    return { label: "View progress", color: "var(--doc-green)" };
  }

  return { label: "Open patient", color: "var(--doc-blue)" };
}

function getScoreColor(score: number) {
  if (score <= 25) return "#34a853";
  if (score <= 50) return "#d4a840";
  if (score <= 75) return "#e8772e";
  return "#d42020";
}

function creditsThisWeek() {
  return patients
    .filter((patient) => patient.daysOn <= 7 || patient.status === "review")
    .reduce((sum, patient) => sum + protocols[patient.protocol].credits, 0);
}

function useAnimatedNumber(target: number, duration = 700, delay = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frameId = 0;
    let delayId = 0;

    delayId = window.setTimeout(() => {
      const startedAt = performance.now();

      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(target * eased));

        if (progress < 1) {
          frameId = requestAnimationFrame(tick);
        }
      };

      frameId = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(delayId);
      cancelAnimationFrame(frameId);
    };
  }, [delay, duration, target]);

  return value;
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

function ShieldIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="16 6 23 6 23 12" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BankIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21h18" />
      <path d="M3 10h18" />
      <path d="M5 6l7-3 7 3" />
      <path d="M4 10v11" />
      <path d="M20 10v11" />
      <path d="M8 14v3" />
      <path d="M12 14v3" />
      <path d="M16 14v3" />
    </svg>
  );
}

function CheckIcon({ size = 38 }: { size?: number }) {
  const scale = size / 38;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth={3.5 / scale} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="7 19 15 27 29 11" />
    </svg>
  );
}

function PatientDetailScreen({
  patient,
  email,
  tab,
  onTabChange,
  onBack,
}: {
  patient: Patient;
  email: string;
  tab: DetailTab;
  onTabChange: (t: DetailTab) => void;
  onBack: () => void;
}) {
  const protocol = protocols[patient.protocol];
  const drop = patient.baseline ? patient.baseline - patient.score : 0;
  const action = getPatientAction(patient);

  const history = [
    { label: patient.lastEvent, date: patient.scanDate, color: drop > 0 ? "var(--doc-green)" : "var(--doc-blue)" },
    { label: `${protocol.name} Protocol — Day ${patient.daysOn}`, date: patient.scanDate, color: "var(--doc-blue)" },
    { label: `Lab: ${patient.lab}`, date: patient.scanDate, color: "var(--doc-d3)" },
  ];

  return (
    <div className="detail-screen">
      <div className="detail-sticky-nav">
        <div className="detail-nav-row">
          <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 16, fontWeight: 750, color: "var(--doc-d3)", padding: "8px 0", cursor: "pointer" }}>← Back</button>
          <div style={{ fontSize: 16, fontWeight: 850, color: "var(--doc-d1)" }}>{patient.name}</div>
          <div style={{ width: 48 }} />
        </div>
        <div className="detail-score-strip">
          GLIS {patient.score}{drop > 0 ? ` · ${drop} pt improvement` : ""} · {patient.age}{patient.sex}
        </div>
        <div className="detail-tab-bar">
          <button className={`detail-tab${tab === "summary" ? " on" : ""}`} type="button" onClick={() => onTabChange("summary")}>Summary</button>
          <button className={`detail-tab${tab === "history" ? " on" : ""}`} type="button" onClick={() => onTabChange("history")}>History</button>
        </div>
      </div>

      {tab === "summary" ? (
        <div className="detail-tab-body">
          <div className="detail-panel">
            <div className="detail-head">
              <div>
                <h2 id="patient-detail-heading">{patient.name}</h2>
                <p>{patient.age}{patient.sex} · {patient.lab}</p>
              </div>
              <ScoreRing score={patient.score} size={62} />
            </div>
            <p className="detail-note">{patient.note}</p>
            <div className="detail-grid">
              <DetailCell label="Protocol" value={`${protocol.name} · ${protocol.days} days`} />
              <DetailCell label="Credits" value={formatNumber(protocol.credits)} />
              <DetailCell label="Latest Scan" value={patient.scanDate} />
              <DetailCell label="Progress" value={drop > 0 ? `${drop} point improvement` : patient.lastEvent} />
              <DetailCell label="Symptoms" value={patient.symptoms} />
              <DetailCell label="Doctor Email" value={email || "Not provided"} />
            </div>
          </div>
        </div>
      ) : (
        <div className="detail-tab-body">
          <div style={{ background: "var(--doc-white)", borderRadius: 16, padding: "0 20px", border: "1px solid var(--doc-lt2)" }}>
            {history.map((event, i) => (
              <div className="history-event" key={i}>
                <div className="history-dot" style={{ background: event.color }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 750, color: "var(--doc-d1)", lineHeight: 1.35 }}>{event.label}</div>
                  <div style={{ fontSize: 13, color: "var(--doc-d3)", marginTop: 3 }}>{event.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="detail-sticky-action">
        <button
          type="button"
          style={{ width: "100%", minHeight: 52, border: `1px solid ${action.color}33`, borderRadius: 14, background: "transparent", color: action.color, fontSize: 16, fontWeight: 850, fontFamily: "var(--doc-font)", cursor: "pointer" }}
        >
          {action.label}
        </button>
      </div>
    </div>
  );
}

function SciencePage({ onBack }: { onBack: () => void }) {
  return (
    <div className="science-screen">
      <div className="detail-sticky-nav">
        <div className="detail-nav-row">
          <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 15, fontWeight: 750, color: "var(--doc-d3)", padding: "8px 0", cursor: "pointer", minHeight: 44 }}>← Back</button>
          <div style={{ fontSize: 16, fontWeight: 850, color: "var(--doc-d1)" }}>Protocol Science</div>
          <div style={{ width: 60 }} />
        </div>
      </div>

      <div className="science-dark-zone">
        <div className="science-section-label" style={{ color: "rgba(255,255,255,.50)" }}>Clinical Reference</div>

        {/* BioScan */}
        <div className="science-card" style={{ border: "1px solid rgba(59,130,200,.18)" }}>
          <div className="science-card-header" style={{ background: "rgba(59,130,200,.14)" }}>
            <div className="science-card-dot" style={{ background: "var(--doc-blue)" }} />
            <div className="science-card-tag" style={{ color: "rgba(59,130,200,.90)" }}>BioScan</div>
            <div className="science-card-version">GLIS · IMSI v1.0</div>
          </div>
          <div className="science-card-body" style={{ background: "rgba(59,130,200,.05)" }}>
            <div className="science-card-title">Inflammatory and metabolic<br />pattern scoring</div>
            <div className="science-card-desc">Computes a 0–100 GLIS score from your patient's lab panel using the v1.3 methodology — targeting <em>inflammaging</em> across three biological domains: inflammatory (hs-CRP, NLR), metabolic (HbA1c), and organ function (ALT, eGFR).</div>
            <div style={{ padding: "12px 16px", background: "rgba(255,255,255,.04)", borderLeft: "2px solid rgba(59,130,200,.40)", borderRadius: "0 8px 8px 0", marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.55)", lineHeight: 1.6 }}>The gut drives systemic inflammation. BioScan scores the measurable consequence, not the cause.</div>
            </div>
            <div className="science-blockquote" style={{ borderLeft: "3px solid var(--doc-blue)" }}>
              <div className="science-blockquote-title">The score is a clinical reference, not a directive.</div>
              <div className="science-blockquote-desc">You review the score, apply your clinical judgment, and determine the appropriate next step for your patient.</div>
            </div>
            <div className="science-legal">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.30)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div className="science-legal-text">For monitoring purposes only. IMSI v1.0 does not diagnose, prescribe, or replace clinical evaluation.</div>
            </div>
          </div>
        </div>

        {/* Connector */}
        <div className="science-connector">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 1, height: 10, background: "rgba(255,255,255,.12)" }} />
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M5 6L0 0h10L5 6z" fill="rgba(255,255,255,.18)"/></svg>
          </div>
        </div>

        {/* Lifestyle Protocol */}
        <div className="science-card" style={{ border: "1px solid rgba(92,184,130,.18)" }}>
          <div className="science-card-header" style={{ background: "rgba(92,184,130,.14)" }}>
            <div className="science-card-dot" style={{ background: "var(--doc-green)" }} />
            <div className="science-card-tag" style={{ color: "rgba(92,184,130,.90)" }}>Lifestyle Protocol</div>
            <div className="science-card-version">Pre→Pro→Post Synbiotic</div>
          </div>
          <div className="science-card-body" style={{ background: "rgba(92,184,130,.05)" }}>
            <div className="science-card-title">A structured synbiotic regimen,<br />guided by your clinical assessment</div>
            <div className="science-card-desc">Four protocol tiers — Trial, Start, Grow, Power — each corresponding to a GLIS range. You select the tier appropriate for your patient. The portal documents your decision. 30 days per cycle. Re-scored at completion.</div>
            <div className="science-blockquote" style={{ borderLeft: "3px solid var(--doc-green)" }}>
              <div className="science-blockquote-title">Your decision is on record.</div>
              <div className="science-blockquote-desc">The portal logs your tier selection as a clinical decision — not an algorithm recommendation.</div>
            </div>
            <div className="science-legal">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.30)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div className="science-legal-text">GutGuard Lifestyle Protocol is a dietary supplement. Not a treatment for any diagnosed condition.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="science-body">
        <div className="science-body-label">Scoring Model</div>

        {/* GLIS Identity */}
        <div className="science-white-card">
          <div className="science-white-head">
            <div className="science-icon" style={{ background: "rgba(59,130,200,.07)" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--doc-blue)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
            <div><div className="science-card-h">GLIS · IMSI v1.0</div><div className="science-card-subh">Inflammatory–Metabolic Markers Index</div></div>
          </div>
          <div style={{ fontSize: 15, color: "var(--doc-d2)", lineHeight: 1.65, marginBottom: 14 }}>A composite biomarker-based index that estimates inflammatory and metabolic burden using routine laboratory markers, designed for monitoring trends and supporting clinical interpretation.</div>
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--doc-lt)", fontSize: 14, color: "var(--doc-d3)", lineHeight: 1.5 }}>
            Patient-facing: <strong style={{ color: "var(--doc-d1)" }}>Optimal / Good / Pay Attention / Take Action</strong><br />
            Brand: <strong style={{ color: "var(--doc-d1)" }}>GutGuard GLIS (Gut-Lifestyle Inflammation Score)</strong>
          </div>
        </div>

        {/* Dual Domain */}
        <div className="science-white-card">
          <div className="science-white-head">
            <div className="science-icon" style={{ background: "rgba(204,110,72,.07)" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--doc-orange)" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
            <div className="science-card-h">Dual-Domain Model</div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 750, color: "var(--doc-d2)", marginBottom: 14 }}>IMSI = Inflammatory Domain (50%) + Metabolic Domain (50%)</div>
          <div className="science-domain-box" style={{ background: "rgba(212,32,32,.03)", border: "1px solid rgba(212,32,32,.07)" }}>
            <div className="science-domain-label" style={{ color: "var(--doc-red)" }}>INFLAMMATORY DOMAIN (50%)</div>
            <div style={{ fontSize: 13, fontWeight: 750, color: "var(--doc-d3)", marginBottom: 5 }}>hs-CRP (Primary anchor)</div>
            <div className="science-pill-row">
              {["<1.0 = 0pts", "1–3 = 10pts", "3–5 = 15pts", ">5 = 20pts"].map((v) => <div key={v} className="science-pill">{v}</div>)}
            </div>
            <div style={{ fontSize: 13, fontWeight: 750, color: "var(--doc-d3)", marginBottom: 5 }}>NLR (Immune-inflammatory balance)</div>
            <div className="science-pill-row">
              {["<2.0 = 0pts", "2–3 = 8pts", "3–5 = 15pts", ">5 = 20pts"].map((v) => <div key={v} className="science-pill">{v}</div>)}
            </div>
            <div className="science-formula">Score = (CRP pts + NLR pts) / 40 × 50</div>
          </div>
          <div className="science-domain-box" style={{ background: "rgba(212,168,64,.03)", border: "1px solid rgba(212,168,64,.08)" }}>
            <div className="science-domain-label" style={{ color: "var(--doc-gold)" }}>METABOLIC DOMAIN (50%)</div>
            <div style={{ fontSize: 13, fontWeight: 750, color: "var(--doc-d3)", marginBottom: 4 }}>Core: Glucose (0–18) · Triglycerides (0–18) · HDL (0–12) · TyG Index (0–20)</div>
            <div style={{ fontSize: 13, fontWeight: 750, color: "var(--doc-d3)", marginBottom: 8 }}>Modifier: ALT (0–10)</div>
            <div className="science-formula" style={{ marginBottom: 4 }}>TyG = ln((TG × Glucose) / 2)</div>
            <div className="science-formula">Score = (Glu + TG + HDL + TyG + ALT) / 78 × 50</div>
          </div>
        </div>

        {/* Interpretation & Safety */}
        <div className="science-white-card">
          <div className="science-white-head">
            <div className="science-icon" style={{ background: "rgba(59,130,200,.07)" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--doc-blue)" strokeWidth="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg></div>
            <div className="science-card-h">Interpretation &amp; Safety</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 850, color: "var(--doc-d4)", letterSpacing: ".08em", marginBottom: 10 }}>SCORE BANDS</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
            <div className="science-score-band" style={{ background: "rgba(92,184,130,.08)", color: "var(--doc-green)" }}>0–25 Optimal</div>
            <div className="science-score-band" style={{ background: "rgba(212,168,64,.08)", color: "var(--doc-gold)" }}>25–50 Mild</div>
            <div className="science-score-band" style={{ background: "rgba(204,110,72,.08)", color: "var(--doc-orange)" }}>50–75 Moderate</div>
            <div className="science-score-band" style={{ background: "rgba(212,32,32,.08)", color: "var(--doc-red)" }}>75–100 High</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 850, color: "var(--doc-d4)", letterSpacing: ".08em", marginBottom: 10 }}>CONFIDENCE TIERS</div>
          {[
            { tier: "Tier A — High confidence", desc: "All required markers: hs-CRP, CBC→NLR, Glucose, TG, HDL, ALT" },
            { tier: "Tier B — Moderate", desc: "Missing 1–2 markers. Display: Moderate confidence due to incomplete data" },
            { tier: "Tier C — Low", desc: "<50% markers present. Display: Preliminary estimate only" },
          ].map(({ tier, desc }) => (
            <div key={tier} className="science-tier-row">
              <div style={{ fontSize: 14, fontWeight: 750, color: "var(--doc-d1)" }}>{tier}</div>
              <div style={{ fontSize: 13, color: "var(--doc-d3)", marginTop: 2 }}>{desc}</div>
            </div>
          ))}
          <div style={{ fontSize: 12, fontWeight: 850, color: "var(--doc-d4)", letterSpacing: ".08em", margin: "16px 0 10px" }}>RED FLAGS — IMMEDIATE REVIEW</div>
          <div className="science-red-flags">
            <div style={{ fontSize: 14, color: "var(--doc-d2)", lineHeight: 1.65, marginBottom: 6 }}>Triggers: <strong style={{ color: "var(--doc-red)" }}>hs-CRP &gt;10 · Glucose &gt;180 · ALT &gt;100 · NLR &gt;8</strong></div>
            <div style={{ fontSize: 14, color: "var(--doc-d2)", lineHeight: 1.65 }}>Action: Disable auto protocol · Force doctor review · Display: ⚠️ Medical Review Required</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 850, color: "var(--doc-d4)", letterSpacing: ".08em", margin: "16px 0 10px" }}>PROTOCOL MAPPING</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {["0–25 → Maintenance", "25–50 → Start", "50–75 → Grow", "75–100 → Power"].map((v) => (
              <div key={v} style={{ padding: "7px 14px", borderRadius: 8, background: "var(--doc-lt)", fontSize: 13, fontWeight: 700, color: "var(--doc-d2)" }}>{v}</div>
            ))}
          </div>
          <div className="science-shield-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--doc-blue)" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <div style={{ fontSize: 14, fontWeight: 750, color: "rgba(255,255,255,.75)", lineHeight: 1.4 }}>Protocol mapping is assistive. Final protocol selection is the doctor's clinical decision.</div>
          </div>
        </div>

        <div className="science-body-label">Synbiotic Mechanism</div>
        <div className="science-white-card">
          <div className="science-white-head">
            <div className="science-icon" style={{ background: "rgba(92,184,130,.07)" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--doc-green)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
            <div className="science-card-h">Pre→Pro→Post Mechanism</div>
          </div>
          <div style={{ fontSize: 14, color: "var(--doc-d2)", lineHeight: 1.65, marginBottom: 16 }}>Sequential Pre→Pro→Postbiotic approach targeting the gut-inflammation axis through Mitochondria Bio-regeneration System activation.</div>
          {[
            { n: "1", c: "var(--doc-blue)", bg: "rgba(59,130,200,.07)", label: "Prebiotic Substrate", desc: "Conditions the gut microenvironment" },
            { n: "2", c: "var(--doc-blue)", bg: "rgba(59,130,200,.07)", label: "Targeted Probiotics", desc: "Nano-encapsulated, site-specific delivery" },
            { n: "3", c: "var(--doc-green)", bg: "rgba(92,184,130,.07)", label: "Postbiotic Metabolites", desc: "Urolithin-A + L-Tryptophan" },
            { n: "4", c: "var(--doc-green)", bg: "rgba(92,184,130,.07)", label: "MBS Activation", desc: "Mitochondria Bio-regeneration cascade" },
          ].map(({ n, c, bg, label, desc }) => (
            <div key={n} className="science-step-row">
              <div className="science-step-num" style={{ background: bg, color: c }}>{n}</div>
              <div><div style={{ fontSize: 15, fontWeight: 750, color: "var(--doc-d1)" }}>{label}</div><div style={{ fontSize: 13, color: "var(--doc-d3)" }}>{desc}</div></div>
            </div>
          ))}
        </div>

        <div className="science-body-label">Key References</div>
        <div style={{ background: "var(--doc-white)", borderRadius: 16, overflow: "hidden", marginBottom: 12, border: "1px solid var(--doc-lt2)" }}>
          <div className="science-ref-anchor">
            <div style={{ fontSize: 11, fontWeight: 850, letterSpacing: ".08em", color: "var(--doc-blue)", textTransform: "uppercase", marginBottom: 6 }}>Anchor Reference</div>
            <div style={{ fontSize: 15, fontWeight: 750, color: "var(--doc-d1)", lineHeight: 1.4, marginBottom: 4 }}>Urolithin A induces mitophagy and prolongs lifespan</div>
            <div style={{ fontSize: 13, color: "var(--doc-d3)" }}>Ryu D, et al. <em>Nature Medicine</em>, 2016</div>
            <div style={{ fontSize: 13, color: "var(--doc-blue)", marginTop: 3, fontWeight: 700 }}>doi: 10.1038/nm.4132</div>
          </div>
          {[
            { title: "Short-chain fatty acids and gut inflammation", meta: "Dalile B, et al. Gut Microbes, 2019 · doi: 10.1080/19490976.2019.1624603" },
            { title: "Tryptophan metabolism and gut-brain homeostasis", meta: "Agus A, et al. Cell Host & Microbe, 2018 · doi: 10.1016/j.chom.2018.05.003" },
            { title: "CRP and cardiovascular disease prediction", meta: "Kaptoge S, et al. NEJM, 2012 · doi: 10.1056/NEJMoa1107477" },
            { title: "NLR as inflammatory marker", meta: "Forget P, et al. Anesthesiology, 2017 · doi: 10.1097/ALN.0000000000001564" },
            { title: "TG/HDL ratio as insulin resistance surrogate", meta: "McLaughlin T, et al. JCEM, 2005 · doi: 10.1210/jc.2004-1439" },
            { title: "TyG Index and insulin resistance", meta: "Simental-Mendía LE, et al. Cardiovasc Diabetol, 2008 · doi: 10.1186/1475-2840-7-10" },
          ].map(({ title, meta }) => (
            <div key={title} className="science-ref-row">
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--doc-d1)", lineHeight: 1.4 }}>{title}</div>
              <div style={{ fontSize: 13, color: "var(--doc-d3)", marginTop: 3 }}>{meta}</div>
            </div>
          ))}
        </div>

        <div className="science-body-label">Rules &amp; Limitations</div>
        <div className="science-rules">
          <div className="science-rule-label" style={{ color: "var(--doc-green)" }}>MUST</div>
          <div className="science-rule-text">Show subscores · Show confidence · Show disclaimer · Allow doctor override · Log all changes · Version scoring</div>
          <div className="science-rule-label" style={{ color: "var(--doc-red)" }}>MUST NOT</div>
          <div className="science-rule-text">Diagnose disease · Auto-prescribe · Hide logic · Ignore abnormal values · Present score without context</div>
          <div className="science-rule-label" style={{ color: "var(--doc-d4)" }}>LIMITATIONS</div>
          <div className="science-rule-text" style={{ color: "var(--doc-d3)" }}>Based on available markers only. Does not replace clinical evaluation. Individual results vary.</div>
        </div>
        <div style={{ textAlign: "center", fontSize: 12, color: "var(--doc-d4)", padding: "8px 0 16px", lineHeight: 1.6 }}>IMSI v1.0 · References for clinical education only.<br />GutGuard does not claim equivalence to cited study outcomes.</div>
      </div>
    </div>
  );
}

function ViberPage({
  connected,
  onConnect,
  onBack,
}: {
  connected: boolean;
  onConnect: () => void;
  onBack: () => void;
}) {
  return (
    <div className="viber-screen">
      <div className="detail-sticky-nav">
        <div className="detail-nav-row">
          <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 16, fontWeight: 750, color: "var(--doc-d3)", padding: "8px 0", cursor: "pointer", minHeight: 44 }}>← Back</button>
          <div style={{ fontSize: 16, fontWeight: 850, color: "var(--doc-d1)" }}>Viber Notifications</div>
          <div style={{ width: 60 }} />
        </div>
      </div>

      <div style={{ padding: "clamp(14px,4.5vw,24px)" }}>
        {connected ? (
          <div className="viber-verified">
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(115,96,242,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7360F2" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 750, color: "var(--doc-green)" }}>Viber Connected</div>
              <div style={{ fontSize: 13, color: "var(--doc-d3)", marginTop: 2 }}>GutGuard · Doctor Portal</div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", padding: "clamp(16px,5vw,28px) 20px 24px" }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(115,96,242,.08)", border: "1px solid rgba(38,165,219,.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7360F2" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div style={{ fontSize: 22, fontWeight: 850, color: "var(--doc-d1)", letterSpacing: "-.02em", marginBottom: 8 }}>Connect Viber</div>
              <div style={{ fontSize: 15, color: "var(--doc-d3)", lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>Get instant alerts on your phone. No dashboard needed — your patients come to you.</div>
            </div>

            <div style={{ background: "var(--doc-white)", borderRadius: 20, padding: 22, marginBottom: 14, boxShadow: "0 1px 3px rgba(0,0,0,.02)" }}>
              <div style={{ fontSize: 13, fontWeight: 850, letterSpacing: ".10em", color: "var(--doc-d4)", textTransform: "uppercase", marginBottom: 16 }}>Setup in 3 steps</div>
              {[
                { n: 1, title: "Open Viber → search @GutGuardDoc", desc: "Already on your phone? Tap to open directly." },
                { n: 2, title: "Tap Message → type /connect", desc: "The bot will ask for your clinic verification code." },
                { n: 3, title: "Enter this code in the bot", desc: null },
              ].map(({ n, title, desc }) => (
                <div key={n} style={{ display: "flex", gap: 14, marginBottom: n < 3 ? 18 : 0 }}>
                  <div className="viber-step-num">{n}</div>
                  <div style={{ flex: 1, paddingTop: 5 }}>
                    <div style={{ fontSize: 16, fontWeight: 750, color: "var(--doc-d1)", marginBottom: 4 }}>{title}</div>
                    {desc ? <div style={{ fontSize: 14, color: "var(--doc-d3)", lineHeight: 1.5 }}>{desc}</div> : null}
                    {n === 3 ? <div className="viber-code-block">CLINIC-ANIMAS-2847</div> : null}
                    {n === 3 ? <div style={{ fontSize: 13, color: "var(--doc-d3)", marginTop: 4 }}>Unique to your clinic account. Do not share.</div> : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="viber-channel-card">
              <div style={{ fontSize: 13, fontWeight: 850, letterSpacing: ".08em", color: "var(--doc-d4)", textTransform: "uppercase", marginBottom: 12 }}>Where your notifications go</div>
              {[
                { icon: "email", color: "var(--doc-blue)", bg: "rgba(59,130,200,.08)", title: "Email — Official channel", desc: "Redemption receipts · Weekly earnings digest · Protocol summaries" },
                { icon: "viber", color: "#7360F2", bg: "rgba(115,96,242,.08)", title: "Viber — Instant alerts", desc: "New enrollments · Scan uploads · Red flags · Trial expiring" },
              ].map(({ color, bg, title, desc, icon }) => (
                <div key={icon} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: icon === "viber" ? 0 : 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {icon === "email"
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 750, color: "var(--doc-d1)" }}>{title}</div>
                    <div style={{ fontSize: 13, color: "var(--doc-d3)", marginTop: 2, lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={onConnect}
              style={{ width: "100%", minHeight: 54, borderRadius: 16, border: "none", background: "var(--doc-blue)", color: "#fff", fontSize: 17, fontWeight: 850, fontFamily: "var(--doc-font)", cursor: "pointer", transition: "transform .1s" }}
            >
              I&apos;ve Connected — Verify
            </button>
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 14, color: "var(--doc-d4)", fontFamily: "var(--doc-font)", cursor: "pointer", padding: 8 }}>Skip for now</button>
            </div>
          </>
        )}

        {/* What you'll receive */}
        <div style={{ borderRadius: 20, padding: 22, marginTop: 14, background: "var(--doc-bg)" }}>
          <div style={{ fontSize: 13, fontWeight: 850, letterSpacing: ".10em", color: "rgba(255,255,255,.45)", textTransform: "uppercase", marginBottom: 14 }}>You&apos;ll receive</div>
          {[
            { icon: "green", label: "New enrollment", msg: '"Maria Santos enrolled in Grow Protocol. ₱3,500 credits earned."' },
            { icon: "blue", label: "Scan uploaded", msg: '"Maria uploaded 2nd scan. Score: 82 → 48. Review recommended."' },
            { icon: "red", label: "⚠️ Red flag", msg: '"Ricardo Dela Cruz: hs-CRP >10. Medical review required."' },
            { icon: "gold", label: "Weekly digest", msg: '"3 patients due for scans. 2 trial protocols expiring this week."' },
          ].map(({ icon, label, msg }) => {
            const color = icon === "red" ? "var(--doc-red)" : icon === "green" ? "var(--doc-green)" : icon === "gold" ? "var(--doc-gold)" : "var(--doc-blue)";
            const bg = icon === "red" ? "rgba(212,32,32,.08)" : icon === "green" ? "rgba(92,184,130,.08)" : icon === "gold" ? "rgba(232,178,48,.08)" : "rgba(59,130,200,.08)";
            return (
              <div key={label} className="viber-msg-preview">
                <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 750, color: "rgba(255,255,255,.70)" }}>{label}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.62)", marginTop: 2 }}>{msg}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
