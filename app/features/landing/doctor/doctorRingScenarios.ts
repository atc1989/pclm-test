export type DoctorRingScenario = {
  score: number;
  numCol: string;
  glowCol: string;
  verdict: string;
  verdictCol: string;
  desc: string;
  chips: [string, string][];
  crp: string;
  nlr: string;
  hdl: string;
  glu: string;
};

export const doctorRingScenarios: DoctorRingScenario[] = [
  {
    score: 74,
    numCol: "var(--red)",
    glowCol: "rgba(212,32,32,.5)",
    verdict: "Elevated Inflammation",
    verdictCol: "var(--red)",
    desc: "Metabolic + immune drivers. Protocol recommended.",
    chips: [
      ["CRP ↑", "hi"],
      ["NLR ↑", "mid"],
      ["Glucose ↑", "mid"],
      ["HDL ✓", "ok"],
      ["ALT ✓", "ok"],
      ["Lymph ✓", "ok"],
    ],
    crp: "8.4 ↑",
    nlr: "3.8 ↑",
    hdl: "52 ✓",
    glu: "112 ↑",
  },
  {
    score: 31,
    numCol: "var(--grn)",
    glowCol: "rgba(92,184,130,.5)",
    verdict: "Inflammation Controlled",
    verdictCol: "var(--grn)",
    desc: "Significant improvement from baseline. Re-scan in 90 days.",
    chips: [
      ["CRP ✓", "ok"],
      ["NLR ✓", "ok"],
      ["Glucose ✓", "ok"],
      ["HDL ✓", "ok"],
      ["ALT ✓", "ok"],
      ["Lymph ✓", "ok"],
    ],
    crp: "1.8 ✓",
    nlr: "2.1 ✓",
    hdl: "61 ✓",
    glu: "94 ✓",
  },
];
