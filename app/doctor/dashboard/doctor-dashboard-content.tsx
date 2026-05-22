"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  history?: HistoryEvent[];
  patientNote?: string;
  patientNoteDate?: string;
  lastMsgDate?: number;
  approved?: boolean;
  approvalType?: string;
  approvalDate?: string;
  referred?: boolean;
  firstReviewDone?: boolean;
};

type Request = {
  id: string;
  name: string;
  age: number;
  sex: "F" | "M";
  score: number;
  protocol: ProtocolKey;
  source: "referral" | "clinic" | "online";
  referredBy?: string;
  note?: string;
  risk: string;
  riskCol: string;
  mkv: { k: string; v: string; u: string; hi: boolean }[];
  lab: string;
  scanDate: string;
  requestedAt: number;
  deadline: number;
  status: "pending" | "accepted" | "declined";
};

type PortalView = "dashboard" | "detail" | "request" | "science" | "viber" | "redeem" | "confirm" | "receipt";
type DetailTab = "summary" | "history";
type RedeemMethod = "gcash" | "bank" | "clinic";

type HistoryEvent = {
  type: "pt_scan" | "pt_symptom" | "note" | "obs" | "pt_enroll" | "pt_upgrade" | "approval" | "reminder" | "pt_inactive" | "checkin-sent" | "upgrade-sent" | "msg_sent";
  text: string;
  date: string;
  mk?: Record<string, number>;
  lab?: string;
  label?: string;
  by?: string;
  action?: string;
};

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
    note: "Mild inflammation pattern",
    lab: "Hi-Precision Diagnostics",
    scanDate: "Mar 2, 2026",
    lastEvent: "Uploaded 2nd scan - GLIS 82 to 48",
    status: "improving",
    patientNote: "Your markers are trending well. Stay consistent.",
    patientNoteDate: "Mar 15",
    history: [
      { type: "pt_symptom", text: "Bloating almost gone. Sleeping much better.", date: "Mar 22" },
      { type: "pt_scan", text: "Uploaded 2nd scan — Score: 82 → 48", date: "Mar 20", mk: { crp: 2.1, wbc: 7.1, neut: 58, lymph: 28, glu: 102, trig: 175, hdl: 42, alt: 36 }, lab: "Hi-Precision Diagnostics" },
      { type: "obs", text: "Energy improved, bloating reduced", date: "Mar 15" },
      { type: "note", text: "Your markers are trending well. Stay consistent.", date: "Mar 15" },
      { type: "pt_symptom", text: "Slight improvement in energy. Still bloated.", date: "Mar 10" },
      { type: "pt_enroll", text: "Enrolled in Grow Protocol", date: "Mar 2" },
      { type: "obs", text: "Initial assessment — fatigue and bloating pattern", date: "Mar 2" },
    ],
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
    history: [
      { type: "pt_enroll", text: "Enrolled in Power Protocol", date: "Mar 5" },
    ],
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
    note: "Gut imbalance pattern",
    lab: "Hi-Precision Diagnostics",
    scanDate: "Mar 3, 2026",
    lastEvent: "Uploaded 3rd scan - GLIS 64 to 32",
    status: "improving",
    patientNote: "Great improvement. Continue Power Protocol.",
    patientNoteDate: "Mar 18",
    history: [
      { type: "pt_symptom", text: "Feeling the best I have in years. No more discomfort.", date: "Mar 22" },
      { type: "pt_scan", text: "Uploaded 3rd scan — Score: 64 → 32", date: "Mar 20", mk: { crp: 0.8, wbc: 6.2, neut: 52, lymph: 34, glu: 88, trig: 120, hdl: 55, alt: 24 }, lab: "Hi-Precision Diagnostics" },
      { type: "note", text: "Great improvement. Continue Power Protocol.", date: "Mar 18" },
      { type: "obs", text: "Digestion improved, bowel regularity restored", date: "Mar 18" },
      { type: "pt_symptom", text: "Digestion getting better. Less gas after meals.", date: "Mar 12" },
      { type: "pt_enroll", text: "Enrolled in Power Protocol", date: "Mar 3" },
      { type: "obs", text: "Initial — digestive discomfort, irregular bowel", date: "Mar 3" },
    ],
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
    note: "Mild inflammatory burden",
    lab: "Philippine Red Cross",
    scanDate: "Mar 20, 2026",
    lastEvent: "Trial Day 4 check-in received",
    status: "trial",
    history: [
      { type: "pt_symptom", text: "Energy slightly better. Will I need a full protocol?", date: "Mar 22" },
      { type: "pt_enroll", text: "Enrolled in Trial Protocol", date: "Mar 20" },
    ],
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
    note: "Sleep disruption + gut imbalance",
    lab: "Hi-Precision Diagnostics",
    scanDate: "Mar 8, 2026",
    lastEvent: "Patient reports sleep improvement",
    status: "steady",
    history: [
      { type: "pt_symptom", text: "Still bloated but sleeping a bit better.", date: "Mar 16" },
      { type: "pt_enroll", text: "Enrolled in Grow Protocol", date: "Mar 8" },
    ],
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
    history: [
      { type: "pt_inactive", text: "No check-in for 10 days", date: "Mar 20" },
      { type: "pt_enroll", text: "Enrolled in Start Protocol", date: "Mar 10" },
    ],
  },
  {
    id: 7,
    name: "Elena Villanueva",
    age: 45,
    sex: "F",
    protocol: "grow",
    score: 65,
    daysOn: 12,
    symptoms: "Poor Sleep, Low Energy",
    note: "Inflammation with sleep disruption",
    lab: "MedLab GenSan",
    scanDate: "Mar 12, 2026",
    lastEvent: "Enrolled in Grow Protocol",
    status: "steady",
    history: [
      { type: "pt_enroll", text: "Enrolled in Grow Protocol", date: "Mar 12" },
    ],
  },
];

const redemptionMethods: Record<RedeemMethod, { name: string; description: string; processing: string; badge?: string }> = {
  gcash: { name: "GCash", description: "Instant transfer", processing: "Instant", badge: "Most used" },
  bank: { name: "Bank Transfer", description: "1-2 business days", processing: "1-2 days" },
  clinic: { name: "Clinic Supplies", description: "Applied to next order", processing: "Next order" },
};

const initialRequests: Request[] = [
  {
    id: "req_001",
    name: "Rosa Santos",
    age: 52,
    sex: "F",
    score: 81,
    protocol: "grow",
    source: "referral",
    referredBy: "Maria Santos",
    note: "My friend Maria referred me. I have been very tired and my joints ache.",
    risk: "High Risk",
    riskCol: "#D42020",
    mkv: [
      { k: "CRP", v: "4.2", u: "mg/L", hi: true },
      { k: "Uric Acid", v: "7.8", u: "mg/dL", hi: true },
      { k: "Triglycerides", v: "218", u: "mg/dL", hi: true },
    ],
    lab: "Hi-Precision Diagnostics",
    scanDate: "Apr 4, 2026",
    requestedAt: Date.now() - 3 * 3600000,
    deadline: Date.now() + 21 * 3600000,
    status: "pending",
  },
  {
    id: "req_002",
    name: "Jun Dela Cruz",
    age: 44,
    sex: "M",
    score: 74,
    protocol: "grow",
    source: "clinic",
    note: "Scanned at your clinic today. Waiting for your guidance, Doc.",
    risk: "Moderate Risk",
    riskCol: "#E8772E",
    mkv: [
      { k: "CRP", v: "2.8", u: "mg/L", hi: true },
      { k: "Glucose", v: "114", u: "mg/dL", hi: true },
      { k: "HDL", v: "38", u: "mg/dL", hi: true },
    ],
    lab: "MedLab GenSan",
    scanDate: "Apr 4, 2026",
    requestedAt: Date.now() - 1 * 3600000,
    deadline: Date.now() + 23 * 3600000,
    status: "pending",
  },
  {
    id: "req_003",
    name: "Perla Ramos",
    age: 61,
    sex: "F",
    score: 68,
    protocol: "start",
    source: "online",
    risk: "Moderate Risk",
    riskCol: "#E8772E",
    mkv: [
      { k: "WBC", v: "11.2", u: "×10⁹/L", hi: true },
      { k: "Lymphocytes", v: "42", u: "%", hi: true },
      { k: "Glucose", v: "108", u: "mg/dL", hi: true },
    ],
    lab: "Philippine Red Cross GenSan",
    scanDate: "Apr 3, 2026",
    requestedAt: Date.now() - 18 * 3600000,
    deadline: Date.now() + 6 * 3600000,
    status: "pending",
  },
];

