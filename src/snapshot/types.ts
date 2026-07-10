import type { ScoreLevel } from "./constants";

/**
 * The full snapshot record the team works with in the internal builder.
 *
 * Only a subset (see FOUNDER_FIELDS in encode.ts) is encoded into the
 * shareable founder link — internal notes, fit score, follow-up, and the raw
 * category scorecard never leave with the founder.
 */
export interface SnapshotData {
  // --- Founder-facing ---
  brandName: string;
  stage: string;
  currentRevenue: string;
  targetRevenue: string;
  revenueGap: string;
  primaryBottleneck: string;
  secondaryBottleneck: string;
  strongestLever: string;
  recommendedEngine: string;
  nextStep: string;
  ctaLabel: string;
  ctaNote: string;
  /** Where the CTA button points (mailto:… or an https booking link). Optional. */
  ctaUrl: string;

  // --- Internal only ---
  paidFitScore: string;
  fitStatus: string;
  internalNotes: string;
  followUpStatus: string;
  scores: Record<string, ScoreLevel>;
}

export function emptySnapshot(): SnapshotData {
  return {
    brandName: "",
    stage: "",
    currentRevenue: "",
    targetRevenue: "",
    revenueGap: "",
    primaryBottleneck: "",
    secondaryBottleneck: "",
    strongestLever: "",
    recommendedEngine: "",
    nextStep:
      "The recommended next step is a short Sold-Out Review to confirm the diagnosis and map the install path.",
    ctaLabel: "Book a Sold-Out Review Call",
    ctaNote: "A short call to confirm the diagnosis and map your install path.",
    ctaUrl:
      "mailto:toulzoned@gmail.com?subject=Sold-Out%20Review%20Call",
    paidFitScore: "",
    fitStatus: "",
    internalNotes: "",
    followUpStatus: "New",
    scores: {},
  };
}
