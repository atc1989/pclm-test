export type Markers = {
  crp: number | null;
  wbc: number | null;
  neut: number | null;
  lymph: number | null;
  glu: number | null;
  alt: number | null;
  trig: number | null;
  hdl: number | null;
};

export type ScoreResult = {
  score: number;
  inflDomain: number;
  metDomain: number;
  flags: string[];
  nlr: number;
  tyg: number;
  ok: boolean;
};

export type TierKey = "trial" | "start" | "grow" | "power";

export type Tier = {
  n: string;
  f: string;
  c: number;
  b: number;
  p: number;
  w: number;
  d: number;
  scans: number;
};

export const TIERS: Record<TierKey, Tier> = {
  trial: { n: "Trial", f: "Trial Protocol", c: 10, b: 1, p: 1299, w: 1, d: 5, scans: 1 },
  start: { n: "Start", f: "Start Protocol", c: 40, b: 4, p: 4900, w: 3, d: 20, scans: 1 },
  grow: { n: "Grow", f: "Grow Protocol", c: 120, b: 12, p: 13000, w: 6, d: 40, scans: 3 },
  power: { n: "Power", f: "Power Protocol", c: 400, b: 40, p: 39000, w: 13, d: 90, scans: 3 },
};

export function glisScore(m: Markers): ScoreResult {
  // Inflammatory Domain (50%)
  let crpPts = 0;
  if (m.crp !== null) {
    if (m.crp >= 5) crpPts = 20;
    else if (m.crp >= 3) crpPts = 15;
    else if (m.crp >= 1) crpPts = 10;
  }

  const nlr =
    m.neut !== null && m.lymph !== null && m.lymph > 0
      ? m.neut / m.lymph
      : 0;
  let nlrPts = 0;
  if (nlr > 5) nlrPts = 20;
  else if (nlr >= 3) nlrPts = 15;
  else if (nlr >= 2) nlrPts = 8;

  const inflDomain = Math.round(((crpPts + nlrPts) / 40) * 50);

  // Metabolic Domain (50%)
  let gluPts = 0, tgPts = 0, hdlPts = 0, altPts = 0;

  if (m.glu !== null) {
    gluPts = m.glu > 125 ? 18 : m.glu >= 100 ? 12 : m.glu >= 90 ? 6 : 0;
  }
  if (m.trig !== null) {
    tgPts = m.trig > 200 ? 18 : m.trig >= 150 ? 12 : m.trig >= 100 ? 6 : 0;
  }
  if (m.hdl !== null) {
    hdlPts = m.hdl < 40 ? 12 : m.hdl < 50 ? 8 : m.hdl <= 60 ? 4 : 0;
  }
  if (m.alt !== null) {
    altPts = m.alt > 60 ? 10 : m.alt >= 40 ? 6 : m.alt >= 25 ? 3 : 0;
  }

  const tyg =
    m.trig !== null && m.glu !== null && m.trig > 0 && m.glu > 0
      ? Math.log((m.trig * m.glu) / 2)
      : 0;
  const tygPts = tyg > 9.5 ? 20 : tyg >= 9 ? 15 : tyg >= 8.5 ? 8 : 0;

  const metDomain = Math.round(((gluPts + tgPts + hdlPts + tygPts + altPts) / 78) * 50);

  const score = Math.min(100, inflDomain + metDomain);

  const flags: string[] = [];
  if (m.crp !== null && m.crp > 10) flags.push("hs-CRP >10");
  if (m.glu !== null && m.glu > 180) flags.push("Glucose >180");
  if (m.alt !== null && m.alt > 100) flags.push("ALT >100");
  if (nlr > 8) flags.push("NLR >8");

  return { score, inflDomain, metDomain, flags, nlr, tyg, ok: true };
}

export function scoreColor(score: number): string {
  if (score <= 25) return "#5CB882";
  if (score <= 50) return "#E8B230";
  if (score <= 75) return "#E8772E";
  return "#D42020";
}

export function scoreBand(score: number): string {
  if (score <= 25) return "Low";
  if (score <= 50) return "Moderate";
  if (score <= 75) return "High";
  return "Critical";
}

export function suggestTier(score: number): TierKey {
  if (score <= 25) return "trial";
  if (score <= 50) return "start";
  if (score <= 75) return "grow";
  return "power";
}

export function scoreSummary(score: number): string {
  if (score <= 25)
    return "Your gut inflammation score is low. A short trial protocol is recommended to maintain your gut health.";
  if (score <= 50)
    return "Your score indicates moderate gut inflammation. A Start Protocol is recommended to address early markers.";
  if (score <= 75)
    return "Your score shows elevated gut inflammation. A Grow Protocol is recommended for sustained recovery.";
  return "Your score indicates critical gut inflammation. A Power Protocol is strongly recommended for comprehensive treatment.";
}
