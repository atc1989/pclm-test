export type PatientHeroState = {
  ra: number;
  score: number;
  color: string;
  glow: string;
  verdict: string;
  chips: { l: string; c: string }[];
};

export const patientHeroStates: Record<"before" | "after", PatientHeroState> = {
  before: {
    ra: 266,
    score: 74,
    color: "#D42020",
    glow: "rgba(212,32,32,.5)",
    verdict: "⚠ Elevated Inflammation",
    chips: [
      { l: "hs-CRP ↑", c: "chip-hi" },
      { l: "NLR ↑", c: "chip-hi" },
      { l: "Glucose ↑", c: "chip-mid" },
      { l: "Ferritin ↑", c: "chip-mid" },
      { l: "HDL ✓", c: "chip-ok" },
      { l: "ALT ✓", c: "chip-ok" },
    ],
  },
  after: {
    ra: 111,
    score: 31,
    color: "#5CB882",
    glow: "rgba(92,184,130,.45)",
    verdict: "✓ Inflammation Controlled",
    chips: [
      { l: "hs-CRP ✓", c: "chip-ok" },
      { l: "NLR ✓", c: "chip-ok" },
      { l: "Glucose ✓", c: "chip-ok" },
      { l: "Ferritin ✓", c: "chip-ok" },
      { l: "HDL ✓", c: "chip-ok" },
      { l: "ALT ✓", c: "chip-ok" },
    ],
  },
};