const dashboardStyles = `
@property --ra{syntax:'<angle>';initial-value:0deg;inherits:false}
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
@keyframes reqSlideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.queue-list{margin-bottom:12px}
.wq-item{display:flex;align-items:center;gap:12px;padding:11px 13px;background:var(--doc-white);border-radius:12px;margin-bottom:7px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.06);border:1px solid rgba(0,0,0,.05);transition:transform .1s,box-shadow .1s;width:100%;text-align:left;font-family:var(--doc-font);-webkit-tap-highlight-color:transparent}
.wq-item:active{transform:scale(.99);box-shadow:0 1px 2px rgba(0,0,0,.04)}
.wq-icon{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.wq-name{font-size:14px;font-weight:700;color:var(--doc-d1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wq-sub{font-size:12px;font-weight:400;color:var(--doc-d3);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wq-badge{font-size:12px;font-weight:700;padding:3px 9px;border-radius:8px;flex-shrink:0;white-space:nowrap}
.all-clear{display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(92,184,130,.04);border:1px solid rgba(92,184,130,.10);border-radius:12px;margin-bottom:12px;font-size:14px;color:var(--doc-d2)}
.today-notices{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
.today-notice{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px}
.today-notice-icon{width:24px;height:24px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.today-notice span{font-size:15px;color:var(--doc-d1)}
.search-wrap{position:relative;margin-bottom:14px}
.search-wrap svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:rgba(0,0,0,.3)}
.search-wrap input{width:100%;padding:12px 14px 12px 38px;border:1.5px solid var(--doc-lt2);border-radius:12px;background:var(--doc-white);font:500 15px var(--doc-font);color:var(--doc-d1);outline:0;transition:border-color .15s}
.search-wrap input:focus{border-color:rgba(59,130,200,.35)}
.req-screen{min-height:100vh;min-height:100dvh;background:var(--doc-lt);animation:detailIn .28s cubic-bezier(.32,1,.68,1) both}
.req-sticky-nav{position:sticky;top:0;z-index:10;background:rgba(243,242,239,.95);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
.req-nav-row{padding:16px 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--doc-lt2)}
.req-body{padding:16px 24px 100px}
.req-accept-btn{width:100%;min-height:52px;border-radius:12px;border:none;font-size:15px;font-weight:700;font-family:var(--doc-font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:transform .1s,box-shadow .1s;background:var(--doc-green);color:#fff;box-shadow:0 4px 18px rgba(92,184,130,.28)}
.req-accept-btn:active{transform:scale(.97)}
.req-decline-btn{flex:1;padding:15px;border-radius:12px;border:1.5px solid var(--doc-lt3);background:none;color:var(--doc-d3);font-size:14px;font-weight:700;font-family:var(--doc-font);cursor:pointer;min-height:52px}
.mkv-pill{padding:6px 11px;border-radius:10px;background:rgba(212,32,32,.05);border:1px solid rgba(212,32,32,.14);display:inline-flex;align-items:baseline;gap:3px}
.req-reason-chip{padding:7px 13px;border-radius:10px;border:1.5px solid var(--doc-lt3);background:var(--doc-white);color:var(--doc-d3);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--doc-font);transition:all .15s;display:inline-block;margin:0 5px 5px 0}
.req-reason-chip.on{border-color:var(--doc-red);background:rgba(212,32,32,.05);color:var(--doc-red)}
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
@keyframes detailIn{from{opacity:0;transform:scale(.97) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
.detail-screen{background:var(--doc-lt);min-height:100vh;min-height:100dvh;animation:detailIn .28s cubic-bezier(.32,1,.68,1) both}
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
.dr-ring{position:relative;flex-shrink:0}
.dr-ring-trk{position:absolute;inset:0;border-radius:50%;background:rgba(255,255,255,.08);-webkit-mask:radial-gradient(closest-side,transparent 84%,#000 84.5%,#000 96%,transparent 96.5%);mask:radial-gradient(closest-side,transparent 84%,#000 84.5%,#000 96%,transparent 96.5%)}
.dr-ring-trk-lt{position:absolute;inset:0;border-radius:50%;background:rgba(0,0,0,.06);-webkit-mask:radial-gradient(closest-side,transparent 84%,#000 84.5%,#000 96%,transparent 96.5%);mask:radial-gradient(closest-side,transparent 84%,#000 84.5%,#000 96%,transparent 96.5%)}
.dr-ring-fill{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 180deg,#5CB882 0%,#7EBC6C 14%,#9AB854 28%,#C4B044 42%,#D4A840 52%,#CC8844 66%,#CC6E48 78%,#D03030 90%,#D42020 100%);-webkit-mask-image:radial-gradient(closest-side,transparent 84%,#000 84.5%,#000 96%,transparent 96.5%),conic-gradient(from 180deg,#000 var(--ra),transparent var(--ra));-webkit-mask-composite:source-in;mask-image:radial-gradient(closest-side,transparent 84%,#000 84.5%,#000 96%,transparent 96.5%),conic-gradient(from 180deg,#000 var(--ra),transparent var(--ra));mask-composite:intersect;transition:--ra 1.2s cubic-bezier(.32,1,.68,1)}
@supports not (mask-composite:intersect){.dr-ring-fill{-webkit-mask-image:radial-gradient(closest-side,transparent 84%,#000 84.5%,#000 96%,transparent 96.5%);mask-image:radial-gradient(closest-side,transparent 84%,#000 84.5%,#000 96%,transparent 96.5%)}}
.dr-ring-c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.pt-card{background:var(--doc-white);border-radius:20px;margin-bottom:8px;box-shadow:0 1px 3px rgba(0,0,0,.02);overflow:hidden;transition:transform .12s,box-shadow .12s;cursor:pointer;border:none;width:100%;text-align:left;font-family:var(--doc-font);color:inherit}
.pt-card:active{transform:scale(.98);box-shadow:0 2px 8px rgba(0,0,0,.04)}
.pt-card-danger{background:linear-gradient(160deg,rgba(212,32,32,.025) 0%,var(--doc-white) 60%);border-left:3px solid var(--doc-red)}
.pt-card-warn{background:linear-gradient(160deg,rgba(232,178,48,.03) 0%,var(--doc-white) 60%);border-left:3px solid var(--doc-gold)}
.pt-card-ok{border-left:3px solid var(--doc-green)}
.pt-card-std{border-left:3px solid var(--doc-lt3)}
.pt-card-body{padding:13px 15px 11px}
.pt-card-name{font-size:17px;font-weight:700;color:var(--doc-d1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0}
.pt-card-meta{font-size:14px;font-weight:400;color:var(--doc-d3);margin-top:2px}
.pt-card-badge{display:inline-flex;align-items:center;font-size:12px;font-weight:700;padding:2px 7px;border-radius:8px;flex-shrink:0}
.pt-card-bar{height:2px;background:var(--doc-lt2);border-radius:2px;overflow:hidden;margin-top:10px}
.pt-card-bar-fill{height:100%;border-radius:2px;transition:width .8s cubic-bezier(.32,1,.68,1)}
.pt-card-action{padding:0 15px 11px}
.pt-card-cta{width:100%;padding:8px 12px;border-radius:10px;font-size:14px;font-weight:700;font-family:var(--doc-font);cursor:pointer;border:1.5px solid transparent;background:transparent;transition:transform .1s}
.pt-card-cta:active{transform:scale(.97)}
.action-btn-red{background:rgba(212,32,32,.08);border-color:rgba(212,32,32,.2);color:var(--doc-red)}
.action-btn-grn{background:rgba(92,184,130,.08);border-color:rgba(92,184,130,.2);color:var(--doc-green)}
.action-btn-gld{background:rgba(232,178,48,.08);border-color:rgba(232,178,48,.2);color:var(--doc-gold)}
.action-btn-bl{background:rgba(59,130,200,.08);border-color:rgba(59,130,200,.2);color:var(--doc-blue)}
.domain-bar{height:6px;border-radius:8px;background:rgba(0,0,0,.04);overflow:hidden}
.domain-bar-fill{height:100%;border-radius:8px;transition:width 1s cubic-bezier(.32,1,.68,1)}
@keyframes detailEnter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.detail-enter{animation:detailEnter .35s cubic-bezier(.32,1,.68,1) both}
@keyframes panelIn{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
.panel-in{animation:panelIn .2s cubic-bezier(.32,1,.68,1) both}
@keyframes cardIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.pt-card{animation:cardIn .3s cubic-bezier(.32,1,.68,1) both}
`;

