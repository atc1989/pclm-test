export type ProtocolKey = "trial" | "start" | "grow" | "power";
export type PatientStatus = "review" | "improving" | "trial" | "inactive" | "steady";
export type RedeemMethod = "gcash" | "bank" | "clinic";

export type Patient = {
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
  status: PatientStatus;
};

export type Request = {
  id: string;
  name: string;
  age: number;
  sex: "F" | "M";
  score: number;
  protocol: ProtocolKey;
  source: string;
  timeLeft: string;
};

export const protocols: Record<ProtocolKey, { name: string; days: number; credits: number; price: string; scans: number }> = {
  trial: { name: "Trial", days: 5, credits: 450, price: "PHP 1,299", scans: 1 },
  start: { name: "Start", days: 15, credits: 1500, price: "PHP 4,599", scans: 1 },
  grow: { name: "Grow", days: 30, credits: 3500, price: "PHP 12,399", scans: 2 },
  power: { name: "Power", days: 90, credits: 7500, price: "PHP 34,999", scans: 3 },
};

export const patients: Patient[] = [
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

export const requests: Request[] = [
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

export const redemptionMethods: Record<RedeemMethod, { name: string; description: string; processing: string; badge?: string }> = {
  gcash: { name: "GCash", description: "Instant transfer", processing: "Instant", badge: "Most used" },
  bank: { name: "Bank Transfer", description: "1-2 business days", processing: "1-2 days" },
  clinic: { name: "Clinic Supplies", description: "Applied to next order", processing: "Next order" },
};

export function getScoreColor(score: number): string {
  if (score <= 25) return "#34a853";
  if (score <= 50) return "#d4a840";
  if (score <= 75) return "#e8772e";
  return "#d42020";
}

export function getScoreLabel(score: number): string {
  if (score <= 25) return "Optimal";
  if (score <= 50) return "Mild inflammation";
  if (score <= 75) return "Moderate inflammation";
  return "High inflammation";
}

export function imsiCalc(score: number) {
  const inflDomain = Math.min(50, Math.round(score * 0.52));
  const metDomain = Math.min(50, Math.round(score * 0.55));
  const flags: string[] = [];
  if (score >= 75) flags.push("hs-CRP >5");
  if (score >= 85) flags.push("NLR >5");
  if (score >= 90) flags.push("Glucose >125");
  return { inflDomain, metDomain, flags };
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}