export function DoctorDashboardContent() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { logout } = useLogout();
  const [query, setQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(patients[0]?.id ?? null);
  const [patientOverrides, setPatientOverrides] = useState<Record<number, Partial<Patient>>>({});
  const [acceptedPatients, setAcceptedPatients] = useState<Patient[]>([]);
  const [requestList, setRequestList] = useState<Request[]>(initialRequests);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
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
  const allPatients = useMemo(() => [
    ...patients.map((p) => ({ ...p, ...patientOverrides[p.id] })),
    ...acceptedPatients.map((p) => ({ ...p, ...patientOverrides[p.id] })),
  ], [patientOverrides, acceptedPatients]);
  const pendingRequests = requestList.filter((r) => r.status === "pending");
  const reviewPatients = allPatients.filter((p) => p.score >= 75 && !p.approved && !p.referred);
  const improvingPatients = allPatients.filter((p) => p.baseline && p.baseline > p.score);
  const trialEndingPatients = allPatients.filter((p) => p.protocol === "trial" && p.daysOn >= 4 && !p.referred);
  const inactivePatients = allPatients.filter((p) => p.history?.[0]?.type === "pt_inactive");
  const bigImprovementPatients = allPatients.filter((p) => p.baseline && (p.baseline - p.score) >= 10 && !p.patientNote);
  const totalCredits = allPatients.reduce((sum, patient) => sum + protocols[patient.protocol].credits, 0);
  const redeemedCredits = 15000;
  const availableCredits = Math.max(0, totalCredits - redeemedCredits);
  const getPatient = (id: number) => {
    const base = [...patients, ...acceptedPatients].find((p) => p.id === id);
    if (!base) return base;
    return { ...base, ...patientOverrides[id] };
  };
  const selectedPatient = getPatient(selectedPatientId ?? patients[0]?.id) ?? patients[0];
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
    setSelectedPatientId(id);
    setDetailTab("summary");
    setPortalView("detail");
  };

  const applyPatientOverride = (id: number, override: Partial<Patient>) => {
    setPatientOverrides((prev) => {
      const current = prev[id] || {};
      return { ...prev, [id]: { ...current, ...override } };
    });
  };

  const handleApproveProtocol = (id: number, action: "approve" | "modify") => {
    const labels: Record<string, string> = { approve: "Approved", modify: "Approved (Modified Dose)" };
    const approvalDate = new Date().toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
    const approvalType = labels[action];
    const histEvent: HistoryEvent = { type: "approval", text: `Protocol ${approvalType}`, label: approvalType, by: `Dr. ${doctorName}`, date: approvalDate, action };
    const base = [...patients, ...acceptedPatients].find((p) => p.id === id);
    const current = patientOverrides[id] || {};
    applyPatientOverride(id, {
      approved: true,
      approvalType,
      approvalDate,
      history: [histEvent, ...(current.history || base?.history || [])],
    });
  };

  const handleSendNote = (id: number, text: string) => {
    const date = new Date().toLocaleDateString("en-PH", { month: "short", day: "numeric" });
    const histEvent: HistoryEvent = { type: "note", text, date };
    const base = [...patients, ...acceptedPatients].find((p) => p.id === id);
    const current = patientOverrides[id] || {};
    applyPatientOverride(id, {
      patientNote: text,
      patientNoteDate: date,
      lastMsgDate: Date.now(),
      history: [histEvent, ...(current.history || base?.history || [])],
    });
  };

  const handleSaveObs = (id: number, chips: string[], note: string) => {
    const date = new Date().toLocaleDateString("en-PH", { month: "short", day: "numeric" });
    const text = chips.length ? chips.join(", ") + (note ? " — " + note : "") : note || "General observation";
    const histEvent: HistoryEvent = { type: "obs", text, date };
    const base = [...patients, ...acceptedPatients].find((p) => p.id === id);
    const current = patientOverrides[id] || {};
    applyPatientOverride(id, {
      history: [histEvent, ...(current.history || base?.history || [])],
    });
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

  const workQueueItems = useMemo(() => {
    type WqItem = { key: string; iconBg: string; iconColor: string; iconType: "user-plus" | "alert" | "clock" | "pause" | "trend"; name: string; sub: string; badge: string; badgeColor: string; onClick: () => void };
    const items: WqItem[] = [];
    pendingRequests.slice(0, 2).forEach((r) => {
      items.push({ key: r.id, iconBg: "rgba(59,130,200,.12)", iconColor: "var(--doc-blue)", iconType: "user-plus", name: r.name, sub: `${r.age}${r.sex} · GLIS ${r.score} · ${protocols[r.protocol].name}`, badge: "New request", badgeColor: "var(--doc-blue)", onClick: () => { setSelectedRequestId(r.id); setPortalView("request"); } });
    });
    reviewPatients.forEach((p) => {
      items.push({ key: `review-${p.id}`, iconBg: "rgba(212,32,32,.12)", iconColor: "var(--doc-red)", iconType: "alert", name: p.name, sub: `${p.age}${p.sex} · GLIS ${p.score} · ${protocols[p.protocol].name}`, badge: "Review →", badgeColor: "var(--doc-red)", onClick: () => openDetail(p.id) });
    });
    trialEndingPatients.forEach((p) => {
      items.push({ key: `trial-${p.id}`, iconBg: "rgba(212,168,64,.10)", iconColor: "var(--doc-gold)", iconType: "clock", name: p.name, sub: `Trial ending · Day ${p.daysOn} · GLIS ${p.score}`, badge: "Upgrade →", badgeColor: "var(--doc-gold)", onClick: () => openDetail(p.id) });
    });
    inactivePatients.slice(0, 2).forEach((p) => {
      items.push({ key: `inactive-${p.id}`, iconBg: "rgba(232,119,46,.10)", iconColor: "var(--doc-orange)", iconType: "pause", name: p.name, sub: `Inactive · Day ${p.daysOn} of ${protocols[p.protocol].days}`, badge: "Check in →", badgeColor: "var(--doc-orange)", onClick: () => openDetail(p.id) });
    });
    bigImprovementPatients.slice(0, 1).forEach((p) => {
      const drop = p.baseline! - p.score;
      items.push({ key: `improve-${p.id}`, iconBg: "rgba(92,184,130,.10)", iconColor: "var(--doc-green)", iconType: "trend", name: p.name, sub: `↓${drop} pts improvement · Day ${p.daysOn}`, badge: "Send note", badgeColor: "var(--doc-green)", onClick: () => openDetail(p.id) });
    });
    return items.slice(0, 6);
  }, [pendingRequests, reviewPatients, trialEndingPatients, inactivePatients, bigImprovementPatients]);

  const handleAcceptRequest = (rid: string) => {
    const req = requestList.find((r) => r.id === rid);
    if (!req) return;
    const enrollDate = new Date().toLocaleDateString("en-PH", { month: "short", day: "numeric" });
    const newPt: Patient = {
      id: Date.now(),
      name: req.name,
      age: req.age,
      sex: req.sex,
      protocol: req.protocol,
      score: req.score,
      baseline: req.score,
      daysOn: 0,
      symptoms: req.mkv.map((m) => m.k).join(", "),
      note: "Accepted from request",
      lab: req.lab,
      scanDate: req.scanDate,
      lastEvent: "Accepted",
      status: "review",
      history: [{ type: "pt_enroll", text: `Accepted — ${protocols[req.protocol].name} Protocol assigned`, date: enrollDate }],
    };
    setAcceptedPatients((prev) => [...prev, newPt]);
    setRequestList((prev) => prev.map((r) => r.id === rid ? { ...r, status: "accepted" as const } : r));
    setPortalView("dashboard");
  };

  const handleDeclineRequest = (rid: string) => {
    setRequestList((prev) => prev.map((r) => r.id === rid ? { ...r, status: "declined" as const } : r));
    setPortalView("dashboard");
  };

  const weekCredits = allPatients
    .filter((p) => p.daysOn <= 7)
    .reduce((sum, p) => sum + protocols[p.protocol].credits, 0);
  const trialEndingCount = trialEndingPatients.length;

  const filteredPatients = useMemo(() => {
    const search = query.trim().toLowerCase();
    const list = search
      ? allPatients.filter((patient) =>
          [patient.name, patient.symptoms, protocols[patient.protocol].name, patient.lab]
            .join(" ")
            .toLowerCase()
            .includes(search)
        )
      : allPatients;
    return list.slice().sort((a, b) => {
      const aImp = a.baseline ? a.baseline - a.score : 0;
      const bImp = b.baseline ? b.baseline - b.score : 0;
      if (aImp > 0 && bImp <= 0) return -1;
      if (bImp > 0 && aImp <= 0) return 1;
      return b.score - a.score;
    });
  }, [query, allPatients]);

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

        {portalView === "request" && selectedRequestId ? (
          <RequestDetailScreen
            request={requestList.find((r) => r.id === selectedRequestId)!}
            onBack={() => setPortalView("dashboard")}
            onAccept={handleAcceptRequest}
            onDecline={handleDeclineRequest}
          />
        ) : null}

        {portalView === "detail" && selectedPatient ? (
          <PatientDetailScreen
            patient={selectedPatient}
            email={user?.email ?? profile?.email ?? ""}
            tab={detailTab}
            onTabChange={setDetailTab}
            onBack={() => setPortalView("dashboard")}
            onApprove={(action) => handleApproveProtocol(selectedPatient.id, action)}
            onSendNote={(text) => handleSendNote(selectedPatient.id, text)}
            onSaveObs={(chips, note) => handleSaveObs(selectedPatient.id, chips, note)}
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
                <strong>{allPatients.length}</strong>
                <span>patients</span>
              </div>
              <div className={reviewPatients.length ? "hero-sub review" : "hero-sub"}>
                {reviewPatients.length
                  ? `${reviewPatients.length} patient${reviewPatients.length > 1 ? "s" : ""} need${reviewPatients.length === 1 ? "s" : ""} review${pendingRequests.length ? ` · ${pendingRequests.length} new request${pendingRequests.length > 1 ? "s" : ""}` : ""}`
                  : pendingRequests.length ? `${pendingRequests.length} new request${pendingRequests.length > 1 ? "s" : ""} pending` : "All patients on track"}
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
              <button className="urgent-banner" type="button" onClick={() => openDetail(reviewPatients[0].id)}>
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
              <strong>{pendingRequests.length}</strong>
              <span>Requests</span>
            </div>
          </div>
        </header>

        <main className="content-card">
          {/* Work queue — urgency-first */}
          <section className="queue-list">
            {workQueueItems.length === 0 && allPatients.length > 0 ? (
              <div className="all-clear">
                <CheckIcon size={13} /> All patients on track. Nothing urgent today.
              </div>
            ) : null}
            {workQueueItems.map((item, idx) => (
              <WqItem key={item.key} item={item} delay={idx * 60} />
            ))}
          </section>

          {/* Today notices — credits / trial summary */}
          {(weekCredits > 0 || trialEndingCount > 0) ? (
            <div className="today-notices">
              {weekCredits > 0 ? (
                <div className="today-notice" style={{ background: "rgba(92,184,130,.04)", border: "1px solid rgba(92,184,130,.08)" }}>
                  <div className="today-notice-icon" style={{ background: "rgba(92,184,130,.10)", color: "var(--doc-green)" }}><ClockIcon /></div>
                  <span><strong style={{ color: "var(--doc-green)" }}>{formatNumber(weekCredits)} credits</strong> earned this week</span>
                </div>
              ) : null}
              {trialEndingCount > 0 ? (
                <div className="today-notice" style={{ background: "rgba(212,168,64,.04)", border: "1px solid rgba(212,168,64,.08)" }}>
                  <div className="today-notice-icon" style={{ background: "rgba(212,168,64,.10)", color: "var(--doc-gold)" }}><ClockIcon /></div>
                  <span><strong style={{ color: "var(--doc-gold)" }}>{trialEndingCount} trial{trialEndingCount > 1 ? "s" : ""} ending</strong> — review continuation</span>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="search-wrap">
            <SearchIcon />
            <input
              type="search"
              placeholder="Search patients..."
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
          </div>

          <section aria-labelledby="patients-heading" style={{ marginTop: 14 }}>
            <div className="section-label" id="patients-heading">Patients</div>
            {filteredPatients.length ? (
              filteredPatients.map((patient, idx) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  index={idx}
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
            GutGuard Protocol · Licensed Lifestyle Supplement · © 2026 GutGuard Philippines<br />
            SEC Registration · FDA Notification · LTO License
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


function DrRing({ score, size, numSize, dark }: { score: number; size: number; numSize: number; dark: boolean }) {
  const col = sColDr(score);
  const targetDeg = score * 3.6;
  const [ra, setRa] = useState(0);

  useEffect(() => {
    // Double rAF: first frame paints at 0, second frame triggers the CSS transition
    let f1: number, f2: number;
    f1 = requestAnimationFrame(() => {
      f2 = requestAnimationFrame(() => setRa(targetDeg));
    });
    return () => { cancelAnimationFrame(f1); cancelAnimationFrame(f2); };
  }, [targetDeg]);

  return (
    <div className="dr-ring" style={{ width: size, height: size }}>
      <div className={dark ? "dr-ring-trk" : "dr-ring-trk-lt"} />
      <div className="dr-ring-fill" style={{ "--ra": `${ra}deg` } as React.CSSProperties} />
      <div className="dr-ring-c">
        <span style={{ fontSize: numSize, fontWeight: 800, color: col, lineHeight: 1 }}>{score}</span>
      </div>
    </div>
  );
}

function PatientCard({ patient, index, onOpen }: { patient: Patient; index: number; onOpen: () => void }) {
  const protocol = protocols[patient.protocol];
  const drop = patient.baseline ? patient.baseline - patient.score : 0;
  const progress = protocol.days > 0 ? Math.min(100, Math.round((patient.daysOn / protocol.days) * 100)) : 0;
  const col = sColDr(patient.score);
  const [barReady, setBarReady] = useState(false);

  useEffect(() => {
    let f1: number, f2: number;
    f1 = requestAnimationFrame(() => { f2 = requestAnimationFrame(() => setBarReady(true)); });
    return () => { cancelAnimationFrame(f1); cancelAnimationFrame(f2); };
  }, []);

  const isHighRisk = patient.score >= 70 && !patient.approved;
  const isTrialEnding = patient.protocol === "trial" && patient.daysOn >= 4;
  const isInactive = patient.history?.[0]?.type === "pt_inactive";
  const daysLeft = Math.max(0, protocol.days - patient.daysOn);
  const scanDue = patient.daysOn > 0 && daysLeft <= 5 && patient.protocol !== "trial";

  const cardClass = isHighRisk
    ? "pt-card pt-card-danger"
    : isTrialEnding || isInactive
    ? "pt-card pt-card-warn"
    : drop > 0
    ? "pt-card pt-card-ok"
    : "pt-card pt-card-std";

  let badge = "", badgeCol = "";
  if (isHighRisk) { badge = "⚠ Review"; badgeCol = "var(--doc-red)"; }
  else if (isTrialEnding) { badge = "⏰ Trial ending"; badgeCol = "var(--doc-gold)"; }
  else if (isInactive) { badge = "Inactive"; badgeCol = "var(--doc-orange)"; }
  else if (drop > 0) { badge = `↓${drop} pts`; badgeCol = "var(--doc-green)"; }
  else if (scanDue) { badge = "Scan due"; badgeCol = "var(--doc-blue)"; }

  let actionLabel = "", actionCls = "pt-card-cta action-btn-bl";
  if (isTrialEnding) { actionLabel = "View trial status →"; actionCls = "pt-card-cta action-btn-gld"; }
  else if (isHighRisk) { actionLabel = "Review →"; actionCls = "pt-card-cta action-btn-red"; }
  else if (isInactive) { actionLabel = "Send check-in"; actionCls = "pt-card-cta action-btn-gld"; }
  else if (scanDue && !patient.baseline) { actionLabel = "Remind to scan"; actionCls = "pt-card-cta action-btn-bl"; }
  else if (drop > 0) { actionLabel = "View progress"; actionCls = "pt-card-cta action-btn-grn"; }

  return (
    <button className={cardClass} type="button" onClick={onOpen} style={{ animationDelay: `${index * 55}ms` }}>
      <div className="pt-card-body">
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <DrRing score={patient.score} size={40} numSize={12} dark={false} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
              <div className="pt-card-name">{patient.name}</div>
              {badge ? (
                <div className="pt-card-badge" style={{ color: badgeCol, background: `${badgeCol}18` }}>{badge}</div>
              ) : null}
            </div>
            <div className="pt-card-meta">{protocol.name} · Day {patient.daysOn} · {patient.age}{patient.sex}</div>
          </div>
        </div>
        <div className="pt-card-bar">
          <div className="pt-card-bar-fill" style={{ width: barReady ? `${progress}%` : "0%", background: col }} />
        </div>
      </div>
      <div className="pt-card-action" style={{ visibility: actionLabel ? "visible" : "hidden" }}>
        <button
          type="button"
          className={actionCls}
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          style={{ color: actionLabel ? badgeCol || col : "transparent" }}
        >
          {actionLabel || " "}
        </button>
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

type WqItemData = { key: string; iconBg: string; iconColor: string; iconType: "user-plus" | "alert" | "clock" | "pause" | "trend"; name: string; sub: string; badge: string; badgeColor: string; onClick: () => void };

function WqItem({ item, delay }: { item: WqItemData; delay: number }) {
  const icon = item.iconType === "alert" ? <AlertIcon /> : item.iconType === "clock" ? <ClockIcon /> : item.iconType === "pause" ? <PauseIcon /> : item.iconType === "trend" ? <TrendIcon /> : <UserPlusIcon />;
  return (
    <button className="wq-item" type="button" onClick={item.onClick} style={{ animationName: "reqSlideIn", animationDuration: ".3s", animationTimingFunction: "cubic-bezier(.32,1,.68,1)", animationFillMode: "both", animationDelay: `${delay}ms` }}>
      <div className="wq-icon" style={{ background: item.iconBg, color: item.iconColor }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="wq-name">{item.name}</div>
        <div className="wq-sub">{item.sub}</div>
      </div>
      <div className="wq-badge" style={{ color: item.badgeColor, background: item.iconBg }}>{item.badge}</div>
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

function lC(a: string, b: string, t: number) {
  const p = (x: string) => [parseInt(x.slice(1, 3), 16), parseInt(x.slice(3, 5), 16), parseInt(x.slice(5, 7), 16)];
  const c1 = p(a), c2 = p(b);
  const h = (v: number) => Math.round(v).toString(16).padStart(2, "0");
  return `#${h(c1[0] + (c2[0] - c1[0]) * t)}${h(c1[1] + (c2[1] - c1[1]) * t)}${h(c1[2] + (c2[2] - c1[2]) * t)}`;
}

function sColDr(s: number) {
  if (s <= 25) return lC("#34A853", "#5CB882", s / 25);
  if (s <= 50) return lC("#5CB882", "#E8B230", (s - 25) / 25);
  if (s <= 75) return lC("#E8B230", "#E8772E", (s - 50) / 25);
  return lC("#E8772E", "#D42020", (s - 75) / 25);
}

function imsiCalc(s: number) {
  const inflDomain = Math.min(50, Math.round(s * 0.52));
  const metDomain = Math.min(50, Math.round(s * 0.55));
  const flags: string[] = [];
  if (s >= 75) flags.push("hs-CRP >5");
  if (s >= 85) flags.push("NLR >5");
  if (s >= 90) flags.push("Glucose >125");
  return { inflDomain, metDomain, flags };
}

function getScoreLabel(s: number) {
  if (s <= 25) return "Optimal";
  if (s <= 50) return "Mild inflammation";
  if (s <= 75) return "Moderate inflammation";
  return "High inflammation";
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

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="10" y1="15" x2="10" y2="9" />
      <line x1="14" y1="15" x2="14" y2="9" />
    </svg>
  );
}

function ShareLinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function RequestDetailScreen({
  request,
  onBack,
  onAccept,
  onDecline,
}: {
  request: Request;
  onBack: () => void;
  onAccept: (rid: string) => void;
  onDecline: (rid: string) => void;
}) {
  const [declining, setDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const protocol = protocols[request.protocol];
  const sourceLabel = request.source === "clinic" ? "Clinic QR Scan" : request.source === "referral" ? `Referred by ${request.referredBy}` : "Online Enrollment";
  const sourceColor = request.source === "clinic" ? "rgba(92,184,130,.80)" : request.source === "referral" ? "rgba(59,130,200,.80)" : "rgba(154,151,143,.80)";
  const timeLeft = formatTimeLeft(request.deadline);

  return (
    <div className="req-screen">
      <div className="req-sticky-nav">
        <div className="req-nav-row">
          <button type="button" onClick={onBack} style={{ background: "none", border: "none", fontSize: 16, fontWeight: 700, color: "var(--doc-d3)", padding: "8px 0", cursor: "pointer" }}>← Back</button>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--doc-d1)" }}>New Request</div>
          <div style={{ width: 48 }} />
        </div>
      </div>

      <div className="req-body">
        {/* Hero identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 0 12px" }}>
          <DrRing score={request.score} size={52} numSize={15} dark={false} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--doc-d1)" }}>{request.name}</div>
            <div style={{ fontSize: 14, color: "var(--doc-d3)", marginTop: 3 }}>{request.age}{request.sex} · {request.lab}</div>
            <div style={{ fontSize: 13, color: "var(--doc-d3)" }}>{request.scanDate}</div>
            <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: "rgba(212,32,32,.07)", border: "1px solid rgba(212,32,32,.14)" }}>
              <AlertIcon />
              <span style={{ fontSize: 12, fontWeight: 700, color: request.riskCol }}>{request.risk}</span>
            </div>
          </div>
        </div>

        {/* Source tag */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: sourceColor, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "var(--doc-d3)", fontWeight: 600 }}>{sourceLabel}</span>
          <span style={{ fontSize: 12, color: "var(--doc-d4)", marginLeft: "auto", fontWeight: 700 }}>{timeLeft}</span>
        </div>

        {/* Elevated markers */}
        {request.mkv.length > 0 ? (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--doc-d4)", letterSpacing: ".10em", textTransform: "uppercase", marginBottom: 8 }}>Elevated Markers</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {request.mkv.map((m) => (
                <div key={m.k} className="mkv-pill">
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--doc-red)" }}>{m.k}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "var(--doc-d1)", margin: "0 4px" }}>{m.v}</span>
                  <span style={{ fontSize: 12, color: "var(--doc-d3)" }}>{m.u}</span>
                  {m.hi ? <span style={{ color: "var(--doc-red)", fontSize: 11, fontWeight: 700 }}>↑</span> : null}
                </div>
              ))}
            </div>
          </>
        ) : null}

        {/* Patient note */}
        {request.note ? (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--doc-d4)", letterSpacing: ".10em", textTransform: "uppercase", marginBottom: 8 }}>Patient&apos;s Note</div>
            <div style={{ padding: "12px 14px", background: "var(--doc-lt)", borderRadius: 12, borderLeft: "3px solid var(--doc-blue)", marginBottom: 16 }}>
              <div style={{ fontSize: 15, color: "var(--doc-d2)", lineHeight: 1.6, fontStyle: "italic" }}>&ldquo;{request.note}&rdquo;</div>
            </div>
          </>
        ) : null}

        {/* Referral */}
        {request.referredBy ? (
          <div style={{ padding: "10px 13px", background: "rgba(92,184,130,.05)", border: "1px solid rgba(92,184,130,.12)", borderRadius: 10, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <ShareLinkIcon />
            <span style={{ fontSize: 13, color: "var(--doc-d2)" }}>Referred by <strong>{request.referredBy}</strong></span>
          </div>
        ) : null}

        {/* Protocol */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--doc-d4)", letterSpacing: ".10em", textTransform: "uppercase", marginBottom: 8 }}>Recommended Protocol</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", background: "var(--doc-white)", borderRadius: 12, border: "1px solid var(--doc-lt2)", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--doc-d1)" }}>{protocol.name} Protocol</div>
            <div style={{ fontSize: 13, color: "var(--doc-d3)", marginTop: 2 }}>{protocol.days} days · {protocol.price}</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--doc-green)" }}>₱{formatNumber(protocol.credits)} credits</div>
        </div>

        {/* Accept / Decline */}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="req-accept-btn" style={{ flex: 3 }} type="button" onClick={() => onAccept(request.id)}>
            <CheckIcon size={14} /> Accept Patient
          </button>
          <button className="req-decline-btn" type="button" onClick={() => setDeclining((v) => !v)}>
            {declining ? "Cancel" : "Decline"}
          </button>
        </div>

        {declining ? (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: "var(--doc-d3)", marginBottom: 8 }}>Reason for declining:</div>
            <div>
              {DECLINE_REASONS.map((r) => (
                <button key={r} className={`req-reason-chip${declineReason === r ? " on" : ""}`} type="button" onClick={() => setDeclineReason(r === declineReason ? "" : r)}>{r}</button>
              ))}
            </div>
            {declineReason ? (
              <button type="button" onClick={() => onDecline(request.id)} style={{ marginTop: 12, width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--doc-red)", background: "rgba(212,32,32,.05)", color: "var(--doc-red)", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "var(--doc-font)" }}>
                Confirm decline
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function formatTimeLeft(deadline: number) {
  const ms = deadline - Date.now();
  if (ms <= 0) return "Expired";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h >= 1) return `${h}h ${m}m left`;
  return `${m}m left`;
}

function PatientDetailScreen({
  patient,
  email,
  tab,
  onTabChange,
  onBack,
  onApprove,
  onSendNote,
  onSaveObs,
}: {
  patient: Patient;
  email: string;
  tab: DetailTab;
  onTabChange: (t: DetailTab) => void;
  onBack: () => void;
  onApprove: (action: "approve" | "modify") => void;
  onSendNote: (text: string) => void;
  onSaveObs: (chips: string[], note: string) => void;
}) {
  const [activePanel, setActivePanel] = useState<"message" | "observe" | null>(null);
  const [noteText, setNoteText] = useState("");
  const [obsChips, setObsChips] = useState<string[]>([]);
  const [obsNote, setObsNote] = useState("");
  const [expandedScans, setExpandedScans] = useState<Set<number>>(new Set());
  const [domainsReady, setDomainsReady] = useState(false);
  useEffect(() => {
    let f1: number, f2: number;
    f1 = requestAnimationFrame(() => { f2 = requestAnimationFrame(() => setDomainsReady(true)); });
    return () => { cancelAnimationFrame(f1); cancelAnimationFrame(f2); };
  }, []);

  const protocol = protocols[patient.protocol];
  const drop = patient.baseline ? patient.baseline - patient.score : 0;
  const col = sColDr(patient.score);
  const imsi = imsiCalc(patient.score);
  const hasFlags = patient.score >= 75;

  // Scan stepper: pull pt_scan events from history
  const scanHistory: { score: number; date: string; col: string }[] = [];
  const rawScans = (patient.history || []).filter((e) => e.type === "pt_scan").slice().reverse();
  rawScans.forEach((e) => {
    const m = e.text?.match(/(\d+)\s*[→—>]\s*(\d+)/);
    if (m) {
      if (scanHistory.length === 0) scanHistory.push({ score: parseInt(m[1]), date: e.date, col: sColDr(parseInt(m[1])) });
      scanHistory.push({ score: parseInt(m[2]), date: e.date, col: sColDr(parseInt(m[2])) });
    } else {
      scanHistory.push({ score: patient.score, date: e.date, col });
    }
  });
  if (!scanHistory.length) {
    if (patient.baseline) scanHistory.push({ score: patient.baseline, date: patient.scanDate, col: sColDr(patient.baseline) });
    scanHistory.push({ score: patient.score, date: patient.baseline ? "Latest" : patient.scanDate, col });
  }
  const numDots = Math.min(3, Math.max(scanHistory.length, 1));
  const ordinals = ["1st", "2nd", "3rd"];

  const ptSymptoms = (patient.history || []).filter((e) => e.type === "pt_symptom");
  const isHighRisk = patient.score >= 75 && !patient.approved && !patient.referred;

  // Sticky action
  const isTrialEnding = patient.protocol === "trial" && patient.daysOn >= 4;
  const isInactive = patient.history?.[0]?.type === "pt_inactive";
  const bigDrop = drop >= 10;

  let stickyLabel = "", stickyBg = "var(--doc-blue)", stickyGhost = false;
  if (isHighRisk) { stickyLabel = "Review & approve protocol"; stickyBg = "var(--doc-red)"; }
  else if (bigDrop && !patient.patientNote) { stickyLabel = "Send progress note"; stickyBg = "rgba(92,184,130,1)"; }
  else if (isTrialEnding) { stickyLabel = "Recommend protocol upgrade"; stickyBg = "var(--doc-gold)"; }
  else if (isInactive) { stickyLabel = "Send check-in"; stickyBg = "var(--doc-orange)"; }
  else { stickyLabel = "View full history"; stickyGhost = true; }

  const OBS_CHIPS = ["Fatigue", "Poor Sleep", "Bloating", "Brain Fog", "Low Energy", "Improved"];

  const toggleObsChip = (chip: string) => {
    setObsChips((prev) => prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]);
  };

  const submitNote = () => {
    if (!noteText.trim()) return;
    onSendNote(noteText.trim());
    setNoteText("");
    setActivePanel(null);
  };

  const submitObs = () => {
    onSaveObs(obsChips, obsNote.trim());
    setObsChips([]);
    setObsNote("");
    setActivePanel(null);
  };

  const toggleScanMarkers = (idx: number) => {
    setExpandedScans((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const MK_NAMES: Record<string, string> = { crp: "CRP", wbc: "WBC", neut: "Neut%", lymph: "Lymph%", glu: "Glucose", trig: "Trig", hdl: "HDL", alt: "ALT" };
  const MK_UNITS: Record<string, string> = { crp: "mg/L", wbc: "×10³/µL", neut: "%", lymph: "%", glu: "mg/dL", trig: "mg/dL", hdl: "mg/dL", alt: "U/L" };

  return (
    <div className="detail-screen">
      {/* Sticky nav */}
      <div className="detail-sticky-nav">
        <div className="detail-nav-row">
          <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 16, fontWeight: 750, color: "var(--doc-d3)", padding: "8px 0", cursor: "pointer" }}>← Back</button>
          <div style={{ fontSize: 16, fontWeight: 850, color: "var(--doc-d1)" }}>{patient.name}</div>
          <div style={{ width: 48 }} />
        </div>
        <div className="detail-score-strip">
          <span style={{ fontWeight: 800, color: col }}>{patient.score} GLIS</span>
          <span style={{ color: "var(--doc-d4)", margin: "0 4px" }}>·</span>
          <span style={{ color: "var(--doc-d3)" }}>{protocol.name} · Day {patient.daysOn} of {protocol.days}</span>
        </div>
        <div className="detail-tab-bar">
          <button className={`detail-tab${tab === "summary" ? " on" : ""}`} type="button" onClick={() => onTabChange("summary")}>Summary</button>
          <button className={`detail-tab${tab === "history" ? " on" : ""}`} type="button" onClick={() => onTabChange("history")}>History</button>
        </div>
      </div>

      {tab === "summary" ? (
        <div className="detail-tab-body">
          {/* Dark hero card */}
          <div className="detail-enter" style={{ background: "linear-gradient(165deg,#0F1F38,#162D50)", borderRadius: 20, padding: "clamp(12px,4vw,20px)", marginBottom: 14, boxShadow: "0 6px 24px rgba(15,31,56,.30)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <DrRing score={patient.score} size={80} numSize={22} dark />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,.95)", marginBottom: 3 }}>{getScoreLabel(patient.score)}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.62)" }}>{patient.age}{patient.sex} · {protocol.name} · Day {patient.daysOn} of {protocol.days}</div>
                {drop > 0 ? (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, padding: "4px 10px", borderRadius: 8, background: "rgba(92,184,130,.12)", border: "1px solid rgba(92,184,130,.2)" }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "var(--doc-green)" }}>↓{drop} pts</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,.58)" }}>from {patient.baseline}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* IMSI domain bars */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: "rgba(212,32,32,.60)", textTransform: "uppercase" }}>Inflammatory</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,.60)" }}>{imsi.inflDomain}/50</span>
                  </div>
                  <div className="domain-bar"><div className="domain-bar-fill" style={{ width: domainsReady ? `${Math.round(imsi.inflDomain / 50 * 100)}%` : "0%", background: "linear-gradient(90deg,#E8772E,#D42020)" }} /></div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: "rgba(232,178,48,.60)", textTransform: "uppercase" }}>Metabolic</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,.60)" }}>{imsi.metDomain}/50</span>
                  </div>
                  <div className="domain-bar"><div className="domain-bar-fill" style={{ width: domainsReady ? `${Math.round(imsi.metDomain / 50 * 100)}%` : "0%", background: "linear-gradient(90deg,#D4A840,#E8772E)" }} /></div>
                </div>
              </div>
              {imsi.flags.length > 0 ? (
                <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 10, background: "rgba(212,32,32,.06)", border: "1px solid rgba(212,32,32,.12)", display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--doc-red)" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
                  <span style={{ fontSize: 12, color: "var(--doc-red)", fontWeight: 700 }}>{imsi.flags.join(" · ")}</span>
                </div>
              ) : null}
            </div>

            {/* Scan stepper */}
            <div style={{ display: "flex", alignItems: "center", marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.06)" }}>
              {Array.from({ length: numDots }).map((_, si) => {
                const sc = si < scanHistory.length ? scanHistory[si] : null;
                const label = ordinals[si] || `${si + 1}th`;
                return (
                  <React.Fragment key={si}>
                    {si > 0 ? <div style={{ flex: 1, height: 1.5, background: sc ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.04)" }} /> : null}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 44 }}>
                      {sc ? (
                        <>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${sc.col}22`, border: `1.5px solid ${sc.col}70`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: sc.col }}>{sc.score}</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,.58)", marginTop: 3, fontWeight: 600 }}>{label}</div>
                          {sc.date && sc.date !== "Latest" ? <div style={{ fontSize: 10, color: "rgba(255,255,255,.72)", marginTop: 1 }}>{sc.date}</div> : null}
                        </>
                      ) : (
                        <>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px dashed rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center" }} />
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,.72)", marginTop: 3, fontWeight: 600 }}>{label}</div>
                        </>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Symptom pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
            {patient.symptoms.split(", ").map((s) => (
              <div key={s} style={{ padding: "6px 12px", borderRadius: 8, background: "var(--doc-white)", boxShadow: "0 1px 2px rgba(0,0,0,.02)", fontSize: 14, fontWeight: 700, color: "var(--doc-d2)" }}>{s}</div>
            ))}
          </div>

          {/* Patient check-ins */}
          {ptSymptoms.length > 0 ? (
            <div style={{ padding: 14, borderRadius: 14, background: "rgba(232,178,48,.03)", border: "1px solid rgba(232,178,48,.08)", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--doc-gold)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--doc-gold)" }}>Patient Check-ins</div>
              </div>
              {ptSymptoms.slice(0, 2).map((sy, si) => (
                <div key={si} style={{ padding: "6px 0", borderBottom: si < Math.min(ptSymptoms.length, 2) - 1 ? "1px solid rgba(232,178,48,.06)" : "none" }}>
                  <div style={{ fontSize: 15, color: "var(--doc-d2)", lineHeight: 1.4 }}>"{sy.text}"</div>
                  <div style={{ fontSize: 11, color: "var(--doc-d4)", marginTop: 2 }}>{sy.date}</div>
                </div>
              ))}
              {ptSymptoms.length > 2 ? (
                <div style={{ fontSize: 13, color: "var(--doc-gold)", marginTop: 6, cursor: "pointer" }} onClick={() => onTabChange("history")}>+{ptSymptoms.length - 2} more in History →</div>
              ) : null}
            </div>
          ) : null}

          {/* Protocol approval panel */}
          {isHighRisk ? (
            <div style={{ padding: 18, borderRadius: 16, background: "rgba(212,32,32,.04)", border: "1.5px solid rgba(212,32,32,.12)", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--doc-red)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--doc-red)" }}>Medical Review Required</div>
              </div>
              <div style={{ fontSize: 15, color: "var(--doc-d2)", lineHeight: 1.5, marginBottom: 14 }}>Elevated markers. Review and choose an action.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button type="button" style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: "var(--doc-green)", color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "var(--doc-font)", cursor: "pointer", minHeight: 44 }} onClick={() => onApprove("approve")}>Approve Protocol</button>
                <button type="button" style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--doc-blue)", background: "rgba(59,130,200,.04)", color: "var(--doc-blue)", fontSize: 16, fontWeight: 700, fontFamily: "var(--doc-font)", cursor: "pointer", minHeight: 44 }} onClick={() => onApprove("modify")}>Modified Dose</button>
              </div>
            </div>
          ) : patient.approved ? (
            <div style={{ padding: 14, borderRadius: 12, background: "rgba(92,184,130,.04)", border: "1px solid rgba(92,184,130,.10)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--doc-green)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--doc-green)" }}>Protocol {patient.approvalType}</div>
                <div style={{ fontSize: 13, color: "var(--doc-d3)", marginTop: 1 }}>Dr. {email ? email.split("@")[0] : "Doctor"} · {patient.approvalDate}</div>
              </div>
            </div>
          ) : null}

          {/* Action panel (message / observe) */}
          {activePanel === "message" ? (
            <div className="panel-in" style={{ background: "var(--doc-white)", borderRadius: 14, padding: "clamp(14px,4.5vw,20px)", boxShadow: "0 1px 3px rgba(0,0,0,.04)", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--doc-d1)" }}>Message Patient</div>
                <button type="button" style={{ width: 44, height: 44, borderRadius: 12, background: "var(--doc-lt)", border: "none", fontSize: 18, color: "var(--doc-d3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setActivePanel(null)}>×</button>
              </div>
              {patient.patientNote ? (
                <div style={{ padding: "10px 12px", background: "var(--doc-lt)", borderRadius: 10, marginBottom: 10, borderLeft: "3px solid var(--doc-green)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--doc-green)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 2 }}>Last sent · {patient.patientNoteDate}</div>
                  <div style={{ fontSize: 13, color: "var(--doc-d3)", lineHeight: 1.4 }}>{patient.patientNote}</div>
                </div>
              ) : null}
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.currentTarget.value)}
                placeholder="Write a message to your patient..."
                style={{ width: "100%", minHeight: 90, padding: "12px 14px", border: "1.5px solid var(--doc-lt3)", borderRadius: 12, fontSize: 15, color: "var(--doc-d1)", background: "var(--doc-white)", resize: "none", lineHeight: 1.6, outline: "none", fontFamily: "var(--doc-font)" }}
              />
              <button type="button" style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", fontSize: 15, fontWeight: 700, background: "var(--doc-green)", color: "#fff", fontFamily: "var(--doc-font)", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }} onClick={submitNote}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                Send Message
              </button>
            </div>
          ) : activePanel === "observe" ? (
            <div className="panel-in" style={{ background: "var(--doc-white)", borderRadius: 24, padding: "clamp(14px,4.5vw,24px)", boxShadow: "0 1px 3px rgba(0,0,0,.02)", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--doc-d1)" }}>Record Observation</div>
                <button type="button" style={{ width: 44, height: 44, borderRadius: 12, background: "var(--doc-lt)", border: "none", fontSize: 18, color: "var(--doc-d3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setActivePanel(null)}>×</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {OBS_CHIPS.map((chip) => (
                  <button key={chip} type="button" onClick={() => toggleObsChip(chip)} style={{ padding: "9px 16px", borderRadius: 12, fontSize: 15, fontWeight: 700, border: `1.5px solid ${obsChips.includes(chip) ? "var(--doc-blue)" : "var(--doc-lt3)"}`, background: obsChips.includes(chip) ? "rgba(59,130,200,.06)" : "var(--doc-white)", color: obsChips.includes(chip) ? "var(--doc-blue)" : "var(--doc-d3)", cursor: "pointer", fontFamily: "var(--doc-font)", transition: "all .15s" }}>{chip}</button>
                ))}
              </div>
              <textarea
                value={obsNote}
                onChange={(e) => setObsNote(e.currentTarget.value)}
                placeholder="Optional note..."
                style={{ width: "100%", minHeight: 56, padding: "12px 14px", border: "1.5px solid var(--doc-lt3)", borderRadius: 12, fontSize: 15, color: "var(--doc-d1)", background: "var(--doc-white)", resize: "none", lineHeight: 1.5, outline: "none", fontFamily: "var(--doc-font)" }}
              />
              <button type="button" style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", fontSize: 15, fontWeight: 700, background: "var(--doc-blue)", color: "#fff", fontFamily: "var(--doc-font)", marginTop: 10, cursor: "pointer" }} onClick={submitObs}>Save Observation</button>
            </div>
          ) : (
            <div id="actionBtns">
              <button type="button" style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", background: "var(--doc-blue)", color: "#fff", fontFamily: "var(--doc-font)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 16, fontWeight: 700, marginBottom: 8, minHeight: 52 }} onClick={() => { setNoteText(patient.patientNote || ""); setActivePanel("message"); }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                Message Patient
              </button>
              <button type="button" style={{ width: "100%", padding: 13, borderRadius: 14, border: "1.5px solid var(--doc-lt3)", background: "var(--doc-white)", fontFamily: "var(--doc-font)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "var(--doc-d2)", marginBottom: 14 }} onClick={() => setActivePanel("observe")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--doc-d3)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Record Observation
              </button>
            </div>
          )}
        </div>
      ) : (
        /* History tab — tiered visual hierarchy */
        <div className="detail-tab-body">
          {!patient.history || patient.history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--doc-d3)", fontSize: 16 }}>No activity yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {patient.history.map((e, i) => {
                const tp = e.type;

                if (tp === "pt_scan") {
                  const m = e.text?.match(/(\d+)\s*[→—>]\s*(\d+)/);
                  const scoreTo = m ? parseInt(m[2]) : patient.score;
                  const scoreFrom = m ? parseInt(m[1]) : null;
                  const delta = scoreFrom !== null ? scoreFrom - scoreTo : null;
                  const sCol = sColDr(scoreTo);
                  const isExpanded = expandedScans.has(i);
                  return (
                    <div key={i} style={{ background: "linear-gradient(160deg,#0F1F38,#162D50)", borderRadius: 16, padding: 18 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <DrRing score={scoreTo} size={52} numSize={14} dark />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".06em", color: "rgba(255,255,255,.68)", textTransform: "uppercase" }}>Scan uploaded</span>
                            {delta !== null && delta > 0 ? <span style={{ padding: "2px 8px", borderRadius: 8, background: "rgba(92,184,130,.15)", fontSize: 12, fontWeight: 800, color: "var(--doc-green)" }}>↓{delta} pts</span> : null}
                            {delta !== null && delta < 0 ? <span style={{ padding: "2px 8px", borderRadius: 8, background: "rgba(212,32,32,.15)", fontSize: 12, fontWeight: 800, color: "var(--doc-red)" }}>↑{Math.abs(delta)} pts</span> : null}
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,.85)" }}>{e.text}</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)", marginTop: 3 }}>{e.lab || "Lab result"} · {e.date}</div>
                        </div>
                      </div>
                      {e.mk ? (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.06)" }}>
                          <button type="button" onClick={() => toggleScanMarkers(i)} style={{ background: "none", border: "none", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.62)", fontFamily: "var(--doc-font)", cursor: "pointer", padding: 0 }}>
                            {isExpanded ? "Hide markers ↑" : "View markers →"}
                          </button>
                          {isExpanded ? (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
                              {Object.entries(e.mk).map(([mk, val]) => (
                                <div key={mk} style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,.04)" }}>
                                  <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.55)", letterSpacing: ".06em", textTransform: "uppercase" }}>{MK_NAMES[mk] || mk}</div>
                                  <div style={{ fontSize: 16, fontWeight: 800, color: "rgba(255,255,255,.85)", marginTop: 2 }}>{val}</div>
                                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.75)" }}>{MK_UNITS[mk] || ""}</div>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                }

                if (tp === "pt_enroll" || tp === "pt_upgrade") {
                  const milCol = tp === "pt_upgrade" ? "var(--doc-green)" : "var(--doc-blue)";
                  const milBg = tp === "pt_upgrade" ? "rgba(92,184,130,.06)" : "rgba(59,130,200,.06)";
                  return (
                    <div key={i} style={{ background: milBg, border: `1px solid ${milCol}20`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${milCol}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {tp === "pt_upgrade"
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={milCol} strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={milCol} strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--doc-d1)" }}>{e.text}</div>
                        <div style={{ fontSize: 12, color: "var(--doc-d4)", marginTop: 2 }}>{e.date}</div>
                      </div>
                    </div>
                  );
                }

                if (tp === "pt_symptom") {
                  return (
                    <div key={i} style={{ background: "#FFFBF0", border: "1px solid rgba(232,178,48,.15)", borderRadius: 14, padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 8, background: "rgba(232,178,48,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--doc-gold)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "var(--doc-gold)", textTransform: "uppercase" }}>Patient</span>
                        <span style={{ fontSize: 11, color: "var(--doc-d4)", marginLeft: "auto" }}>{e.date}</span>
                      </div>
                      <span style={{ fontSize: 15, color: "var(--doc-d1)", lineHeight: 1.5, fontStyle: "italic" }}>"{e.text}"</span>
                    </div>
                  );
                }

                if (tp === "note") {
                  return (
                    <div key={i} style={{ background: "rgba(92,184,130,.04)", border: "1px solid rgba(92,184,130,.12)", borderRadius: 14, padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 8, background: "rgba(92,184,130,.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--doc-green)" strokeWidth="2.5"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "var(--doc-green)", textTransform: "uppercase" }}>Sent to patient</span>
                        <span style={{ fontSize: 11, color: "var(--doc-d4)", marginLeft: "auto" }}>{e.date}</span>
                      </div>
                      <div style={{ fontSize: 15, color: "var(--doc-d1)", lineHeight: 1.5 }}>{e.text}</div>
                    </div>
                  );
                }

                if (tp === "approval") {
                  return (
                    <div key={i} style={{ background: "rgba(92,184,130,.04)", border: "1px solid rgba(92,184,130,.12)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(92,184,130,.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--doc-green)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--doc-d1)" }}>Protocol {e.label || "Approved"}</div>
                        <div style={{ fontSize: 12, color: "var(--doc-d4)" }}>{e.by} · {e.date}</div>
                      </div>
                    </div>
                  );
                }

                if (tp === "obs") {
                  return (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", borderRadius: 12, background: "var(--doc-lt)" }}>
                      <div style={{ width: 18, height: 18, borderRadius: 8, background: "rgba(59,130,200,.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--doc-blue)" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: "var(--doc-d2)", lineHeight: 1.5 }}>{e.text}</div>
                        <div style={{ fontSize: 11, color: "var(--doc-d4)", marginTop: 2 }}>Clinical note · {e.date}</div>
                      </div>
                    </div>
                  );
                }

                if (tp === "pt_inactive") {
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px" }}>
                      <div style={{ width: 14, height: 14, flexShrink: 0, opacity: 0.5 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--doc-orange)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--doc-d3)" }}><span style={{ fontWeight: 600 }}>Patient inactive</span> · {e.date}</div>
                    </div>
                  );
                }

                // Utility / reminder / msg_sent
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px" }}>
                    <div style={{ width: 14, height: 14, flexShrink: 0, opacity: 0.5 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--doc-d3)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--doc-d3)" }}><span style={{ fontWeight: 600 }}>{tp === "reminder" ? "Reminder sent" : tp === "msg_sent" ? "Message sent" : tp}</span> · {e.date}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sticky action */}
      {activePanel === null ? (
        <div className="detail-sticky-action">
          <button
            type="button"
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 14,
              border: stickyGhost ? "1.5px solid var(--doc-lt3)" : "none",
              background: stickyGhost ? "var(--doc-white)" : stickyBg,
              color: stickyGhost ? "var(--doc-d2)" : "#fff",
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "var(--doc-font)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "transform .1s",
              minHeight: 52,
            }}
            onClick={() => {
              if (isHighRisk) onApprove("approve");
              else if (stickyGhost) onTabChange("history");
              else setActivePanel("message");
            }}
          >
            {stickyLabel}
          </button>
        </div>
      ) : null}
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
